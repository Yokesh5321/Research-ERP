// Admin Workers Page

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit2, UserPlus, UserX, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, ProgressBar, Pagination } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { WORKERS } from '../../data/users';

const PAGE_SIZE = 10;

const AdminWorkers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState(WORKERS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const departments = [...new Set(WORKERS.map((w) => w.department))];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = workers;
    if (search) list = list.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()) || w.email.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter) list = list.filter((w) => w.department === deptFilter);
    if (statusFilter) list = list.filter((w) => w.status === statusFilter);
    return list;
  }, [workers, search, deptFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleStatus = (id) => {
    setWorkers((ws) => ws.map((w) => w.id === id ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w));
    toast.success('Worker status updated');
  };

  if (loading) return <LoadingState message="Loading workers..." />;

  return (
    <div>
      <PageHeader title="Students & Workers" subtitle={`${workers.length} members total`} />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." className="w-64" />
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="select w-52">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-36">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || deptFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter(''); setPage(1); }} className="btn btn-ghost btn-sm text-gray-500">Clear</button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Projects</th>
                <th>Active Tasks</th>
                <th>Completed</th>
                <th>Performance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No workers found</td></tr>
              ) : (
                paginated.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {w.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <Link to={`/admin/workers/${w.id}`} className="text-blue-600 hover:underline text-xs font-medium">{w.name}</Link>
                          <p className="text-xs text-gray-400">{w.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-gray-500">{w.email}</td>
                    <td className="text-xs text-gray-600">{w.department}</td>
                    <td className="text-xs text-center">{w.projects.length}</td>
                    <td className="text-xs text-center">{w.activeTasks}</td>
                    <td className="text-xs text-center">{w.completedTasks}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <ProgressBar value={w.performance} className="w-14" />
                        <span className="text-xs text-gray-600">{w.performance}%</span>
                      </div>
                    </td>
                    <td><StatusBadge type="user" value={w.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/workers/${w.id}`)} className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600" title="View"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toast.success('Edit coming soon')} className="btn btn-ghost btn-sm text-gray-500 hover:text-amber-600" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toast.success('Assign project coming soon')} className="btn btn-ghost btn-sm text-gray-500 hover:text-green-600" title="Assign Project"><UserPlus className="w-3.5 h-3.5" /></button>
                        <button onClick={() => toggleStatus(w.id)} className={`btn btn-ghost btn-sm ${w.status === 'active' ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-green-600'}`} title={w.status === 'active' ? 'Disable' : 'Activate'}>
                          {w.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
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
    </div>
  );
};

export default AdminWorkers;
