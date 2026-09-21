// Admin - Individual Candidate Attendance Analytics & Summary

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Users, CheckCircle2, Clock, XCircle, AlertCircle,
  ArrowLeft, BarChart2, Calendar, User, Mail, Building,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { StatCard, LoadingState, PageHeader, ProgressBar, Avatar } from '../../../components/common';
import { api } from '../../../services/api';
import { formatDate } from '../../../utils/formatters';
import { WORKERS } from '../../../data/users';
import { SEED_ATTENDANCE } from '../../../data/attendance';

const CandidateAttendanceSummary = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidateId || 'w-001');
  const [data, setData] = useState(null);

  // Fetch candidate list for dropdown
  useEffect(() => {
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
    fetchCandidates();
  }, []);

  // Update selection when URL param changes
  useEffect(() => {
    if (candidateId) {
      setSelectedCandidateId(candidateId);
    }
  }, [candidateId]);

  // Fetch summary for selected candidate
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await api.attendance.getCandidateSummary(selectedCandidateId);
        if (res?.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Candidate summary fallback:', err.message);
        // Fallback calculations
        const cand = candidates.find((c) => c.id === selectedCandidateId || c.erp_id === selectedCandidateId) || WORKERS[0];
        const records = SEED_ATTENDANCE.filter((a) => a.candidate_id === cand.id || a.candidate_erp === cand.id);
        const total = records.length || 1;
        const present = records.filter((r) => r.status === 'present').length;
        const absent = records.filter((r) => r.status === 'absent').length;
        const pct = Math.round((present / total) * 100);

        setData({
          candidate: cand,
          stats: {
            totalDays: total,
            present,
            absent,
            percentage: pct,
          },
          monthlyTrend: [
            { month: '2024-07', present: 20, absent: 2 },
            { month: '2024-08', present: 21, absent: 1 },
            { month: '2024-09', present: present || 17, absent: absent || 1 },
          ],
          records,
        });
      } finally {
        setLoading(false);
      }
    };

    if (selectedCandidateId) {
      fetchSummary();
    }
  }, [selectedCandidateId, candidates]);

  const handleCandidateChange = (newId) => {
    setSelectedCandidateId(newId);
    navigate(`/admin/attendance/candidate/${newId}`);
  };

  if (loading || !data) return <LoadingState message="Loading candidate attendance analytics..." />;

  const { candidate, stats, monthlyTrend = [], records = [] } = data;

  return (
    <div>
      <PageHeader
        title="Candidate Attendance Analytics"
        subtitle={`Historical attendance and punctuality profile for ${candidate.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/attendance" className="btn btn-secondary btn-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <Link to="/admin/attendance/history" className="btn btn-secondary btn-sm">
              <Calendar className="w-3.5 h-3.5" /> History Log
            </Link>
            <Link to="/admin/attendance/mark" className="btn btn-primary btn-sm">
              <CalendarCheck className="w-3.5 h-3.5" /> Mark Today
            </Link>
          </div>
        }
      />

      {/* Candidate Selector & Info Card */}
      <div className="card p-5 mb-6 bg-white border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={candidate.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">{candidate.name}</h2>
                <span className="badge badge-blue text-[11px] font-mono">{candidate.erp_id || candidate.id}</span>
                <span className="badge badge-green text-[11px]">Active Scholar</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{candidate.designation || 'Research Scholar'} · {candidate.department || 'Research'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{candidate.email}</p>
            </div>
          </div>

          {/* Quick Dropdown to switch candidate */}
          <div className="w-full md:w-64">
            <label className="text-[11px] font-semibold text-gray-500 block mb-1">Switch Candidate</label>
            <select
              value={selectedCandidateId}
              onChange={(e) => handleCandidateChange(e.target.value)}
              className="select text-xs w-full"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.erp_id || c.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Working Days" value={stats.totalDays} icon={Calendar} color="blue" />
        <StatCard label="Days Present" value={stats.present} icon={CheckCircle2} color="green" />
        <StatCard label="Absent Days" value={stats.absent} icon={XCircle} color="red" />
        <StatCard label="Attendance Rate" value={`${stats.percentage}%`} icon={BarChart2} color="purple" />
      </div>

      {/* Monthly Attendance Chart & Rate Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Trend Chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Monthly Attendance Trend</h3>
          <p className="text-xs text-gray-400 mb-4">Turnout breakdown across recent months</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="present" name="Present" fill="#16a34a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Scorecard */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Attendance Scorecard</h3>
            <p className="text-xs text-gray-400 mt-0.5">Reliability & Compliance Evaluation</p>

            <div className="mt-5 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 border-4 border-blue-600 mb-2">
                <span className="text-2xl font-black text-blue-700">{stats.percentage}%</span>
              </div>
              <p className="text-xs font-bold text-gray-800">
                {stats.percentage >= 90 ? 'Exceptional Attendance' :
                 stats.percentage >= 75 ? 'Good Standing' : 'Below Attendance Benchmark'}
              </p>
            </div>

            <div className="space-y-2 mt-5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Present Days:</span>
                <strong className="text-emerald-700 font-bold">{stats.present}</strong>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Absent Days:</span>
                <strong className="text-red-600 font-bold">{stats.absent}</strong>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Total Days Logged:</span>
                <strong className="text-gray-900">{stats.totalDays}</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Link
              to={`/admin/attendance/history?candidate=${candidate.id}`}
              className="btn btn-secondary w-full justify-center text-xs"
            >
              Filter in Full History
            </Link>
          </div>
        </div>
      </div>

      {/* Candidate Individual Records Table */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Detailed Attendance Log for {candidate.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Chronological record of all daily logins and statuses</p>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No attendance records found for this candidate.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const inTime = r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                  const outTime = r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

                  return (
                    <tr key={r.id || r.attendance_date}>
                      <td className="font-mono text-xs font-semibold text-gray-800">
                        {r.attendance_date}
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
                      <td className="text-xs text-gray-500">{r.remarks || '—'}</td>
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

export default CandidateAttendanceSummary;
