// Admin - Mark Daily Attendance Page

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarCheck, CheckCircle2, Clock, XCircle, AlertCircle,
  Save, Loader2, Calendar, ArrowLeft, CheckCheck, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, LoadingState, Avatar } from '../../../components/common';
import { api } from '../../../services/api';
import { WORKERS } from '../../../data/users';
import { SEED_ATTENDANCE } from '../../../data/attendance';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [candidates, setCandidates] = useState([]);
  // attendanceState maps candidateId -> { status, checkInTime, checkOutTime, remarks }
  const [attendanceState, setAttendanceState] = useState({});

  // 1. Fetch active candidates & existing records for date
  const loadData = async (date) => {
    setLoading(true);
    try {
      // Get candidates
      let candList = [];
      try {
        const candRes = await api.attendance.getCandidates();
        if (candRes?.success && candRes.data) {
          candList = candRes.data;
        }
      } catch (cErr) {
        console.warn('Candidate list fetch fallback:', cErr);
      }

      if (candList.length === 0) {
        candList = WORKERS.filter((w) => w.status === 'active');
      }
      setCandidates(candList);

      // Get existing records for this date
      let existingRecords = [];
      try {
        const recRes = await api.attendance.getAll({ date });
        if (recRes?.success && recRes.data) {
          existingRecords = recRes.data;
        }
      } catch (rErr) {
        console.warn('Existing attendance fetch fallback:', rErr);
      }

      if (existingRecords.length === 0) {
        existingRecords = SEED_ATTENDANCE.filter((a) => a.attendance_date === date);
      }

      // Map to state
      const initialMap = {};
      candList.forEach((c) => {
        const existing = existingRecords.find(
          (r) => r.candidate_id === c.id || r.candidate_erp === c.erp_id || r.candidate_erp === c.id
        );

        initialMap[c.id] = {
          candidateId: c.id,
          status: existing ? existing.status : 'present', // Default to present
          checkInTime: existing?.check_in_time
            ? new Date(existing.check_in_time).toTimeString().substring(0, 5)
            : '09:00',
          checkOutTime: existing?.check_out_time
            ? new Date(existing.check_out_time).toTimeString().substring(0, 5)
            : '',
          remarks: existing?.remarks || '',
        };
      });

      setAttendanceState(initialMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  // Status Change Handler
  const handleStatusChange = (candidateId, status) => {
    setAttendanceState((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        status,
        checkInTime: status === 'absent' ? '' : prev[candidateId]?.checkInTime || '09:00',
        checkOutTime: status === 'absent' ? '' : prev[candidateId]?.checkOutTime || '',
      },
    }));
  };

  // Field change handler (time, remarks)
  const handleFieldChange = (candidateId, field, value) => {
    setAttendanceState((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [field]: value,
      },
    }));
  };

  // Mark all present convenience action
  const handleMarkAllPresent = () => {
    setAttendanceState((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          status: 'present',
          checkInTime: updated[id]?.checkInTime || '09:00',
        };
      });
      return updated;
    });
    toast.success('Marked all candidates as Present');
  };

  // Save Attendance to Backend & Supabase
  const handleSaveAttendance = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving attendance records...');

    try {
      const recordsToSave = Object.values(attendanceState).map((item) => {
        let checkInIso = null;
        let checkOutIso = null;

        if (item.checkInTime && item.status !== 'absent') {
          checkInIso = `${selectedDate}T${item.checkInTime}:00Z`;
        }
        if (item.checkOutTime && item.status !== 'absent') {
          checkOutIso = `${selectedDate}T${item.checkOutTime}:00Z`;
        }

        return {
          candidateId: item.candidateId,
          status: item.status,
          checkInTime: checkInIso,
          checkOutTime: checkOutIso,
          remarks: item.remarks || '',
        };
      });

      await api.attendance.bulkMark({
        attendanceDate: selectedDate,
        records: recordsToSave,
      });

      toast.success(`Attendance successfully recorded for ${recordsToSave.length} candidates!`, { id: toastId });
      navigate('/admin/attendance');
    } catch (err) {
      console.error('Save attendance error:', err);
      toast.error(`Failed to save attendance: ${err.message}`, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading candidate roster..." />;

  // Quick live counts
  const values = Object.values(attendanceState);
  const presentCount = values.filter((v) => v.status === 'present').length;
  const absentCount = values.filter((v) => v.status === 'absent').length;

  return (
    <div>
      <PageHeader
        title="Mark Daily Attendance"
        subtitle={`Record attendance and arrival times for ${selectedDate}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/attendance" className="btn btn-secondary btn-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <button
              onClick={handleMarkAllPresent}
              className="btn btn-secondary btn-sm text-emerald-700 hover:bg-emerald-50 border-emerald-300"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="btn btn-primary btn-sm disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save All Records'}
            </button>
          </div>
        }
      />

      {/* Control Banner */}
      <div className="card p-4 mb-6 bg-white border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <label htmlFor="attDate" className="text-xs font-bold text-gray-700">Attendance Date:</label>
            <input
              id="attDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input py-1 px-3 text-xs w-40 border-gray-300 font-medium"
            />
          </div>

          {/* Real-time counters */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              Present: {presentCount}
            </span>
            <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 font-semibold border border-red-200">
              Absent: {absentCount}
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Marking Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-1/4">Candidate Details</th>
                <th className="w-1/4">Status Selection</th>
                <th className="w-32">Check In</th>
                <th className="w-32">Check Out</th>
                <th>Remarks / Notes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No active candidates available.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => {
                  const state = attendanceState[c.id] || { status: 'present', checkInTime: '09:00', checkOutTime: '', remarks: '' };

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Candidate details */}
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} size="sm" />
                          <div>
                            <p className="text-xs font-bold text-gray-900">{c.name}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{c.erp_id || c.id} · {c.department || 'Research'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status Selection Buttons */}
                      <td>
                        <div className="inline-flex rounded-md shadow-xs border border-gray-200 p-0.5 bg-gray-50" role="group">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(c.id, 'present')}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                              state.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                            }`}
                          >
                            Present
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(c.id, 'absent')}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                              state.status === 'absent'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Check In Time */}
                      <td>
                        <input
                          type="time"
                          disabled={state.status === 'absent'}
                          value={state.checkInTime || ''}
                          onChange={(e) => handleFieldChange(c.id, 'checkInTime', e.target.value)}
                          className="input py-1 px-2 text-xs font-mono w-28 disabled:opacity-40 disabled:bg-gray-100"
                        />
                      </td>

                      {/* Check Out Time */}
                      <td>
                        <input
                          type="time"
                          disabled={state.status === 'absent'}
                          value={state.checkOutTime || ''}
                          onChange={(e) => handleFieldChange(c.id, 'checkOutTime', e.target.value)}
                          className="input py-1 px-2 text-xs font-mono w-28 disabled:opacity-40 disabled:bg-gray-100"
                        />
                      </td>

                      {/* Remarks */}
                      <td>
                        <input
                          type="text"
                          placeholder="Optional remarks (e.g. lab work, approved note)"
                          value={state.remarks || ''}
                          onChange={(e) => handleFieldChange(c.id, 'remarks', e.target.value)}
                          className="input py-1 px-2.5 text-xs w-full placeholder:text-gray-300"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-500">
            Ensure all candidate statuses are verified before saving to the central ERP database.
          </p>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="btn btn-primary disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving Attendance...' : 'Save All Records'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
