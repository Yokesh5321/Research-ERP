// Admin Layout

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Header from './Header';

const PAGE_TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/projects': 'Projects',
  '/admin/tasks': 'Tasks',
  '/admin/workers': 'Students & Workers',
  '/admin/github': 'GitHub',
  '/admin/executions': 'Code Executions',
  '/admin/meetings': 'Meetings',
  '/admin/documents': 'Documents',
  '/admin/reports': 'Reports',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
  '/admin/profile': 'Profile',
};

const getTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const parts = pathname.split('/');
  if (parts.length >= 4) {
    const section = parts[2];
    return PAGE_TITLES[`/admin/${section}`] ? `${PAGE_TITLES[`/admin/${section}`]} Detail` : 'Detail';
  }
  return 'Research ERP';
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={title}
          prefix="admin"
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

