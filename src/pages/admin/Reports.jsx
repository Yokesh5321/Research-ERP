// Admin Reports Page

import { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { PageHeader, ProgressBar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { EXECUTIONS } from '../../data/executions';

const TABS = ['Team Progress', 'Student Intern Performance', 'GitHub Activity', 'Code Executions'];

const workerPerf = WORKERS.map((w) => ({ name: w.name.split(' ')[0], performance: w.performance }));

const execStats = [
  { name: 'Passed', value: EXECUTIONS.filter((e) => e.status === 'passed').length, color: '#16a34a' },
  { name: 'Failed', value: EXECUTIONS.filter((e) => e.status === 'failed').length, color: '#dc2626' },
];

const monthlyCommits = [
  { month: 'Mar', commits: 12 }, { month: 'Apr', commits: 18 }, { month: 'May', commits: 14 },
  { month: 'Jun', commits: 21 }, { month: 'Jul', commits: 16 }, { month: 'Aug', commits: 24 }, { month: 'Sep', commits: 8 },
];

const AdminReports = () => {
  const [tab, setTab] = useState('Team Progress');

  const handleExport = (type) => {
    toast.success(`${type} export initiated (mock)`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Analytics and performance reports for Research Teams & Student Interns"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport('CSV')} className="btn btn-secondary btn-sm text-sm font-semibold">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => handleExport('PDF')} className="btn btn-secondary btn-sm text-sm font-semibold">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        }
      />

      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`tab-link text-base ${tab === t ? 'active font-bold' : ''}`}>{t}</button>)}
      </div>

      {tab === 'Team Progress' && (
        <div className="space-y-6">
          <div className="card shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Teams & Projects Progress Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={PROJECTS.map((p) => ({ team: p.teamName || `Team ${p.name.split(' ')[0]}`, progress: p.progress }))} layout="vertical" margin={{ left: 25, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 13 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="team" type="category" tick={{ fontSize: 13, fontWeight: 600 }} width={130} />
                <Tooltip formatter={(v) => [`${v}%`, 'Progress']} />
                <Bar dataKey="progress" fill="#2563eb" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card shadow-sm">
            <div className="card-header"><h3 className="text-base font-bold text-gray-900">Teams Status Summary</h3></div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th className="text-sm font-bold">Team Name</th><th className="text-sm font-bold">Assigned Project</th><th className="text-sm font-bold">Status</th><th className="text-sm font-bold">Priority</th><th className="text-sm font-bold">Progress</th><th className="text-sm font-bold">End Date</th></tr></thead>
                <tbody>
                  {PROJECTS.map((p) => (
                    <tr key={p.id}>
                      <td className="text-base font-bold text-blue-700">{p.teamName || `Team ${p.name.split(' ')[0]}`}</td>
                      <td className="text-sm font-medium text-gray-800">{p.name}</td>
                      <td><StatusBadge type="project" value={p.status} /></td>
                      <td><StatusBadge type="priority" value={p.priority} /></td>
                      <td><div className="flex items-center gap-2"><ProgressBar value={p.progress} className="w-16" /><span className="text-xs font-semibold">{p.progress}%</span></div></td>
                      <td className="text-xs text-gray-500">{p.endDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'Student Intern Performance' && (
        <div className="space-y-6">
          <div className="card shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Student Intern Performance Scores</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={workerPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 13 }} />
                <Tooltip />
                <Bar dataKey="performance" fill="#2563eb" maxBarSize={40} name="Performance %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card shadow-sm">
            <div className="table-container">
              <table className="table">
                <thead><tr><th className="text-sm font-bold">Student Intern</th><th className="text-sm font-bold">Department</th><th className="text-sm font-bold text-center">Assigned Teams</th><th className="text-sm font-bold">Performance</th><th className="text-sm font-bold">Status</th></tr></thead>
                <tbody>
                  {WORKERS.map((w) => (
                    <tr key={w.id}>
                      <td className="text-base font-bold text-gray-900">{w.name}</td>
                      <td className="text-sm text-gray-600">{w.department}</td>
                      <td className="text-sm text-center font-bold">{w.projects.length} Teams</td>
                      <td><div className="flex items-center gap-2"><ProgressBar value={w.performance} className="w-16" /><span className="text-xs font-semibold">{w.performance}%</span></div></td>
                      <td><StatusBadge type="user" value={w.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'GitHub Activity' && (
        <div className="card shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Commit Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyCommits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip />
              <Line type="monotone" dataKey="commits" stroke="#2563eb" strokeWidth={3} dot={{ r: 5 }} name="Commits" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'Code Executions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card shadow-sm p-6 flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-900 mb-4 self-start">Execution Results</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={execStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
                  {execStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-3">
              {execStats.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>

          <div className="card shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
            <dl className="space-y-4">
              <div className="flex justify-between border-b pb-2"><dt className="text-base text-gray-600">Total Executions</dt><dd className="text-base font-bold">{EXECUTIONS.length}</dd></div>
              <div className="flex justify-between border-b pb-2"><dt className="text-base text-gray-600">Pass Rate</dt><dd className="text-base font-bold text-green-600">{Math.round(EXECUTIONS.filter((e) => e.status === 'passed').length / EXECUTIONS.length * 100)}%</dd></div>
              <div className="flex justify-between border-b pb-2"><dt className="text-base text-gray-600">Avg Duration</dt><dd className="text-base font-bold">~7 min</dd></div>
              <div className="flex justify-between"><dt className="text-base text-gray-600">Failed Executions</dt><dd className="text-base font-bold text-red-600">{EXECUTIONS.filter((e) => e.status === 'failed').length}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
