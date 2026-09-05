// Admin Sidebar

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, CheckSquare, Users, GitBranch, Terminal,
  Video, FileText, BarChart2, Bell, Settings, LogOut, User, ChevronLeft, ChevronRight, Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';
import { NOTIFICATIONS } from '../../data/notifications';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { to: '/admin/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/admin/workers', icon: Users, label: 'Students / Workers' },
  { to: '/admin/github', icon: GitBranch, label: 'GitHub' },
  { to: '/admin/executions', icon: Terminal, label: 'Code Executions' },
  { to: '/admin/meetings', icon: Video, label: 'Meetings' },
  { to: '/admin/documents', icon: FileText, label: 'Documents' },
  { to: '/admin/reports', icon: BarChart2, label: 'Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unread = NOTIFICATIONS.filter((n) => n.userId === 'admin-001' && !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-200 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center flex-shrink-0">
          <Database className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">Research ERP</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
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
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-gray-200 space-y-0.5">
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
          }
          title={collapsed ? 'Profile' : undefined}
        >
          <User className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ChevronLeft className="w-3 h-3 text-gray-500" />}
      </button>
    </aside>
  );
};

export default AdminSidebar;
