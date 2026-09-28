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
import { api } from '../../services/api';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const PAGE_SIZE = 8;

const AdminProjects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
      const res = await api.projects.getAll();
      let fetchedList = [];
      if (res && res.success && Array.isArray(res.data)) {
        fetchedList = res.data;
      }

      // Combine fetched projects with any localCustom projects to ensure zero data loss
      const knownIds = new Set(fetchedList.map((p) => p.id));
      const combined = [...localCustom.filter((cp) => !knownIds.has(cp.id)), ...fetchedList];
      
      // Fallback to static PROJECTS if combined list is empty
      if (combined.length === 0) {
        setProjects(PROJECTS);
      } else {
        setProjects(combined);
      }
    } catch (err) {
      console.warn('Failed to fetch projects from server API, using local storage fallback:', err);
      const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
      const ids = new Set(localCustom.map((p) => p.id));
      setProjects([...localCustom, ...PROJECTS.filter((p) => !ids.has(p.id))]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    let list = projects;
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category && p.category.toLowerCase().includes(search.toLowerCase())));
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (priorityFilter) list = list.filter((p) => p.priority === priorityFilter);
    list = [...list].sort((a, b) => {
      let va = a[sortField] || a[sortField.replace(/([A-Z])/g, "_$1").toLowerCase()] || '';
      let vb = b[sortField] || b[sortField.replace(/([A-Z])/g, "_$1").toLowerCase()] || '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [projects, search, statusFilter, priorityFilter, sortField, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.projects.delete(deleteTarget);
    } catch (err) {
      console.warn('Delete project API error:', err);
    }

    const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
    localStorage.setItem('custom_projects', JSON.stringify(localCustom.filter((p) => p.id !== deleteTarget)));

    setProjects((ps) => ps.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success('Project deleted');
  };

  const handleAdd = async (formData) => {
    try {
      const res = await api.projects.create(formData);
      const created = (res && res.success && res.data) ? res.data : {
        ...formData,
        id: `p-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
        team: Array.isArray(formData.team) ? formData.team : [],
      };

      // Save to localStorage so project persists even after page reloads
      const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
      const updatedLocal = [created, ...localCustom.filter((p) => p.id !== created.id)];
      localStorage.setItem('custom_projects', JSON.stringify(updatedLocal));

      setProjects((ps) => [created, ...ps.filter((p) => p.id !== created.id)]);
      setShowAddModal(false);
      toast.success('Project created successfully');
    } catch (err) {
      console.error('Error creating project via API:', err);
      // Client fallback create
      const created = {
        ...formData,
        id: `p-${Date.now().toString().slice(-6)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
        team: Array.isArray(formData.team) ? formData.team : [],
      };
      const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
      localStorage.setItem('custom_projects', JSON.stringify([created, ...localCustom]));

      setProjects((ps) => [created, ...ps]);
      setShowAddModal(false);
      toast.success('Project created successfully (saved locally)');
    }
  };

  if (loading) return <LoadingState message="Loading teams..." />;

  return (
    <div>
      <PageHeader
        title="Teams"
        subtitle={`${projects.length} teams total`}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary text-base px-4 py-2.5">
            <Plus className="w-5 h-5" /> Add Team
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search teams or projects..." className="w-72" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-44 text-base">
          <option value="">All Status</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="select w-40 text-base">
          <option value="">All Priority</option>
          {PROJECT_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        {(statusFilter || priorityFilter || search) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); setPage(1); }} className="btn btn-ghost btn-sm text-gray-500 text-sm">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="cursor-pointer text-sm font-bold" onClick={() => toggleSort('teamName')}>Team Name {sortField === 'teamName' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="cursor-pointer text-sm font-bold" onClick={() => toggleSort('name')}>Assigned Project</th>
                <th className="text-sm font-bold">Project Lead</th>
                <th className="text-sm font-bold">Student Interns</th>
                <th className="cursor-pointer text-sm font-bold" onClick={() => toggleSort('status')}>Status {sortField === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="cursor-pointer text-sm font-bold" onClick={() => toggleSort('priority')}>Priority {sortField === 'priority' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                <th className="text-sm font-bold">Progress</th>
                <th className="cursor-pointer text-sm font-bold" onClick={() => toggleSort('startDate')}>Start</th>
                <th className="cursor-pointer text-sm font-bold" onClick={() => toggleSort('endDate')}>End</th>
                <th className="text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400 text-base">No teams found</td></tr>
              ) : (
                paginated.map((p) => {
                  const managerId = p.manager || p.manager_id;
                  const startDate = p.startDate || p.start_date;
                  const endDate = p.endDate || p.end_date;
                  const teamMembers = Array.isArray(p.team) ? p.team : [];
                  const teamTitle = p.teamName || `Team ${p.name.split(' ')[0]}`;

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                      <td>
                        <Link to={`/admin/projects/${p.id}`} className="text-blue-700 hover:text-blue-900 font-bold text-base hover:underline block">
                          {teamTitle}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/admin/projects/${p.id}`} className="text-gray-900 hover:text-blue-600 font-medium text-sm block">
                          {p.name.length > 35 ? p.name.slice(0, 35) + '...' : p.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">{p.category}</p>
                      </td>
                      <td className="text-sm text-gray-700 font-medium">{workerMap[managerId]?.name || managerId || '—'}</td>
                      <td className="text-sm text-gray-600">{teamMembers.length} Student Interns</td>
                      <td><StatusBadge type="project" value={p.status} /></td>
                      <td><StatusBadge type="priority" value={p.priority} /></td>
                      <td>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <ProgressBar value={p.progress || 0} className="flex-1" />
                          <span className="text-xs font-semibold text-gray-600 w-9">{p.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(startDate)}</td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(endDate)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/admin/projects/${p.id}`)} className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-600" title="View Team & Project Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => toast.success('Edit functionality coming soon')} className="btn btn-ghost btn-sm text-gray-600 hover:text-amber-600" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(p.id)} className="btn btn-ghost btn-sm text-gray-600 hover:text-red-600" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AddProjectModal open={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAdd} />
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Team"
        message="Are you sure you want to delete this team? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
};

export default AdminProjects;
