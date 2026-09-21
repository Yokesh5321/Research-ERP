// Admin Attendance Dashboard

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Users, CheckCircle2, XCircle, Clock, AlertCircle,
  ArrowRight, Calendar, Download, RefreshCw, BarChart2,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { StatCard, LoadingState, PageHeader, ProgressBar, Avatar } from '../../../components/common';
import StatusBadge from '../../../components/badges/StatusBadge';
import { formatDate } from '../../../utils/formatters';
import { api } from '../../../services/api';
import { SEED_ATTENDANCE } from '../../../data/attendance';
import { WORKERS } from '../../../data/users';

const STATUS_COLORS = {
  present: '#16a34a',
  absent: '#dc2626',
};

const AttendanceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState({
    totalCandidates: WORKERS.length,
    present: 0,
    absent: 0,
    attendancePercentage: 0,
    recentActivity: [],
  });

  const loadAttendance = async (date) => {
    try {
      const res = await api.attendance.getSummary(date);
      if (res?.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.warn('Live attendance summary fallback to seed:', err.message);
      const filtered = SEED_ATTENDANCE.filter((a) => a.attendance_date === date);
      const list = filtered.length > 0 ? filtered : SEED_ATTENDANCE;
      const present = list.filter((r) => r.status === 'present').length;
      const absent = list.filter((r) => r.status === 'absent').length;
      const total = WORKERS.length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;

      setSummary({
        date,
        totalCandidates: total,
        present,
        absent,
        attendancePercentage: pct,
        recentActivity: list,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendance(selectedDate);
  };

  if (loading) return <LoadingState message="Loading attendance dashboard..." />;

  const chartData = [
    { name: 'Present', value: summary.present || 0, color: STATUS_COLORS.present },
    { name: 'Absent', value: summary.absent || 0, color: STATUS_COLORS.absent },
  ];

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        subtitle="Monitor and record candidate daily attendance and punctuality"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary btn-sm"
              title="Refresh attendance data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link to="/admin/attendance/history" className="btn btn-secondary btn-sm">
              <Calendar className="w-3.5 h-3.5" /> History
            </Link>
            <Link to="/admin/attendance/mark" className="btn btn-primary btn-sm">
              <CalendarCheck className="w-3.5 h-3.5" /> Mark Today
            </Link>
          </div>
        }
      />

      {/* Date Filter Bar */}
      <div className="card p-3 mb-6 flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-gray-700">Viewing Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input py-1 px-2.5 text-xs w-36 border-gray-300"
          />
          {selectedDate !== new Date().toISOString().split('T')[0] && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-xs text-blue-600 hover:underline font-medium ml-1"
            >
              Reset to Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Total Active Candidates: <strong className="text-gray-900">{summary.totalCandidates}</strong></span>
          <span>•</span>
          <span>Attendance Rate: <strong className="text-emerald-700 font-bold">{summary.attendancePercentage}%</strong></span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Candidates" value={summary.totalCandidates} icon={Users} color="blue" />
        <StatCard label="Present" value={summary.present} icon={CheckCircle2} color="green" />
        <StatCard label="Absent" value={summary.absent} icon={XCircle} color="red" />
        <StatCard label="Attendance Rate" value={`${summary.attendancePercentage}%`} icon={BarChart2} color="purple" />
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Distribution Chart */}
        <div className="card p-5 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Today's Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">Breakdown of active status records</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Summary / Status Ring Card */}
        <div className="card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Attendance Health</h3>
                <p className="text-xs text-gray-400 mt-0.5">Overall daily performance across all research departments</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                summary.attendancePercentage >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {summary.attendancePercentage >= 80 ? 'Optimal Turnout' : 'Requires Attention'}
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>Overall Attendance ({summary.present} / {summary.totalCandidates})</span>
                  <span>{summary.attendancePercentage}%</span>
                </div>
                <ProgressBar value={summary.attendancePercentage} color={summary.attendancePercentage >= 80 ? 'green' : 'yellow'} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-[11px] font-semibold text-emerald-800">Present Scholars</span>
                  <p className="text-base font-bold text-emerald-700">{summary.present}</p>
                </div>
                <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                  <span className="text-[11px] font-semibold text-red-800">Absent Scholars</span>
                  <p className="text-base font-bold text-red-600">{summary.absent}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Need to record attendance for today?</p>
            <Link
              to="/admin/attendance/mark"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Open Mark Daily Attendance <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Activity Table */}
      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recorded Attendance Activity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Entries recorded for {formatDate(selectedDate)}</p>
          </div>
          <Link
            to="/admin/attendance/history"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Full History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Department</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!summary.recentActivity || summary.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No attendance records marked yet for this date.
                    <div className="mt-2">
                      <Link to="/admin/attendance/mark" className="btn btn-primary btn-sm">
                        Mark Attendance Now
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                summary.recentActivity.map((r) => {
                  const candidateName = r.candidate?.name || r.candidate_name || 'Scholar';
                  const candidateEmail = r.candidate?.email || r.candidate_email || '';
                  const candidateErp = r.candidate?.erp_id || r.candidate_erp || r.candidate_id;
                  const candidateDept = r.candidate?.department || r.department || 'Research';
                  const inTime = r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  const outTime = r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={candidateName} size="sm" />
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{candidateName}</p>
                            <p className="text-[11px] text-gray-400">{candidateEmail} ({candidateErp})</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-gray-600">{candidateDept}</td>
                      <td>
                        <span className={`badge ${
                          r.status === 'present' ? 'badge-green' : 'badge-red'
                        }`}>
                          {r.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-xs font-mono text-gray-600">{inTime}</td>
                      <td className="text-xs font-mono text-gray-600">{outTime}</td>
                      <td className="text-xs text-gray-500 max-w-xs truncate">{r.remarks || '—'}</td>
                      <td>
                        <Link
                          to={`/admin/attendance/candidate/${r.candidate_id || candidateErp}`}
                          className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-800"
                          title="View candidate summary"
                        >
                          View Analytics
                        </Link>
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

export default AttendanceDashboard;
