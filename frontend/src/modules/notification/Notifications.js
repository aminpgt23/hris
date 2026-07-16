import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import './Notifications.css';

const typeBadge = {
  Sent: <Badge variant="info" dot>Info</Badge>,
  Read: <Badge variant="neutral" dot>Read</Badge>,
  Failed: <Badge variant="danger" dot>Failed</Badge>,
};

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.data || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      toast.info('Marked as read');
      loadNotifications();
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      toast.success('All notifications marked as read');
      loadNotifications();
    } catch { /* silent */ }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with system alerts and approvals</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <DoneAllIcon fontSize="small" /> Mark All Read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={loadNotifications}>
            <RefreshIcon fontSize="small" />
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="notif-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">No notifications</div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`notif-item ${n.status !== 'Read' ? 'notif-unread' : ''}`}
                onClick={() => n.status !== 'Read' && markRead(n.id)}
                style={{ cursor: n.status !== 'Read' ? 'pointer' : 'default' }}
              >
                <div className="notif-indicator" />
                <div className="notif-content">
                  <div className="notif-title-row">
                    <span className="notif-title">{n.title}</span>
                    {typeBadge[n.status] || <Badge variant="info">{n.status}</Badge>}
                  </div>
                  <p className="notif-message">{n.message}</p>
                  <span className="notif-time">{formatTime(n.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
