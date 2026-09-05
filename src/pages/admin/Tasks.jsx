// Admin Tasks Page

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, ConfirmModal, ProgressBar, Pagination, EmptyState } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { TASKS, TASK_STATUSES, TASK_PRIORITIES } from '../../data/tasks';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { formatDate } from '../../utils/formatters';
import AddTaskModal from './modals/AddTaskModal';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const PAGE_SIZE = 10;

const AdminTasks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState(TASKS);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [workerFilter, setWorkerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = tasks;
    if (search) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
    if (projectFilter) list = list.filter((t) => t.project === projectFilter);
    if (workerFilter) list = list.filter((t) => t.assignedTo === workerFilter);
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    if (priorityFilter) list = list.filter((t) => t.priority === priorityFilter);
    return list;
  }, [tasks, search, projectFilter, workerFilter, statusFilter, priorityFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleAdd = (newTask) => {
    setTasks((ts) => [{ ...newTask, id: `t-${Date.now()}`, progress: 0, submittedAt: null, comments: [], executionId: null }, ...ts]);
    setShowAddModal(false);
    toast.success('Task created successfully');
  };

  const handleDelete = () => {
    setTasks((ts) => ts.filter((t) => t.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success('Task deleted');
  };

  const clearFilters = () => { setSearch(''); setProjectFilter(''); setWorkerFilter(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); };

  if (loading) return <LoadingState message="Loading tasks..." />;

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.length} tasks total`}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." className="w-56" />
        <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }} className="select w-52">
          <option value="">All Projects</option>
          {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name.slice(0, 35)}</option>)}
        </select>
        <select value={workerFilter} onChange={(e) => { setWorkerFilter(e.target.value); setPage(1); }} className="select w-44">
          <option value="">All Workers</option>
          {WORKERS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-40">
          <option value="">All Status</option>
          {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="select w-36">
          <option value="">All Priority</option>
          {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        {(search || projectFilter || workerFilter || statusFilter || priorityFilter) && (
          <button onClick={clearFilters} className="btn btn-ghost btn-sm text-gray-500">Clear</button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No tasks found</td></tr>
              ) : (
                paginated.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/admin/tasks/${t.id}`} className="text-blue-600 hover:underline font-medium text-xs">
                        {t.title.length > 38 ? t.title.slice(0, 38) + '...' : t.title}
                      </Link>
                    </td>
                    <td className="text-xs text-gray-500">{projectMap[t.project]?.name?.slice(0, 28) || '—'}</td>
                    <td className="text-xs text-gray-700">{workerMap[t.assignedTo]?.name || '—'}</td>
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
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/tasks/${t.id}`)} className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600" title="View"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toast.success('Edit coming soon')} className="btn btn-ghost btn-sm text-gray-500 hover:text-amber-600" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(t.id)} className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AddTaskModal open={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      <ConfirmModal open={!!deleteTarget} title="Delete Task" message="Are you sure you want to delete this task?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
    </div>
  );
};

export default AdminTasks;
