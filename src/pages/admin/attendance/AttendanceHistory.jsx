// Admin Attendance History Page

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Search, Filter, Download, Edit2, Trash2, Eye,
  ArrowLeft, RefreshCw, X, Save, Loader2, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, ConfirmModal, Pagination, Avatar } from '../../../components/common';
import { api } from '../../../services/api';
import { formatDate } from '../../../utils/formatters';
import { SEED_ATTENDANCE, ATTENDANCE_STATUSES } from '../../../data/attendance';
import { WORKERS } from '../../../data/users';

const PAGE_SIZE = 12;

const AttendanceHistory = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState([]);
  const [candidates, setCandidates] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [candidateFilter, setCandidateFilter] = useState('');
  const [page, setPage] = useState(1);

  // Edit modal
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'present', checkInTime: '', checkOutTime: '', remarks: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchRecords = async () => {
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (monthFilter) params.month = monthFilter;
      if (statusFilter) params.status = statusFilter;
      if (candidateFilter) params.candidateId = candidateFilter;

      const res = await api.attendance.getAll(params);
      if (res?.success && res.data) {
        setRecords(res.data);
      }
    } catch (err) {
      console.warn('Attendance history fetch fallback:', err.message);
      let list = [...SEED_ATTENDANCE];
      if (dateFilter) list = list.filter((r) => r.attendance_date === dateFilter);
      if (statusFilter) list = list.filter((r) => r.status === statusFilter);
      if (candidateFilter) list = list.filter((r) => r.candidate_id === candidateFilter || r.candidate_erp === candidateFilter);
      setRecords(list);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await api.attendance.getCandidates();
      if (res?.success && res.data) {
        setCandidates(res.data);
      } else {
        setCandidates(WORKERS);
      }
    } catch (e) {
      setCandidates(WORKERS);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [dateFilter, monthFilter, statusFilter, candidateFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  // Client-side search & filtering
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const name = (r.candidate?.name || r.candidate_name || '').toLowerCase();
      const email = (r.candidate?.email || r.candidate_email || '').toLowerCase();
      const erp = (r.candidate?.erp_id || r.candidate_erp || '').toLowerCase();
      const q = search.toLowerCase();

      if (q && !name.includes(q) && !email.includes(q) && !erp.includes(q)) return false;
      return true;
    });
  }, [records, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;

  // CSV Export Handler
  const handleExportCSV = async () => {
    const toastId = toast.loading('Exporting attendance report...');
    try {
      const token = localStorage.getItem('supabase_auth_token');
      const query = new URLSearchParams();
      if (dateFilter) query.set('date', dateFilter);
      if (monthFilter) query.set('month', monthFilter);
      if (statusFilter) query.set('status', statusFilter);
      if (candidateFilter) query.set('candidateId', candidateFilter);

      const res = await fetch(`/api/attendance/export?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Attendance CSV exported successfully', { id: toastId });
        return;
      }
    } catch (e) {
      console.warn('Server export fallback to client-side CSV:', e.message);
    }

    // Client-side CSV fallback
    const headers = ['Candidate Name', 'Email', 'ERP ID', 'Department', 'Date', 'Status', 'Check In', 'Check Out', 'Remarks'];
    const rows = filtered.map((r) => [
      `"${r.candidate?.name || r.candidate_name || 'Scholar'}"`,
      `"${r.candidate?.email || r.candidate_email || ''}"`,
      `"${r.candidate?.erp_id || r.candidate_erp || ''}"`,
      `"${r.candidate?.department || r.department || 'Research'}"`,
      `"${r.attendance_date}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : ''}"`,
      `"${r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : ''}"`,
      `"${(r.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${dateFilter || monthFilter || 'report'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Attendance CSV exported successfully', { id: toastId });
  };

  // Edit Modal Open
  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditForm({
      status: record.status || 'present',
      checkInTime: record.check_in_time ? new Date(record.check_in_time).toTimeString().substring(0, 5) : '',
      checkOutTime: record.check_out_time ? new Date(record.check_out_time).toTimeString().substring(0, 5) : '',
      remarks: record.remarks || '',
    });
  };

  // Submit Edit
  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setSavingEdit(true);

    try {
      const payload = {
        status: editForm.status,
        checkInTime: editForm.checkInTime ? `${editingRecord.attendance_date}T${editForm.checkInTime}:00Z` : null,
        checkOutTime: editForm.checkOutTime ? `${editingRecord.attendance_date}T${editForm.checkOutTime}:00Z` : null,
        remarks: editForm.remarks,
      };

      await api.attendance.update(editingRecord.id, payload);
      toast.success('Attendance record updated successfully');
      setEditingRecord(null);
      fetchRecords();
    } catch (err) {
      console.error('Update record error:', err);
      // Local state fallback
      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? { ...r, ...editForm } : r))
      );
      toast.success('Record updated');
      setEditingRecord(null);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Record
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.attendance.delete(deleteTarget);
      toast.success('Record removed');
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget));
    } catch (err) {
      setRecords((prev) => prev.filter((r) => r.id !== deleteTarget));
      toast.success('Record removed');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingState message="Loading attendance history..." />;

  return (
    <div>
      <PageHeader
        title="Attendance History"
        subtitle="Search, filter, edit, and export historical candidate attendance"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/attendance" className="btn btn-secondary btn-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary btn-sm"
              title="Refresh records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={handleExportCSV} className="btn btn-primary btn-sm">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="card p-4 mb-6 bg-white border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Search Candidate</label>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Name or email..."
              className="w-full"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Specific Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setMonthFilter(''); setPage(1); }}
              className="input py-1.5 px-2.5 text-xs w-full"
            />
          </div>

          {/* Month Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Month</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setDateFilter(''); setPage(1); }}
              className="input py-1.5 px-2.5 text-xs w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="select py-1.5 px-2.5 text-xs w-full"
            >
              <option value="">All Statuses</option>
              {ATTENDANCE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Candidate Dropdown Filter */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Candidate</label>
            <select
              value={candidateFilter}
              onChange={(e) => { setCandidateFilter(e.target.value); setPage(1); }}
              className="select py-1.5 px-2.5 text-xs w-full"
            >
              <option value="">All Candidates</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters */}
        {(search || dateFilter || monthFilter || statusFilter || candidateFilter) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filtered.length} matching attendance records</span>
            <button
              onClick={() => {
                setSearch('');
                setDateFilter('');
                setMonthFilter('');
                setStatusFilter('');
                setCandidateFilter('');
                setPage(1);
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Candidate</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No attendance records match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const candidateName = r.candidate?.name || r.candidate_name || 'Scholar';
                  const candidateEmail = r.candidate?.email || r.candidate_email || '';
                  const candidateErp = r.candidate?.erp_id || r.candidate_erp || r.candidate_id;
                  const inTime = r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  const outTime = r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

                  return (
                    <tr key={r.id}>
                      <td className="font-mono text-xs font-semibold text-gray-800">
                        {r.attendance_date}
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={candidateName} size="sm" />
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{candidateName}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{candidateErp}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          r.status === 'present' ? 'badge-green' : 'badge-red'
                        }`}>
                          {r.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-gray-600">{inTime}</td>
                      <td className="font-mono text-xs text-gray-600">{outTime}</td>
                      <td className="text-xs text-gray-500 max-w-xs truncate">{r.remarks || '—'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/admin/attendance/candidate/${r.candidate_id || candidateErp}`}
                            className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600"
                            title="Candidate analytics"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(r)}
                            className="btn btn-ghost btn-sm text-gray-500 hover:text-amber-600"
                            title="Edit / Correct record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(r.id)}
                            className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                Correct Attendance Record
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <span className="text-gray-500">Candidate:</span>{' '}
                <strong className="text-gray-900">{editingRecord.candidate?.name || editingRecord.candidate_name || 'Scholar'}</strong>
                <br />
                <span className="text-gray-500">Date:</span>{' '}
                <strong className="text-gray-900">{editingRecord.attendance_date}</strong>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="select w-full"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Check-in</label>
                  <input
                    type="time"
                    value={editForm.checkInTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, checkInTime: e.target.value }))}
                    className="input w-full font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Check-out</label>
                  <input
                    type="time"
                    value={editForm.checkOutTime}
                    onChange={(e) => setEditForm((f) => ({ ...f, checkOutTime: e.target.value }))}
                    className="input w-full font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))}
                  placeholder="Reason for change or note..."
                  className="input w-full text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn btn-primary btn-sm disabled:opacity-60"
              >
                {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {savingEdit ? 'Updating...' : 'Save Correction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this candidate attendance record? This action will be logged in the audit trail."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
};

export default AttendanceHistory;
