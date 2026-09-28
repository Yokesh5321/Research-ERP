// Admin Dashboard

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Users, GitCommit, Calendar, ArrowRight, Video } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { StatCard, LoadingState, PageHeader, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { GITHUB_COMMITS } from '../../data/github';
import { MEETINGS } from '../../data/meetings';
import { formatDate } from '../../utils/formatters';

const teamProgressData = PROJECTS.map((p) => ({
  teamName: p.teamName || `Team ${p.name.split(' ')[0]}`,
  projectName: p.name,
  progress: p.progress,
}));

const teamStatusData = [
  { name: 'Active', value: PROJECTS.filter((p) => p.status === 'active').length, color: '#16a34a' },
  { name: 'Completed', value: PROJECTS.filter((p) => p.status === 'completed').length, color: '#2563eb' },
  { name: 'Planning', value: PROJECTS.filter((p) => p.status === 'planning').length, color: '#7c3aed' },
  { name: 'On Hold', value: PROJECTS.filter((p) => p.status === 'on_hold').length, color: '#d97706' },
];

const monthlyActivityData = [
  { month: 'Mar', meetings: 4, commits: 12 },
  { month: 'Apr', meetings: 6, commits: 18 },
  { month: 'May', meetings: 5, commits: 14 },
  { month: 'Jun', meetings: 8, commits: 21 },
  { month: 'Jul', meetings: 4, commits: 16 },
  { month: 'Aug', meetings: 7, commits: 24 },
  { month: 'Sep', meetings: 3, commits: 8 },
];

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  const totalTeams = PROJECTS.length;
  const activeTeams = PROJECTS.filter((p) => p.status === 'active').length;
  const completedTeams = PROJECTS.filter((p) => p.status === 'completed').length;
  const totalStudentInterns = WORKERS.length;
  const upcomingMeetings = MEETINGS.filter((m) => m.status === 'upcoming');

  const recentTeams = [...PROJECTS].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="Overview of SRM Research Teams and Activities" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <StatCard label="Total Teams" value={totalTeams} icon={FolderOpen} color="blue" />
        <StatCard label="Active Teams" value={activeTeams} icon={FolderOpen} color="green" />
        <StatCard label="Completed Teams" value={completedTeams} icon={FolderOpen} color="purple" />
        <StatCard label="Student Interns" value={totalStudentInterns} icon={Users} color="indigo" />
        <StatCard label="Upcoming Meetings" value={upcomingMeetings.length} icon={Calendar} color="yellow" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Progress Chart (Bar) */}
        <div className="card lg:col-span-2 shadow-sm">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Team Progress Overview</h3>
            <span className="text-xs text-gray-500 font-medium">Displaying Team Names & Progress %</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={teamProgressData} layout="vertical" margin={{ left: 25, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 13, fontWeight: 500 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="teamName" type="category" tick={{ fontSize: 13, fontWeight: 600, fill: '#1e293b' }} width={120} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md text-sm">
                          <p className="font-bold text-blue-700">{data.teamName}</p>
                          <p className="text-xs text-gray-600 mt-0.5">Project: {data.projectName}</p>
                          <p className="text-xs font-semibold text-green-600 mt-1">Progress: {data.progress}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="progress" fill="#2563eb" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Status Breakdown (Pie) */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Teams Status</h3>
          </div>
          <div className="card-body flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={teamStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                  {teamStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-3">
              {teamStatusData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Teams Table Section */}
      <div className="card shadow-sm">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Recent Teams</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Click on any Team Name to view full Project Details</p>
          </div>
          <Link to="/admin/projects" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
            View all teams <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-sm font-bold">Team Name</th>
                <th className="text-sm font-bold">Assigned Project</th>
                <th className="text-sm font-bold">Project Lead</th>
                <th className="text-sm font-bold">Status</th>
                <th className="text-sm font-bold">Progress</th>
              </tr>
            </thead>
            <tbody>
              {recentTeams.map((p) => {
                const teamTitle = p.teamName || `Team ${p.name.split(' ')[0]}`;
                const managerId = p.manager || p.manager_id;
                return (
                  <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                    <td>
                      <Link to={`/admin/projects/${p.id}`} className="text-blue-700 hover:text-blue-900 font-bold text-base hover:underline block">
                        {teamTitle}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/admin/projects/${p.id}`} className="text-gray-900 hover:text-blue-600 font-medium text-sm block">
                        {p.name}
                      </Link>
                      <p className="text-xs text-gray-500">{p.category}</p>
                    </td>
                    <td className="text-sm text-gray-700 font-medium">{workerMap[managerId]?.name || managerId || '—'}</td>
                    <td><StatusBadge type="project" value={p.status} /></td>
                    <td>
                      <div className="flex items-center gap-2.5 min-w-[120px]">
                        <ProgressBar value={p.progress} className="flex-1" />
                        <span className="text-xs font-semibold text-gray-600 w-9">{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Grids: GitHub & Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GitHub Activity */}
        <div className="card shadow-sm">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Recent GitHub Activity</h3>
            <Link to="/admin/github" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {GITHUB_COMMITS.slice(0, 4).map((c) => (
              <div key={c.id} className="px-6 py-3.5 flex items-start gap-3.5 hover:bg-gray-50">
                <Avatar name={c.authorName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.authorName} · <span className="font-mono">{c.sha}</span> · {c.repo.split('/')[1]}</p>
                </div>
                <StatusBadge type="github" value={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card shadow-sm">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Upcoming Meetings</h3>
            <Link to="/admin/meetings" className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingMeetings.slice(0, 4).map((m) => (
              <div key={m.id} className="px-6 py-3.5 flex items-start gap-3.5 hover:bg-gray-50">
                <div className="bg-blue-50 rounded-md p-2 flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(m.date)} · {m.time} · {m.duration} min</p>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{m.participants.length} attendees</span>
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
