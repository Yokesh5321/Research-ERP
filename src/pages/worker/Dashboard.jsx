// Worker Dashboard

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Calendar, GitCommit, ArrowRight } from 'lucide-react';
import { StatCard, LoadingState, ProgressBar, PageHeader } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { PROJECTS } from '../../data/projects';
import { GITHUB_COMMITS } from '../../data/github';
import { MEETINGS } from '../../data/meetings';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);

  const myProjects = PROJECTS.filter((p) => p.team.includes(userId) || p.manager === userId);
  const myCommits = GITHUB_COMMITS.filter((c) => c.author === userId);
  const myMeetings = MEETINGS.filter((m) => m.participants.includes(userId) && m.status === 'upcoming');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'Student Intern'}`} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="My Assigned Teams" value={myProjects.length} icon={FolderOpen} color="blue" />
        <StatCard label="Upcoming Meetings" value={myMeetings.length} icon={Calendar} color="yellow" />
        <StatCard label="My GitHub Commits" value={myCommits.length} icon={GitCommit} color="green" />
      </div>

      {/* My Teams Section */}
      <div className="card shadow-sm">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">My Teams & Projects</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Click on a Team Name to view your assigned Project details</p>
          </div>
          <Link to="/worker/projects" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
            View all teams <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {myProjects.map((p) => {
            const teamTitle = p.teamName || `Team ${p.name.split(' ')[0]}`;
            const mgr = p.manager || p.manager_id;
            return (
              <div key={p.id} className="p-5 hover:bg-blue-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Link to={`/worker/projects/${p.id}`} className="text-lg font-bold text-blue-700 hover:underline">
                      {teamTitle}
                    </Link>
                    <StatusBadge type="project" value={p.status} />
                    <span className="badge badge-gray">{p.category}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-1">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end flex-shrink-0">
                  <div className="flex items-center gap-2.5 min-w-[140px]">
                    <ProgressBar value={p.progress || 0} className="flex-1" />
                    <span className="text-xs font-semibold text-gray-700">{p.progress || 0}%</span>
                  </div>
                  <Link to={`/worker/projects/${p.id}`} className="btn btn-secondary btn-sm text-sm font-semibold">
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
          {myProjects.length === 0 && (
            <div className="px-6 py-10 text-center text-base text-gray-400">No teams assigned</div>
          )}
        </div>
      </div>

      {/* GitHub & Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Activity */}
        <div className="card shadow-sm">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">My GitHub Activity</h3>
            <Link to="/worker/github" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {myCommits.slice(0, 4).map((c) => (
              <div key={c.id} className="px-6 py-3.5 flex items-start gap-3.5 hover:bg-gray-50">
                <GitCommit className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5 font-mono">{c.sha} · {c.repo.split('/')[1]} · {formatRelativeTime(c.timestamp)}</p>
                </div>
                <StatusBadge type="github" value={c.status} />
              </div>
            ))}
            {myCommits.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No recent commits</div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card shadow-sm">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Upcoming Meetings</h3>
            <Link to="/worker/meetings" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {myMeetings.slice(0, 4).map((m) => (
              <div key={m.id} className="px-6 py-3.5 flex items-start gap-3.5 hover:bg-gray-50">
                <div className="bg-blue-50 rounded-md p-2 flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(m.date)} · {m.time} · {m.duration} min</p>
                </div>
                {m.meetingLink && (
                  <a href={m.meetingLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm text-xs font-semibold">Join</a>
                )}
              </div>
            ))}
            {myMeetings.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No upcoming meetings</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
