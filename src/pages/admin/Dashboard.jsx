// Admin Dashboard

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, CheckSquare, Users, GitCommit, Calendar, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { StatCard, LoadingState, PageHeader, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS } from '../../data/projects';
import { TASKS } from '../../data/tasks';
import { WORKERS } from '../../data/users';
import { GITHUB_COMMITS } from '../../data/github';
import { MEETINGS } from '../../data/meetings';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

const projectProgressData = PROJECTS.map((p) => ({
  name: p.name.split(' ').slice(0, 3).join(' '),
  progress: p.progress,
}));

const taskStatusData = [
  { name: 'Completed', value: TASKS.filter((t) => t.status === 'completed').length, color: '#16a34a' },
  { name: 'In Progress', value: TASKS.filter((t) => t.status === 'in_progress').length, color: '#7c3aed' },
  { name: 'Assigned', value: TASKS.filter((t) => t.status === 'assigned').length, color: '#2563eb' },
  { name: 'Not Started', value: TASKS.filter((t) => t.status === 'not_started').length, color: '#9ca3af' },
];

const monthlyData = [
  { month: 'Mar', tasks: 3, commits: 12 },
  { month: 'Apr', tasks: 5, commits: 18 },
  { month: 'May', tasks: 4, commits: 14 },
  { month: 'Jun', tasks: 6, commits: 21 },
  { month: 'Jul', tasks: 3, commits: 16 },
  { month: 'Aug', tasks: 5, commits: 24 },
  { month: 'Sep', tasks: 2, commits: 8 },
];

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const totalProjects = PROJECTS.length;
  const activeProjects = PROJECTS.filter((p) => p.status === 'active').length;
  const completedProjects = PROJECTS.filter((p) => p.status === 'completed').length;
  const totalWorkers = WORKERS.length;
  const pendingTasks = TASKS.filter((t) => !['completed', 'failed'].includes(t.status)).length;
  const completedTasks = TASKS.filter((t) => t.status === 'completed').length;

  const recentProjects = [...PROJECTS].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  const recentTasks = [...TASKS].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)).slice(0, 5);
  const upcomingMeetings = MEETINGS.filter((m) => m.status === 'upcoming').slice(0, 4);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of all research activities" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total Projects" value={totalProjects} icon={FolderOpen} color="blue" />
        <StatCard label="Active Projects" value={activeProjects} icon={FolderOpen} color="green" />
        <StatCard label="Completed" value={completedProjects} icon={FolderOpen} color="gray" />
        <StatCard label="Total Workers" value={totalWorkers} icon={Users} color="purple" />
        <StatCard label="Pending Tasks" value={pendingTasks} icon={CheckSquare} color="yellow" />
        <StatCard label="Done Tasks" value={completedTasks} icon={CheckSquare} color="green" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Project Progress */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-800">Project Progress</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projectProgressData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip formatter={(v) => [`${v}%`, 'Progress']} />
                <Bar dataKey="progress" fill="#2563eb" radius={[0, 3, 3, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-800">Task Status</h3>
          </div>
          <div className="card-body flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
                  {taskStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
              {taskStatusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-800">Monthly Activity (Tasks & Commits)</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="tasks" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Tasks Completed" />
              <Line type="monotone" dataKey="commits" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} name="GitHub Commits" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Recent Projects</h3>
            <Link to="/admin/projects" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/admin/projects/${p.id}`} className="text-blue-600 hover:underline font-medium text-xs">
                        {p.name.length > 35 ? p.name.slice(0, 35) + '...' : p.name}
                      </Link>
                    </td>
                    <td><StatusBadge type="project" value={p.status} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={p.progress} className="w-16" />
                        <span className="text-xs text-gray-500">{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Recent Tasks</h3>
            <Link to="/admin/tasks" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/admin/tasks/${t.id}`} className="text-blue-600 hover:underline font-medium text-xs">
                        {t.title.length > 30 ? t.title.slice(0, 30) + '...' : t.title}
                      </Link>
                    </td>
                    <td className="text-xs text-gray-600">{workerMap[t.assignedTo]?.name || '—'}</td>
                    <td><StatusBadge type="task" value={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GitHub Activity */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Recent GitHub Activity</h3>
            <Link to="/admin/github" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {GITHUB_COMMITS.slice(0, 4).map((c) => (
              <div key={c.id} className="px-6 py-3 flex items-start gap-3">
                <Avatar name={c.authorName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{c.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.authorName} · <span className="font-mono">{c.sha}</span> · {c.repo.split('/')[1]}</p>
                </div>
                <StatusBadge type="github" value={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Upcoming Meetings</h3>
            <Link to="/admin/meetings" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingMeetings.map((m) => (
              <div key={m.id} className="px-6 py-3 flex items-start gap-3">
                <div className="bg-blue-50 rounded-md p-1.5 flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.date)} · {m.time} · {m.duration}min</p>
                </div>
                <span className="text-xs text-gray-400">{m.participants.length} attendees</span>
              </div>
            ))}
            {upcomingMeetings.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No upcoming meetings</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
