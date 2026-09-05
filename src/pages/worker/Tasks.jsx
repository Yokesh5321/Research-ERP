// Worker Tasks Page

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingState, EmptyState, PageHeader, SearchBar, ProgressBar, Pagination } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { TASKS, TASK_STATUSES, TASK_PRIORITIES } from '../../data/tasks';
import { PROJECTS } from '../../data/projects';
import { formatDate } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const PAGE_SIZE = 10;

const WorkerTasks = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);

  const myTasks = TASKS.filter((t) => t.assignedTo === userId);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = myTasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <LoadingState message="Loading tasks..." />;

  return (
    <div>
      <PageHeader title="My Tasks" subtitle={`${myTasks.length} tasks assigned to you`} />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." className="w-56" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-40">
          <option value="">All Status</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="select w-36">
          <option value="">All Priority</option>
          {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No tasks found</td></tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/worker/tasks/${t.id}`} className="text-blue-600 hover:underline text-xs font-medium">
                        {t.title.length > 40 ? t.title.slice(0, 40) + '...' : t.title}
                      </Link>
                    </td>
                    <td className="text-xs text-gray-500">{projectMap[t.project]?.name?.slice(0, 25) || '—'}</td>
                    <td><StatusBadge type="priority" value={t.priority} /></td>
                    <td><StatusBadge type="task" value={t.status} /></td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(t.dueDate)}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[72px]">
                        <ProgressBar value={t.progress} className="w-14" />
                        <span className="text-xs text-gray-500">{t.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <Link to={`/worker/tasks/${t.id}`} className="btn btn-secondary btn-sm">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default WorkerTasks;
