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
import { api } from '../../services/api';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));

const TABS = ['Overview', 'Student Interns', 'GitHub', 'Documents', 'Meetings'];

const AdminProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.projects.getById(id);
        if (res && res.success && res.data) {
          setProject(res.data);
          return;
        }
      } catch (err) {
        console.warn('API getById project error:', err);
      }
      const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
      const found = localCustom.find((p) => p.id === id) || PROJECTS.find((p) => p.id === id);
      setProject(found || null);
    };

    fetchProject().finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState />;
  if (!project) return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <EmptyState title="Team / Project not found" message="The team or project you're looking for doesn't exist." />
    </div>
  );

  const managerId = project.manager || project.manager_id;
  const startDate = project.startDate || project.start_date;
  const endDate = project.endDate || project.end_date;
  const githubRepo = project.githubRepo || project.github_repo;
  const teamMembers = (project.team || []).map((tid) => workerMap[tid] || { id: tid, name: tid }).filter(Boolean);
  const commits = GITHUB_COMMITS.filter((c) => c.repo === githubRepo);
  const meetings = MEETINGS.filter((m) => m.project === id);
  const documents = DOCUMENTS.filter((d) => d.project === id);
  const manager = workerMap[managerId] || { name: managerId || '—' };
  const teamTitle = project.teamName || `Team ${project.name.split(' ')[0]}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/admin/projects')} className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-700 text-sm">
          <ArrowLeft className="w-4 h-4" /> Teams
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-blue-700">{teamTitle}</span>
      </div>

      {/* Header */}
      <div className="card shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="badge badge-blue text-sm px-3 py-1 font-bold">{teamTitle}</span>
              <StatusBadge type="project" value={project.status} />
              <StatusBadge type="priority" value={project.priority} />
              <span className="badge badge-gray">{project.category}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{project.name}</h1>
            <p className="text-base text-gray-600 mt-2 max-w-3xl leading-relaxed">{project.description}</p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Project Lead</p>
            <div className="flex items-center gap-2.5">
              <Avatar name={manager?.name} size="md" />
              <span className="text-base font-bold text-gray-800">{manager?.name || '—'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Timeline</p>
            <p className="text-base font-medium text-gray-800">{formatDate(startDate)} → {formatDate(endDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Overall Progress</p>
            <div className="flex items-center gap-3">
              <ProgressBar value={project.progress || 0} className="flex-1" />
              <span className="text-base font-bold text-gray-800">{project.progress || 0}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">GitHub Repository</p>
            {githubRepo ? (
              <div className="flex items-center gap-2 text-blue-700 font-mono font-semibold text-sm">
                <GitBranch className="w-4 h-4 text-gray-500" />
                <span>{githubRepo}</span>
              </div>
            ) : <span className="text-sm text-gray-400">Not linked</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab-link text-base ${tab === t ? 'active font-bold' : ''}`}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this Research Project</h3>
              <p className="text-base text-gray-700 leading-relaxed">
                {project.description_long || project.description}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="card shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assigned Student Interns ({teamMembers.length})</h3>
              <div className="space-y-3">
                {teamMembers.map((w, idx) => (
                  <div key={w.id || idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                    <Avatar name={w.name} size="md" />
                    <div>
                      <p className="text-sm font-bold text-gray-800">{w.name}</p>
                      <p className="text-xs text-gray-500">{w.designation || 'Student Intern'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Student Interns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((w, idx) => (
            <div key={w.id || idx} className="card p-5 flex items-start gap-4 shadow-sm hover:border-blue-300 transition-colors">
              <Avatar name={w.name} size="lg" />
              <div>
                <p className="text-base font-bold text-gray-900">{w.name}</p>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">{w.designation || 'Student Intern'}</p>
                <p className="text-xs text-gray-500 mt-1">{w.department || 'SRM Research Lab'}</p>
                {w.email && <p className="text-xs text-gray-400 mt-1">{w.email}</p>}
                {w.id && (
                  <div className="mt-3">
                    <Link to={`/admin/workers/${w.id}`} className="text-xs font-bold text-blue-600 hover:underline">View Profile →</Link>
                  </div>
                )}
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
              <span className="text-sm font-semibold">{githubRepo || 'No repository linked'}</span>
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
