// Admin Reports Page

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { PageHeader, ProgressBar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS } from '../../data/projects';
import { TASKS } from '../../data/tasks';
import { WORKERS } from '../../data/users';
import { EXECUTIONS } from '../../data/executions';

const TABS = ['Project Progress', 'Task Completion', 'Worker Performance', 'GitHub Activity', 'Code Executions'];

const workerPerf = WORKERS.map((w) => ({ name: w.name.split(' ')[0], performance: w.performance, tasks: w.completedTasks }));

const taskByStatus = [
  { name: 'Completed', value: TASKS.filter((t) => t.status === 'completed').length, color: '#16a34a' },
  { name: 'In Progress', value: TASKS.filter((t) => t.status === 'in_progress').length, color: '#7c3aed' },
  { name: 'Assigned', value: TASKS.filter((t) => t.status === 'assigned').length, color: '#2563eb' },
  { name: 'Not Started', value: TASKS.filter((t) => t.status === 'not_started').length, color: '#9ca3af' },
  { name: 'Failed', value: TASKS.filter((t) => t.status === 'failed').length, color: '#dc2626' },
];

const execStats = [
  { name: 'Passed', value: EXECUTIONS.filter((e) => e.status === 'passed').length, color: '#16a34a' },
  { name: 'Failed', value: EXECUTIONS.filter((e) => e.status === 'failed').length, color: '#dc2626' },
];

const monthlyCommits = [
  { month: 'Mar', commits: 12 }, { month: 'Apr', commits: 18 }, { month: 'May', commits: 14 },
  { month: 'Jun', commits: 21 }, { month: 'Jul', commits: 16 }, { month: 'Aug', commits: 24 }, { month: 'Sep', commits: 8 },
];

const AdminReports = () => {
  const [tab, setTab] = useState('Project Progress');

  const handleExport = (type) => {
    toast.success(`${type} export initiated (mock)`);
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Analytics and performance reports"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => handleExport('CSV')} className="btn btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={() => handleExport('PDF')} className="btn btn-secondary btn-sm">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        }
      />

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`tab-link ${tab === t ? 'active' : ''}`}>{t}</button>)}
      </div>

      {tab === 'Project Progress' && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Project Progress Overview</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={PROJECTS.map((p) => ({ name: p.name.split(' ').slice(0, 3).join(' '), progress: p.progress, tasks: p.totalTasks }))} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Progress']} />
                  <Bar dataKey="progress" fill="#2563eb" radius={[0, 3, 3, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Project Status Summary</h3></div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Project</th><th>Status</th><th>Priority</th><th>Progress</th><th>Tasks</th><th>End Date</th></tr></thead>
                <tbody>
                  {PROJECTS.map((p) => (
                    <tr key={p.id}>
                      <td className="text-xs font-medium text-gray-800">{p.name.slice(0, 40)}</td>
                      <td><StatusBadge type="project" value={p.status} /></td>
                      <td><StatusBadge type="priority" value={p.priority} /></td>
                      <td><div className="flex items-center gap-2"><ProgressBar value={p.progress} className="w-16" /><span className="text-xs">{p.progress}%</span></div></td>
                      <td className="text-xs">{p.completedTasks}/{p.totalTasks}</td>
                      <td className="text-xs text-gray-500">{p.endDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'Task Completion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Task Status Distribution</h3></div>
            <div className="card-body flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={taskByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
                    {taskByStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {taskByStatus.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Task Summary</h3></div>
            <div className="card-body space-y-3">
              {taskByStatus.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">{s.name}</span>
                    <span className="text-xs font-medium">{s.value} tasks</span>
                  </div>
                  <ProgressBar value={(s.value / TASKS.length) * 100} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Worker Performance' && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Worker Performance Scores</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workerPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="performance" fill="#2563eb" maxBarSize={36} name="Performance %" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Worker</th><th>Department</th><th>Projects</th><th>Active Tasks</th><th>Completed</th><th>Performance</th><th>Status</th></tr></thead>
                <tbody>
                  {WORKERS.map((w) => (
                    <tr key={w.id}>
                      <td className="text-xs font-medium text-gray-800">{w.name}</td>
                      <td className="text-xs text-gray-500">{w.department}</td>
                      <td className="text-xs text-center">{w.projects.length}</td>
                      <td className="text-xs text-center">{w.activeTasks}</td>
                      <td className="text-xs text-center">{w.completedTasks}</td>
                      <td><div className="flex items-center gap-2"><ProgressBar value={w.performance} className="w-14" /><span className="text-xs">{w.performance}%</span></div></td>
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
        <div className="card">
          <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Monthly Commit Activity</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyCommits}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="commits" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Commits" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'Code Executions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Execution Results</h3></div>
            <div className="card-body flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={execStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
                    {execStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {execStats.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Summary</h3>
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Total Executions</dt><dd className="text-sm font-semibold">{EXECUTIONS.length}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Pass Rate</dt><dd className="text-sm font-semibold text-green-600">{Math.round(EXECUTIONS.filter((e) => e.status === 'passed').length / EXECUTIONS.length * 100)}%</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Avg Duration</dt><dd className="text-sm font-semibold">~7 min</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-gray-500">Failed Executions</dt><dd className="text-sm font-semibold text-red-600">{EXECUTIONS.filter((e) => e.status === 'failed').length}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
