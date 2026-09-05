// Header component

import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';
import { NOTIFICATIONS } from '../../data/notifications';

const Header = ({ title, prefix = 'admin' }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const unread = NOTIFICATIONS.filter((n) => n.userId === userId && !n.read).length;

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Link
          to={`/${prefix}/notifications`}
          className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </Link>

        {/* User */}
        <Link
          to={`/${prefix}/profile`}
          className="flex items-center gap-2.5 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
        >
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-gray-800 leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.designation || user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
