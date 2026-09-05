// Worker Layout

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import WorkerSidebar from './WorkerSidebar';
import Header from './Header';

const PAGE_TITLES = {
  '/worker/dashboard': 'Dashboard',
  '/worker/projects': 'My Projects',
  '/worker/tasks': 'My Tasks',
  '/worker/submissions': 'Submissions',
  '/worker/github': 'GitHub',
  '/worker/executions': 'Code Executions',
  '/worker/meetings': 'Meetings',
  '/worker/documents': 'Documents',
  '/worker/notifications': 'Notifications',
  '/worker/profile': 'Profile',
};

const getTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const parts = pathname.split('/');
  if (parts.length >= 4) {
    const section = parts[2];
    return PAGE_TITLES[`/worker/${section}`] ? `${PAGE_TITLES[`/worker/${section}`]} Detail` : 'Detail';
  }
  return 'Research ERP';
};

const WorkerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <WorkerSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} prefix="worker" />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WorkerLayout;
