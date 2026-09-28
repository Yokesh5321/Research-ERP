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
    toast.success('Student Intern status updated');
  };

  if (loading) return <LoadingState message="Loading student interns..." />;

  return (
    <div>
      <PageHeader title="Student Interns" subtitle={`${workers.length} student interns total`} />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." className="w-72" />
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="select w-56 text-base">
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-40 text-base">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {(search || deptFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter(''); setPage(1); }} className="btn btn-ghost btn-sm text-gray-500 text-sm">Clear</button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-sm font-bold">Student Intern Name</th>
                <th className="text-sm font-bold">Email</th>
                <th className="text-sm font-bold">Department</th>
                <th className="text-sm font-bold text-center">Assigned Teams</th>
                <th className="text-sm font-bold">Performance</th>
                <th className="text-sm font-bold">Status</th>
                <th className="text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-base">No student interns found</td></tr>
              ) : (
                paginated.map((w) => (
                  <tr key={w.id} className="hover:bg-blue-50/50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {w.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <Link to={`/admin/workers/${w.id}`} className="text-blue-700 hover:text-blue-900 text-base font-bold hover:underline block">{w.name}</Link>
                          <p className="text-xs text-gray-500">{w.designation || 'Student Intern'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{w.email}</td>
                    <td className="text-sm text-gray-700 font-medium">{w.department}</td>
                    <td className="text-sm text-center font-bold text-gray-800">{w.projects.length} Teams</td>
                    <td>
                      <div className="flex items-center gap-2.5 min-w-[100px]">
                        <ProgressBar value={w.performance} className="w-16" />
                        <span className="text-xs font-semibold text-gray-700">{w.performance}%</span>
                      </div>
                    </td>
                    <td><StatusBadge type="user" value={w.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/workers/${w.id}`)} className="btn btn-ghost btn-sm text-gray-600 hover:text-blue-600" title="View Profile"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => toast.success('Edit coming soon')} className="btn btn-ghost btn-sm text-gray-600 hover:text-amber-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => toast.success('Assign team coming soon')} className="btn btn-ghost btn-sm text-gray-600 hover:text-green-600" title="Assign Team"><UserPlus className="w-4 h-4" /></button>
                        <button onClick={() => toggleStatus(w.id)} className={`btn btn-ghost btn-sm ${w.status === 'active' ? 'text-gray-600 hover:text-red-600' : 'text-gray-600 hover:text-green-600'}`} title={w.status === 'active' ? 'Disable' : 'Activate'}>
                          {w.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
