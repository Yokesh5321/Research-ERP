// Admin Meetings Page

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, ConfirmModal, EmptyState, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { MEETINGS } from '../../data/meetings';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { formatDate } from '../../utils/formatters';
import AddMeetingModal from './modals/AddMeetingModal';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));

const AdminMeetings = () => {
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState(MEETINGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = meetings.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  const handleAdd = (data) => {
    setMeetings((ms) => [{ ...data, id: `m-${Date.now()}`, createdBy: 'admin-001' }, ...ms]);
    setShowAdd(false);
    toast.success('Meeting scheduled successfully');
  };

  const handleDelete = () => {
    setMeetings((ms) => ms.filter((m) => m.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success('Meeting deleted');
  };

  if (loading) return <LoadingState message="Loading meetings..." />;

  return (
    <div>
      <PageHeader
        title="Meetings"
        subtitle={`${meetings.length} meetings total`}
        actions={
          <button onClick={() => setShowAdd(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search meetings..." className="w-56" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select w-36">
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Meeting</th>
                <th>Project</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Participants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No meetings found</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <p className="text-xs font-medium text-gray-800">{m.title}</p>
                      {m.agenda && <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{m.agenda.slice(0, 50)}...</p>}
                    </td>
                    <td className="text-xs text-gray-500">{m.project ? projectMap[m.project]?.name?.slice(0, 25) : 'All Hands'}</td>
                    <td className="text-xs text-gray-600 whitespace-nowrap">{formatDate(m.date)} · {m.time}</td>
                    <td className="text-xs text-gray-500">{m.duration} min</td>
                    <td className="text-xs text-gray-500">{m.participants.length} attendees</td>
                    <td><StatusBadge type="meeting" value={m.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        {m.meetingLink && (
                          <a href={m.meetingLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600" title="Join">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button onClick={() => toast.success('Edit coming soon')} className="btn btn-ghost btn-sm text-gray-500 hover:text-amber-600" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(m.id)} className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddMeetingModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
      <ConfirmModal open={!!deleteTarget} title="Delete Meeting" message="Delete this meeting?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
    </div>
  );
};

export default AdminMeetings;
