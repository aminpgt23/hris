import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Button } from '../../components/ui';
import './FaceCaptureModal.css';

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/dist/face-api.js';
const MODEL_URL = `${process.env.PUBLIC_URL || ''}/models/tiny_face_detector`;
const DETECT_TIMEOUT_MS = 8000;

// Load face-api from CDN once, retrying if a previous attempt left a broken script tag.
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-face-api]');
    if (existing) {
      if (existing.dataset.ready) return resolve(window.faceapi);
      // Stale tag from a failed/aborted load — remove and start fresh.
      existing.remove();
    }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.faceApi = '1';
    script.onload = () => {
      if (!window.faceapi) {
        reject(new Error('face-api loaded but global is missing'));
        return;
      }
      script.dataset.ready = '1';
      resolve(window.faceapi);
    };
    script.onerror = () => reject(new Error('Failed to load face-api script (network/CSP blocked?)'));
    document.head.appendChild(script);
  });
}

export default function FaceCaptureModal({ open, onClose, onSubmit, submitting }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectRafRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState('');
  const [detectTimedOut, setDetectTimedOut] = useState(false);
  const [captured, setCaptured] = useState(null);
  const [location, setLocation] = useState(null);
  const [geoError, setGeoError] = useState('');

  const stopCamera = useCallback(() => {
    if (detectRafRef.current) {
      cancelAnimationFrame(detectRafRef.current);
      detectRafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setModelError('Camera access denied. Please allow camera permission.');
    }
  }, []);

  const initFaceApi = useCallback(async () => {
    try {
      const faceapi = await loadScript(FACE_API_CDN);
      if (!faceapi) throw new Error('face-api not available');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setModelLoaded(true);
    } catch (e) {
      // Detection is advisory only — selfie photo is still the proof.
      setModelError('Face detection unavailable - proceeding with selfie only.');
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    initFaceApi();
    startCamera();
    return () => stopCamera();
  }, [open, initFaceApi, startCamera, stopCamera]);

  // Detection loop — must never die. Guards video readiness, catches every error,
  // and always reschedules itself until captured.
  const detectLoop = useCallback(async () => {
    detectRafRef.current = null;
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      detectRafRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    const faceapi = window.faceapi;
    if (!faceapi || !modelLoaded) {
      detectRafRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    try {
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
      );
      setFaceDetected(detections.length > 0);
    } catch {
      // Model/backend hiccup — keep trying, detection is advisory.
    } finally {
      if (!captured) detectRafRef.current = requestAnimationFrame(detectLoop);
    }
  }, [modelLoaded, captured]);

  useEffect(() => {
    if (!open || !modelLoaded) return;
    setDetectTimedOut(false);
    detectRafRef.current = requestAnimationFrame(detectLoop);
    const timer = setTimeout(() => {
      // No face found in time — fall back to selfie-only instead of blocking.
      if (!captured && !faceDetected) setDetectTimedOut(true);
    }, DETECT_TIMEOUT_MS);
    return () => {
      cancelAnimationFrame(detectRafRef.current);
      clearTimeout(timer);
    };
  }, [open, modelLoaded, detectLoop, captured, faceDetected]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError('');
      },
      () => setGeoError('Location unavailable - proceeding without GPS'),
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  useEffect(() => { if (open) getLocation(); }, [open]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  };

  const handleRetake = () => {
    setCaptured(null);
    setFaceDetected(false);
    setDetectTimedOut(false);
    startCamera();
  };

  const handleSubmit = () => {
    onSubmit({
      photo: captured,
      location_lat: location?.lat ?? null,
      location_lng: location?.lng ?? null,
      location_name: location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : null,
      geoError,
    });
  };

  const handleClose = () => {
    stopCamera();
    setCaptured(null);
    setFaceDetected(false);
    setDetectTimedOut(false);
    setGeoError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Face Recognition Check-in" size="md">
      <div className="face-capture">
        {captured ? (
          <div className="face-preview">
            <img src={captured} alt="Captured face" />
            {faceDetected ? (
              <p className="face-verified">
                <span className="face-verified-dot" /> Face detected - ready to submit
              </p>
            ) : (
              <p className="face-geo">Selfie captured - you can submit below</p>
            )}
          </div>
        ) : (
          <div className="face-video-wrap">
            <video ref={videoRef} className="face-video" playsInline muted />
            {modelLoaded && (
              <div className={`face-status ${faceDetected ? 'ok' : 'waiting'}`}>
                {faceDetected ? 'Face detected' : 'Position your face in the frame...'}
              </div>
            )}
          </div>
        )}

        {modelError && <p className="face-error">{modelError}</p>}
        {detectTimedOut && !captured && (
          <p className="face-error">Face not detected yet - you can still capture and submit your selfie.</p>
        )}
        {geoError && <p className="face-geo">{geoError}</p>}
        {location && !geoError && (
          <p className="face-geo ok">GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
        )}

        <div className="face-actions">
          {captured ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleRetake}>Retake</Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting}>
                Submit Check-in
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={handleCapture}>
              Capture Selfie
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
