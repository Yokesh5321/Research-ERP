// Worker Dashboard

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, FolderOpen, Clock, ArrowRight, Calendar, GitCommit } from 'lucide-react';
import { StatCard, LoadingState, ProgressBar, PageHeader, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { PROJECTS } from '../../data/projects';
import { TASKS } from '../../data/tasks';
import { GITHUB_COMMITS } from '../../data/github';
import { MEETINGS } from '../../data/meetings';
import { formatDate, formatRelativeTime } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const WorkerDashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);

  const myProjects = PROJECTS.filter((p) => p.team.includes(userId) || p.manager === userId);
  const myTasks = TASKS.filter((t) => t.assignedTo === userId);
  const myCommits = GITHUB_COMMITS.filter((c) => c.author === userId);
  const myMeetings = MEETINGS.filter((m) => m.participants.includes(userId) && m.status === 'upcoming');

  const activeTasks = myTasks.filter((t) => !['completed', 'failed', 'not_started'].includes(t.status));
  const completedTasks = myTasks.filter((t) => t.status === 'completed');
  const pendingTasks = myTasks.filter((t) => t.status === 'not_started');

  const upcomingDeadlines = myTasks
    .filter((t) => !['completed', 'failed'].includes(t.status) && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title="My Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="My Projects" value={myProjects.length} icon={FolderOpen} color="blue" />
        <StatCard label="Active Tasks" value={activeTasks.length} icon={CheckSquare} color="purple" />
        <StatCard label="Completed" value={completedTasks.length} icon={CheckSquare} color="green" />
        <StatCard label="Pending" value={pendingTasks.length} icon={CheckSquare} color="yellow" />
        <StatCard label="Upcoming Deadlines" value={upcomingDeadlines.length} icon={Clock} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Current Tasks */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">My Current Tasks</h3>
            <Link to="/worker/tasks" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-100">
            {activeTasks.slice(0, 4).map((t) => (
              <div key={t.id} className="px-6 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link to={`/worker/tasks/${t.id}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">{t.title}</Link>
                    <p className="text-xs text-gray-400 mt-0.5">{projectMap[t.project]?.name?.slice(0, 35) || '—'}</p>
                  </div>
                  <StatusBadge type="task" value={t.status} />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <ProgressBar value={t.progress} className="flex-1" />
                  <span className="text-xs text-gray-500">{t.progress}%</span>
                  <span className="text-xs text-gray-400">Due {formatDate(t.dueDate)}</span>
                </div>
              </div>
            ))}
            {activeTasks.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No active tasks</div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Upcoming Deadlines</h3>
            <Link to="/worker/tasks" className="text-xs text-blue-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingDeadlines.map((t) => (
              <div key={t.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <Link to={`/worker/tasks/${t.id}`} className="text-sm font-medium text-gray-700 hover:text-blue-600">{t.title.slice(0, 35)}</Link>
                  <p className="text-xs text-gray-400">{projectMap[t.project]?.name?.slice(0, 30)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-gray-700">{formatDate(t.dueDate)}</p>
                  <StatusBadge type="priority" value={t.priority} />
                </div>
              </div>
            ))}
            {upcomingDeadlines.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No upcoming deadlines</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* GitHub Activity */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">My GitHub Activity</h3>
            <Link to="/worker/github" className="text-xs text-blue-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-100">
            {myCommits.slice(0, 4).map((c) => (
              <div key={c.id} className="px-6 py-3 flex items-start gap-3">
                <GitCommit className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{c.message}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{c.sha} · {c.repo.split('/')[1]} · {formatRelativeTime(c.timestamp)}</p>
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
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Upcoming Meetings</h3>
            <Link to="/worker/meetings" className="text-xs text-blue-600 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-gray-100">
            {myMeetings.slice(0, 4).map((m) => (
              <div key={m.id} className="px-6 py-3 flex items-start gap-3">
                <div className="bg-blue-50 rounded p-1.5 flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.date)} · {m.time} · {m.duration} min</p>
                </div>
                {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm text-blue-600 text-xs">Join</a>}
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
