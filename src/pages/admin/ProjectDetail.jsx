// Admin Project Detail Page

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Calendar, Users, GitCommit } from 'lucide-react';
import { LoadingState, EmptyState, PageHeader, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS } from '../../data/projects';
import { TASKS } from '../../data/tasks';
import { WORKERS } from '../../data/users';
import { GITHUB_COMMITS } from '../../data/github';
import { MEETINGS } from '../../data/meetings';
import { DOCUMENTS } from '../../data/documents';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));

const TABS = ['Overview', 'Tasks', 'Team', 'GitHub', 'Documents', 'Meetings'];

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');

  const project = PROJECTS.find((p) => p.id === id);
  const tasks = TASKS.filter((t) => t.project === id);
  const teamMembers = (project?.team || []).map((tid) => workerMap[tid]).filter(Boolean);
  const commits = GITHUB_COMMITS.filter((c) => c.repo === project?.githubRepo);
  const meetings = MEETINGS.filter((m) => m.project === id);
  const documents = DOCUMENTS.filter((d) => d.project === id);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState />;
  if (!project) return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <EmptyState title="Project not found" message="The project you're looking for doesn't exist." />
    </div>
  );

  const manager = workerMap[project.manager];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/admin/projects')} className="btn btn-ghost btn-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Projects
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600">{project.name}</span>
      </div>

      {/* Header */}
      <div className="card mb-4 p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <StatusBadge type="project" value={project.status} />
              <StatusBadge type="priority" value={project.priority} />
              <span className="badge badge-gray">{project.category}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">{project.description}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Project Manager</p>
            <div className="flex items-center gap-2">
              <Avatar name={manager?.name} size="sm" />
              <span className="text-sm font-medium text-gray-700">{manager?.name || '—'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Timeline</p>
            <p className="text-sm text-gray-700">{formatDate(project.startDate)} → {formatDate(project.endDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <ProgressBar value={project.progress} className="flex-1" />
              <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">GitHub Repo</p>
            {project.githubRepo ? (
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-blue-600 font-mono">{project.githubRepo}</span>
              </div>
            ) : <span className="text-sm text-gray-400">Not linked</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab-link ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Task Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center"><p className="text-2xl font-semibold text-gray-900">{tasks.length}</p><p className="text-xs text-gray-500">Total Tasks</p></div>
                <div className="text-center"><p className="text-2xl font-semibold text-green-600">{tasks.filter((t) => t.status === 'completed').length}</p><p className="text-xs text-gray-500">Completed</p></div>
                <div className="text-center"><p className="text-2xl font-semibold text-blue-600">{tasks.filter((t) => t.status === 'in_progress').length}</p><p className="text-xs text-gray-500">In Progress</p></div>
              </div>
            </div>
            {project.description_long && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">About this Project</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{project.description_long}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Team ({teamMembers.length})</h3>
              <div className="space-y-2">
                {teamMembers.map((w) => (
                  <div key={w.id} className="flex items-center gap-2">
                    <Avatar name={w.name} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">{w.name}</p>
                      <p className="text-xs text-gray-400">{w.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Tasks' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Progress</th></tr></thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No tasks for this project</td></tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id}>
                      <td><Link to={`/admin/tasks/${t.id}`} className="text-blue-600 hover:underline text-xs font-medium">{t.title}</Link></td>
                      <td className="text-xs">{workerMap[t.assignedTo]?.name || '—'}</td>
                      <td><StatusBadge type="priority" value={t.priority} /></td>
                      <td><StatusBadge type="task" value={t.status} /></td>
                      <td className="text-xs text-gray-500">{formatDate(t.dueDate)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ProgressBar value={t.progress} className="w-16" />
                          <span className="text-xs text-gray-500">{t.progress}%</span>
                        </div>
                      </td>
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
                <p className="text-sm font-semibold text-gray-800">{w.name}</p>
                <p className="text-xs text-gray-500">{w.designation} · {w.department}</p>
                <p className="text-xs text-gray-400 mt-1">{w.email}</p>
                <div className="mt-2">
                  <Link to={`/admin/workers/${w.id}`} className="text-xs text-blue-600 hover:underline">View profile →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'GitHub' && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span className="text-sm font-semibold">{project.githubRepo || 'No repository linked'}</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {commits.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">No commits for this project</div>
            ) : (
              commits.map((c) => (
                <div key={c.id} className="px-6 py-3 flex items-start gap-3">
                  <Avatar name={c.authorName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800">{c.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{c.sha} · {c.branch} · {c.authorName} · {formatRelativeTime(c.timestamp)}</p>
                  </div>
                  <StatusBadge type="github" value={c.status} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'Documents' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Name</th><th>Category</th><th>Uploaded By</th><th>Version</th><th>Date</th></tr></thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400">No documents</td></tr>
                ) : (
                  documents.map((d) => (
                    <tr key={d.id}>
                      <td className="text-xs font-medium text-blue-600">{d.name}</td>
                      <td><span className="badge badge-gray">{d.category}</span></td>
                      <td className="text-xs">{d.uploadedBy === 'admin-001' ? 'Admin' : workerMap[d.uploadedBy]?.name || '—'}</td>
                      <td className="text-xs">v{d.version}</td>
                      <td className="text-xs text-gray-500">{formatDate(d.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Meetings' && (
        <div className="space-y-3">
          {meetings.length === 0 ? (
            <EmptyState title="No meetings" message="No meetings scheduled for this project." />
          ) : (
            meetings.map((m) => (
              <div key={m.id} className="card p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge type="meeting" value={m.status} />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(m.date)} · {m.time} · {m.duration} min · {m.participants.length} participants</p>
                  {m.notes && <p className="text-xs text-gray-400 mt-1 italic">{m.notes}</p>}
                </div>
                {m.meetingLink && (
                  <a href={m.meetingLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm flex-shrink-0">Join</a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProjectDetail;
