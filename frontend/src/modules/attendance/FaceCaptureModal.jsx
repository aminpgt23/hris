import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Modal, Button } from '../../components/ui';
import './FaceCaptureModal.css';

const FACE_API_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/dist/face-api.js';
const MODEL_URL = `${process.env.PUBLIC_URL || ''}/models/tiny_face_detector`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-face-api]');
    if (existing) return resolve(existing.dataset.ready ? window.faceapi : undefined);
    const script = document.createElement('script');
    script.src = src;
    script.dataset.faceApi = '1';
    script.onload = () => { script.dataset.ready = '1'; resolve(window.faceapi); };
    script.onerror = () => reject(new Error('Failed to load face-api script'));
    document.head.appendChild(script);
  });
}

export default function FaceCaptureModal({ open, onClose, onSubmit, submitting }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState('');
  const [captured, setCaptured] = useState(null);
  const [location, setLocation] = useState(null);
  const [geoError, setGeoError] = useState('');

  const stopCamera = useCallback(() => {
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
      if (!faceapi) return;
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setModelLoaded(true);
    } catch {
      setModelError('Face detection unavailable - proceeding with selfie only.');
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    initFaceApi();
    startCamera();
    return () => stopCamera();
  }, [open, initFaceApi, startCamera, stopCamera]);

  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !modelLoaded) return;
    const faceapi = window.faceapi;
    if (!faceapi) return;
    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .catch(() => []);
    setFaceDetected(detections.length > 0);
    if (!captured) requestAnimationFrame(detectLoop);
  }, [modelLoaded, captured]);

  useEffect(() => {
    if (open && modelLoaded) {
      const id = requestAnimationFrame(detectLoop);
      return () => cancelAnimationFrame(id);
    }
  }, [open, modelLoaded, detectLoop]);

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
    setGeoError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Face Recognition Check-in" size="md">
      <div className="face-capture">
        {captured ? (
          <div className="face-preview">
            <img src={captured} alt="Captured face" />
            {faceDetected && (
              <p className="face-verified">
                <span className="face-verified-dot" /> Face detected - ready to submit
              </p>
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
        {geoError && <p className="face-geo">{geoError}</p>}
        {location && !geoError && (
          <p className="face-geo ok">GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
        )}

        <div className="face-actions">
          {captured ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleRetake}>Retake</Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting} disabled={!faceDetected && !modelError}>
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
