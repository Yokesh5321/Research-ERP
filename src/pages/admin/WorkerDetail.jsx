// Admin Worker Detail Page

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, GitBranch } from 'lucide-react';
import { LoadingState, EmptyState, PageHeader, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { WORKERS } from '../../data/users';
import { PROJECTS } from '../../data/projects';
import { TASKS } from '../../data/tasks';
import { GITHUB_COMMITS } from '../../data/github';
import { formatDate } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const TABS = ['Profile', 'Projects', 'Tasks', 'GitHub Activity', 'Performance'];

const AdminWorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Profile');

  const worker = WORKERS.find((w) => w.id === id);
  const projects = PROJECTS.filter((p) => p.team.includes(id) || p.manager === id);
  const tasks = TASKS.filter((t) => t.assignedTo === id);
  const commits = GITHUB_COMMITS.filter((c) => c.author === id);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState />;
  if (!worker) return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <EmptyState title="Worker not found" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/admin/workers')} className="btn btn-ghost btn-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Workers
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600">{worker.name}</span>
      </div>

      {/* Profile Card */}
      <div className="card p-5 mb-4 flex items-start gap-5 flex-wrap">
        <Avatar name={worker.name} size="xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h2 className="text-lg font-semibold text-gray-900">{worker.name}</h2>
            <StatusBadge type="user" value={worker.status} />
          </div>
          <p className="text-sm text-gray-500">{worker.designation} · {worker.department}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-500"><Mail className="w-4 h-4" />{worker.email}</div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500"><Phone className="w-4 h-4" />{worker.phone}</div>
            {worker.githubUsername && <div className="flex items-center gap-1.5 text-sm text-gray-500"><GitBranch className="w-4 h-4" />{worker.githubUsername}</div>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {worker.skills.map((s) => <span key={s} className="badge badge-blue">{s}</span>)}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Performance</p>
          <p className="text-2xl font-bold text-blue-700">{worker.performance}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Overall Score</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab-link ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      {tab === 'Profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Summary Stats</h3>
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Projects</dt><dd className="text-sm font-semibold text-gray-800">{projects.length}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Active Tasks</dt><dd className="text-sm font-semibold text-blue-600">{worker.activeTasks}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Completed Tasks</dt><dd className="text-sm font-semibold text-green-600">{worker.completedTasks}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Join Date</dt><dd className="text-sm text-gray-700">{formatDate(worker.joinDate)}</dd></div>
            </dl>
          </div>
          <div className="md:col-span-2 card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((s) => <span key={s} className="badge badge-blue">{s}</span>)}
            </div>
          </div>
        </div>
      )}

      {tab === 'Projects' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Project</th><th>Role</th><th>Status</th><th>Progress</th><th>Deadline</th></tr></thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No projects</td></tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id}>
                      <td><Link to={`/admin/projects/${p.id}`} className="text-blue-600 hover:underline text-xs font-medium">{p.name}</Link></td>
                      <td className="text-xs text-gray-500">{p.manager === id ? 'Project Manager' : 'Team Member'}</td>
                      <td><StatusBadge type="project" value={p.status} /></td>
                      <td><div className="flex items-center gap-2"><ProgressBar value={p.progress} className="w-16" /><span className="text-xs text-gray-500">{p.progress}%</span></div></td>
                      <td className="text-xs text-gray-500">{formatDate(p.endDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Tasks' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Progress</th></tr></thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No tasks assigned</td></tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id}>
                      <td><Link to={`/admin/tasks/${t.id}`} className="text-blue-600 hover:underline text-xs font-medium">{t.title}</Link></td>
                      <td><StatusBadge type="priority" value={t.priority} /></td>
                      <td><StatusBadge type="task" value={t.status} /></td>
                      <td className="text-xs text-gray-500">{formatDate(t.dueDate)}</td>
                      <td><div className="flex items-center gap-2"><ProgressBar value={t.progress} className="w-16" /><span className="text-xs">{t.progress}%</span></div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'GitHub Activity' && (
        <div className="card divide-y divide-gray-100">
          {commits.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400">No GitHub activity</div>
          ) : (
            commits.map((c) => (
              <div key={c.id} className="px-6 py-3 flex items-start gap-3">
                <Avatar name={c.authorName} size="sm" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">{c.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{c.sha} · {c.repo} · {c.branch}</p>
                </div>
                <StatusBadge type="github" value={c.status} />
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'Performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Performance Score</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1"><span className="text-xs text-gray-600">Overall</span><span className="text-xs font-medium">{worker.performance}%</span></div>
                <ProgressBar value={worker.performance} />
              </div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-xs text-gray-600">Task Completion Rate</span><span className="text-xs font-medium">{Math.round(worker.completedTasks / (worker.completedTasks + worker.activeTasks + 1) * 100)}%</span></div>
                <ProgressBar value={Math.round(worker.completedTasks / (worker.completedTasks + worker.activeTasks + 1) * 100)} />
              </div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-xs text-gray-600">GitHub Activity</span><span className="text-xs font-medium">{Math.min(100, commits.length * 15)}%</span></div>
                <ProgressBar value={Math.min(100, commits.length * 15)} />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Activity Summary</h3>
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Total Commits</dt><dd className="text-sm font-semibold">{commits.length}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Tasks Completed</dt><dd className="text-sm font-semibold text-green-600">{worker.completedTasks}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Active Tasks</dt><dd className="text-sm font-semibold text-blue-600">{worker.activeTasks}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Projects</dt><dd className="text-sm font-semibold">{projects.length}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkerDetail;
