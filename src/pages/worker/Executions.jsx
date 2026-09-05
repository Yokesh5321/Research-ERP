// Worker Executions - reuses the executions list but filtered for worker
import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { PageHeader, SearchBar, LoadingState, Pagination, EmptyState } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { EXECUTIONS } from '../../data/executions';
import { TASKS } from '../../data/tasks';
import { PROJECTS } from '../../data/projects';
import { formatDateTime } from '../../utils/formatters';

const taskMap = Object.fromEntries(TASKS.map((t) => [t.id, t]));
const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const PAGE_SIZE = 10;

const WorkerExecutions = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const myExecutions = EXECUTIONS.filter((e) => e.student === userId);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = myExecutions;
    if (search) list = list.filter((e) => e.submissionId.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((e) => e.status === statusFilter);
    return list;
  }, [myExecutions, search, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <LoadingState message="Loading executions..." />;

  return (
    <div>
      <PageHeader title="My Code Executions" subtitle={`${myExecutions.length} executions`} />
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by ID..." className="w-56" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-36">
          <option value="">All Status</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Submission ID</th><th>Task</th><th>Commit</th><th>Submitted</th><th>Duration</th><th>Tests</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No executions found</td></tr>
              ) : (
                paginated.map((ex) => {
                  const task = taskMap[ex.task];
                  return (
                    <tr key={ex.id}>
                      <td className="text-xs font-mono text-gray-700">{ex.submissionId}</td>
                      <td><Link to={`/worker/tasks/${ex.task}`} className="text-xs font-medium text-blue-600 hover:underline">{task?.title?.slice(0, 30) || '—'}</Link></td>
                      <td className="text-xs font-mono text-gray-600">{ex.commit}</td>
                      <td className="text-xs text-gray-500">{formatDateTime(ex.startTime)}</td>
                      <td className="text-xs text-gray-500">{ex.executionTime}</td>
                      <td className="text-xs"><span className={ex.testsFailed > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{ex.testsPassed}/{ex.totalTests}</span></td>
                      <td><StatusBadge type="execution" value={ex.status} /></td>
                      <td><button onClick={() => navigate(`/worker/executions/${ex.id}`)} className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600"><Eye className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default WorkerExecutions;
