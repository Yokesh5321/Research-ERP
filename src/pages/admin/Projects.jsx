// Admin Projects Page

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, EmptyState, ConfirmModal, ProgressBar, Pagination } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { PROJECTS, PROJECT_STATUSES, PROJECT_PRIORITIES } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { formatDate } from '../../utils/formatters';
import AddProjectModal from './modals/AddProjectModal';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const PAGE_SIZE = 8;

const AdminProjects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState(PROJECTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = projects;
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (priorityFilter) list = list.filter((p) => p.priority === priorityFilter);
    list = [...list].sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (typeof va === 'string') va = va.toLowerCase(), vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [projects, search, statusFilter, priorityFilter, sortField, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleDelete = () => {
    setProjects((ps) => ps.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success('Project deleted');
  };

  const handleAdd = (newProject) => {
    setProjects((ps) => [{ ...newProject, id: `p-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), progress: 0, totalTasks: 0, completedTasks: 0 }, ...ps]);
    setShowAddModal(false);
    toast.success('Project created successfully');
  };

  if (loading) return <LoadingState message="Loading projects..." />;

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} projects total`}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects..." className="w-64" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-40">
          <option value="">All Status</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="select w-36">
          <option value="">All Priority</option>
          {PROJECT_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        {(statusFilter || priorityFilter || search) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); }} className="btn btn-ghost btn-sm text-gray-500">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="cursor-pointer" onClick={() => toggleSort('name')}>Project Name {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Manager</th>
                <th>Team</th>
                <th className="cursor-pointer" onClick={() => toggleSort('status')}>Status {sortField === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="cursor-pointer" onClick={() => toggleSort('priority')}>Priority {sortField === 'priority' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th>Progress</th>
                <th className="cursor-pointer" onClick={() => toggleSort('startDate')}>Start</th>
                <th className="cursor-pointer" onClick={() => toggleSort('endDate')}>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No projects found</td></tr>
              ) : (
                paginated.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/admin/projects/${p.id}`} className="text-blue-600 hover:underline font-medium">
                        {p.name.length > 40 ? p.name.slice(0, 40) + '...' : p.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                    </td>
                    <td className="text-xs">{workerMap[p.manager]?.name || '—'}</td>
                    <td className="text-xs text-gray-500">{p.team.length} members</td>
                    <td><StatusBadge type="project" value={p.status} /></td>
                    <td><StatusBadge type="priority" value={p.priority} /></td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <ProgressBar value={p.progress} className="flex-1" />
                        <span className="text-xs text-gray-500 w-8">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(p.startDate)}</td>
                    <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(p.endDate)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/projects/${p.id}`)} className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toast.success('Edit functionality coming soon')} className="btn btn-ghost btn-sm text-gray-500 hover:text-amber-600" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(p.id)} className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

      <AddProjectModal open={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
};

export default AdminProjects;
