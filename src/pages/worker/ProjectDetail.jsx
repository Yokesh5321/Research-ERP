// Worker Project Detail - Team & Project view for Student Interns

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { LoadingState, EmptyState, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { GITHUB_COMMITS } from '../../data/github';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const TABS = ['Overview', 'Student Interns', 'GitHub'];

const WorkerProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');

  const project = PROJECTS.find((p) => p.id === id);
  const userId = user?.id || 'w-001';
  const teamMembers = (project?.team || []).map((tid) => workerMap[tid]).filter(Boolean);
  const commits = GITHUB_COMMITS.filter((c) => c.repo === project?.githubRepo);
  const manager = project ? workerMap[project.manager] : null;
  const teamTitle = project?.teamName || `Team ${project?.name.split(' ')[0]}`;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState />;
  if (!project) return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <EmptyState title="Team / Project not found" message="The team or project you're looking for doesn't exist." />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => navigate('/worker/projects')} className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-700 text-sm">
          <ArrowLeft className="w-4 h-4" /> My Teams
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-blue-700 truncate">{teamTitle}</span>
      </div>

      {/* Header */}
      <div className="card shadow-sm p-6">
        <div className="flex flex-wrap gap-2.5 mb-3">
          <span className="badge badge-blue text-sm px-3 py-1 font-bold">{teamTitle}</span>
          <StatusBadge type="project" value={project.status} />
          <StatusBadge type="priority" value={project.priority} />
          <span className="badge badge-gray">{project.category}</span>
          {project.manager === userId && <span className="badge badge-purple">You are the Team Lead</span>}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{project.name}</h1>
        <p className="text-base text-gray-600 mt-2 max-w-3xl leading-relaxed">{project.description}</p>

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
            <p className="text-base font-medium text-gray-800">{formatDate(project.startDate)} → {formatDate(project.endDate)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Overall Progress</p>
            <div className="flex items-center gap-3">
              <ProgressBar value={project.progress} className="flex-1" />
              <span className="text-base font-bold text-gray-800">{project.progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Team Members</p>
            <p className="text-base font-bold text-gray-800">{teamMembers.length} Student Interns</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`tab-link text-base ${tab === t ? 'active font-bold' : ''}`}>{t}</button>
        ))}
      </div>

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
          <div className="card shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Team Interns ({teamMembers.length})</h3>
            <div className="space-y-3">
              {teamMembers.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
                  <Avatar name={w.name} size="md" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{w.name} {w.id === userId ? '(You)' : ''}</p>
                    <p className="text-xs text-gray-500">{w.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Student Interns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((w) => (
            <div key={w.id} className="card p-5 flex items-start gap-4 shadow-sm">
              <Avatar name={w.name} size="lg" />
              <div>
                <p className="text-base font-bold text-gray-900">{w.name} {w.id === userId ? <span className="text-xs font-semibold text-blue-700">(You)</span> : ''}</p>
                <p className="text-xs font-semibold text-blue-700 mt-0.5">{w.designation}</p>
                <p className="text-xs text-gray-500 mt-1">{w.department}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'GitHub' && (
        <div className="card shadow-sm divide-y divide-gray-100">
          {commits.length === 0 ? (
            <div className="px-6 py-10 text-center text-base text-gray-400">No commits</div>
          ) : (
            commits.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-start gap-3.5 hover:bg-gray-50">
                <Avatar name={c.authorName} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{c.message}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{c.sha} · {c.branch} · {formatRelativeTime(c.timestamp)}</p>
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
