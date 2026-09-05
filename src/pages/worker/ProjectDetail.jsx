// Worker Project Detail - reuse admin detail but with worker prefix

import AdminProjectDetail from '../admin/ProjectDetail';

// The worker project detail uses same data view but different navigation prefix
// We override by providing a worker-scoped version

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { LoadingState, EmptyState, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS } from '../../data/projects';
import { TASKS } from '../../data/tasks';
import { WORKERS } from '../../data/users';
import { GITHUB_COMMITS } from '../../data/github';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const TABS = ['Overview', 'My Tasks', 'Team', 'GitHub'];

const WorkerProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');

  const project = PROJECTS.find((p) => p.id === id);
  const userId = user?.id || 'w-001';
  const myTasks = TASKS.filter((t) => t.project === id && t.assignedTo === userId);
  const allTasks = TASKS.filter((t) => t.project === id);
  const teamMembers = (project?.team || []).map((tid) => workerMap[tid]).filter(Boolean);
  const commits = GITHUB_COMMITS.filter((c) => c.repo === project?.githubRepo);
  const manager = project ? workerMap[project.manager] : null;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState />;
  if (!project) return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <EmptyState title="Project not found" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/worker/projects')} className="btn btn-ghost btn-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> My Projects
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600 truncate">{project.name}</span>
      </div>

      {/* Header */}
      <div className="card mb-4 p-5">
        <div className="flex flex-wrap gap-2 mb-2">
          <StatusBadge type="project" value={project.status} />
          <StatusBadge type="priority" value={project.priority} />
          <span className="badge badge-gray">{project.category}</span>
          {project.manager === userId && <span className="badge badge-purple">You are the Manager</span>}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl">{project.description}</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Manager</p>
            <div className="flex items-center gap-2"><Avatar name={manager?.name} size="sm" /><span className="text-sm text-gray-700">{manager?.name || '—'}</span></div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Timeline</p>
            <p className="text-sm text-gray-700">{formatDate(project.startDate)} → {formatDate(project.endDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Progress</p>
            <div className="flex items-center gap-2"><ProgressBar value={project.progress} className="flex-1" /><span className="text-sm font-medium">{project.progress}%</span></div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">My Tasks</p>
            <p className="text-sm font-medium text-gray-700">{myTasks.length} assigned</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`tab-link ${tab === t ? 'active' : ''}`}>{t}</button>)}
      </div>

      {tab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Task Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-2xl font-semibold text-gray-900">{allTasks.length}</p><p className="text-xs text-gray-500">Total</p></div>
                <div className="text-center"><p className="text-2xl font-semibold text-green-600">{allTasks.filter((t) => t.status === 'completed').length}</p><p className="text-xs text-gray-500">Completed</p></div>
                <div className="text-center"><p className="text-2xl font-semibold text-blue-600">{myTasks.length}</p><p className="text-xs text-gray-500">Assigned to me</p></div>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Team ({teamMembers.length})</h3>
            <div className="space-y-2">
              {teamMembers.map((w) => (
                <div key={w.id} className="flex items-center gap-2">
                  <Avatar name={w.name} size="sm" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{w.name} {w.id === userId ? '(You)' : ''}</p>
                    <p className="text-xs text-gray-400">{w.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'My Tasks' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Task</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Progress</th><th>Actions</th></tr></thead>
              <tbody>
                {myTasks.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No tasks assigned to you in this project</td></tr>
                ) : (
                  myTasks.map((t) => (
                    <tr key={t.id}>
                      <td className="text-xs font-medium text-gray-800">{t.title}</td>
                      <td><StatusBadge type="priority" value={t.priority} /></td>
                      <td><StatusBadge type="task" value={t.status} /></td>
                      <td className="text-xs text-gray-500">{formatDate(t.dueDate)}</td>
                      <td><div className="flex items-center gap-2"><ProgressBar value={t.progress} className="w-16" /><span className="text-xs">{t.progress}%</span></div></td>
                      <td><Link to={`/worker/tasks/${t.id}`} className="btn btn-secondary btn-sm">View</Link></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((w) => (
            <div key={w.id} className="card p-4 flex items-start gap-3">
              <Avatar name={w.name} size="md" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{w.name} {w.id === userId ? <span className="text-xs font-normal text-blue-600">(You)</span> : ''}</p>
                <p className="text-xs text-gray-500">{w.designation}</p>
                <p className="text-xs text-gray-400">{w.department}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'GitHub' && (
        <div className="card divide-y divide-gray-100">
          {commits.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-400">No commits</div>
          ) : (
            commits.map((c) => (
              <div key={c.id} className="px-6 py-3 flex items-start gap-3">
                <Avatar name={c.authorName} size="sm" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">{c.message}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{c.sha} · {c.branch} · {formatRelativeTime(c.timestamp)}</p>
                </div>
                <StatusBadge type="github" value={c.status} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerProjectDetail;
