// App routes

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import AdminLayout from '../components/layout/AdminLayout';
import WorkerLayout from '../components/layout/WorkerLayout';

// Auth
import LoginPage from '../pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProjects from '../pages/admin/Projects';
import AdminProjectDetail from '../pages/admin/ProjectDetail';
import AdminTasks from '../pages/admin/Tasks';
import AdminTaskDetail from '../pages/admin/TaskDetail';
import AdminWorkers from '../pages/admin/Workers';
import AdminWorkerDetail from '../pages/admin/WorkerDetail';
import AdminGitHub from '../pages/admin/GitHub';
import AdminExecutions from '../pages/admin/Executions';
import AdminExecutionDetail from '../pages/admin/ExecutionDetail';
import AdminMeetings from '../pages/admin/Meetings';
import AdminDocuments from '../pages/admin/Documents';
import AdminReports from '../pages/admin/Reports';
import AdminNotifications from '../pages/admin/Notifications';
import AdminSettings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/Profile';

// Worker Pages
import WorkerDashboard from '../pages/worker/Dashboard';
import WorkerProjects from '../pages/worker/Projects';
import WorkerProjectDetail from '../pages/worker/ProjectDetail';
import WorkerTasks from '../pages/worker/Tasks';
import WorkerTaskDetail from '../pages/worker/TaskDetail';
import WorkerSubmissions from '../pages/worker/Submissions';
import WorkerGitHub from '../pages/worker/GitHub';
import WorkerExecutions from '../pages/worker/Executions';
import WorkerExecutionDetail from '../pages/worker/ExecutionDetail';
import WorkerMeetings from '../pages/worker/Meetings';
import WorkerDocuments from '../pages/worker/Documents';
import WorkerNotifications from '../pages/worker/Notifications';
import WorkerProfile from '../pages/worker/Profile';

// Route guards
const RequireAuth = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/worker/dashboard'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/worker/dashboard'} replace /> : <LoginPage />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/:id" element={<AdminProjectDetail />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="tasks/:id" element={<AdminTaskDetail />} />
        <Route path="workers" element={<AdminWorkers />} />
        <Route path="workers/:id" element={<AdminWorkerDetail />} />
        <Route path="github" element={<AdminGitHub />} />
        <Route path="executions" element={<AdminExecutions />} />
        <Route path="executions/:id" element={<AdminExecutionDetail />} />
        <Route path="meetings" element={<AdminMeetings />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Worker */}
      <Route
        path="/worker"
        element={
          <RequireAuth role="worker">
            <WorkerLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="dashboard" element={<WorkerDashboard />} />
        <Route path="projects" element={<WorkerProjects />} />
        <Route path="projects/:id" element={<WorkerProjectDetail />} />
        <Route path="tasks" element={<WorkerTasks />} />
        <Route path="tasks/:id" element={<WorkerTaskDetail />} />
        <Route path="submissions" element={<WorkerSubmissions />} />
        <Route path="github" element={<WorkerGitHub />} />
        <Route path="executions" element={<WorkerExecutions />} />
        <Route path="executions/:id" element={<WorkerExecutionDetail />} />
        <Route path="meetings" element={<WorkerMeetings />} />
        <Route path="documents" element={<WorkerDocuments />} />
        <Route path="notifications" element={<WorkerNotifications />} />
        <Route path="profile" element={<WorkerProfile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
