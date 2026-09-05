// Worker Submissions Page

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingState, EmptyState, PageHeader, SearchBar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { EXECUTIONS } from '../../data/executions';
import { TASKS } from '../../data/tasks';
import { PROJECTS } from '../../data/projects';
import { formatDateTime } from '../../utils/formatters';

const taskMap = Object.fromEntries(TASKS.map((t) => [t.id, t]));
const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const WorkerSubmissions = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const mySubmissions = EXECUTIONS.filter((e) => e.student === userId)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = mySubmissions.filter((s) => {
    if (!search) return true;
    const task = taskMap[s.task];
    return s.submissionId.toLowerCase().includes(search.toLowerCase()) ||
      task?.title?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <LoadingState message="Loading submissions..." />;

  return (
    <div>
      <PageHeader title="My Submissions" subtitle={`${mySubmissions.length} code submissions`} />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by ID or task..." className="w-64" />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Task</th>
                <th>Commit</th>
                <th>Submitted At</th>
                <th>Duration</th>
                <th>Tests</th>
                <th>Execution Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                  {search ? 'No submissions found' : 'No submissions yet'}
                </td></tr>
              ) : (
                filtered.map((s) => {
                  const task = taskMap[s.task];
                  return (
                    <tr key={s.id}>
                      <td className="text-xs font-mono text-gray-700">{s.submissionId}</td>
                      <td>
                        <Link to={`/worker/tasks/${s.task}`} className="text-xs font-medium text-blue-600 hover:underline">
                          {task?.title?.slice(0, 35) || '—'}
                        </Link>
                      </td>
                      <td className="text-xs font-mono text-gray-600">{s.commit}</td>
                      <td className="text-xs text-gray-500">{formatDateTime(s.startTime)}</td>
                      <td className="text-xs text-gray-500">{s.executionTime}</td>
                      <td className="text-xs">
                        <span className={s.testsFailed > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {s.testsPassed}/{s.totalTests}
                        </span>
                      </td>
                      <td><StatusBadge type="execution" value={s.status} /></td>
                      <td>
                        <Link to={`/worker/executions/${s.id}`} className="btn btn-secondary btn-sm">View</Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerSubmissions;
