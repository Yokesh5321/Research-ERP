// Worker Notifications Page

import { useState, useEffect } from 'react';
import { Bell, CheckSquare, Clock, GitBranch, CheckCircle, XCircle, Calendar, Folder, MessageSquare, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, LoadingState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { NOTIFICATIONS } from '../../data/notifications';
import { formatRelativeTime } from '../../utils/formatters';

const ICON_MAP = {
  clipboard: ClipboardList,
  clock: Clock,
  github: GitBranch,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  calendar: Calendar,
  folder: Folder,
  'message-square': MessageSquare,
};

const WorkerNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(
    NOTIFICATIONS.filter((n) => n.userId === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  );
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const markAllRead = () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markRead = (id) => {
    setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <LoadingState message="Loading notifications..." />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          unreadCount > 0 ? (
            <button onClick={markAllRead} className="btn btn-secondary btn-sm">
              <CheckSquare className="w-3.5 h-3.5" /> Mark all read
            </button>
          ) : null
        }
      />

      <div className="flex gap-1 mb-4">
        {['all', 'unread', 'read'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost text-gray-600'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No {filter === 'all' ? '' : filter} notifications</p>
          </div>
        ) : (
          filtered.map((n) => {
            const Icon = ICON_MAP[n.icon] || Bell;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                onClick={() => markRead(n.id)}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${!n.read ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatRelativeTime(n.timestamp)}</span>
                      {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WorkerNotifications;
