// Worker Sidebar

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, CheckSquare, Upload, GitBranch, Terminal,
  Video, FileText, Bell, LogOut, User, ChevronLeft, ChevronRight, Database, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NOTIFICATIONS } from '../../data/notifications';

const NAV_ITEMS = [
  { to: '/worker/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/worker/projects', icon: FolderOpen, label: 'My Projects' },
  { to: '/worker/tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/worker/submissions', icon: Upload, label: 'Submissions' },
  { to: '/worker/github', icon: GitBranch, label: 'GitHub' },
  { to: '/worker/executions', icon: Terminal, label: 'Code Executions' },
  { to: '/worker/meetings', icon: Video, label: 'Meetings' },
  { to: '/worker/documents', icon: FileText, label: 'Documents' },
  { to: '/worker/notifications', icon: Bell, label: 'Notifications' },
];

const WorkerSidebar = ({ collapsed, onToggle, mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || 'w-001';
  const unread = NOTIFICATIONS.filter((n) => n.userId === userId && !n.read).length;

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-200
          md:static md:z-auto
          ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'md:w-16' : 'md:w-60'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between px-4 py-4 border-b border-gray-200 ${collapsed ? 'md:justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4 text-white" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">Research ERP</p>
                <p className="text-xs text-gray-400">Student / Worker</p>
              </div>
            )}
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="p-1 text-gray-400 hover:text-gray-600 md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'md:justify-center md:px-2' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <div className="relative">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label === 'Notifications' && unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </div>
              {(!collapsed || mobileOpen) && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-gray-200 space-y-0.5">
          <NavLink
            to="/worker/profile"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'md:justify-center md:px-2' : ''}`
            }
            title={collapsed ? 'Profile' : undefined}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Profile</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? 'md:justify-center md:px-2' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>

        {/* Desktop Collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ChevronLeft className="w-3 h-3 text-gray-500" />}
        </button>
      </aside>
    </>
  );
};

export default WorkerSidebar;

