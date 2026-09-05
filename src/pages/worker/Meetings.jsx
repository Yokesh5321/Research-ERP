// Worker Meetings Page

import { useState, useEffect } from 'react';
import { ExternalLink, Calendar } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { MEETINGS } from '../../data/meetings';
import { PROJECTS } from '../../data/projects';
import { formatDate } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const WorkerMeetings = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  const myMeetings = MEETINGS.filter((m) => m.participants.includes(userId) || m.participants.includes('admin-001'));

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = myMeetings.filter((m) => {
    if (filter === 'upcoming') return m.status === 'upcoming';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  if (loading) return <LoadingState message="Loading meetings..." />;

  return (
    <div>
      <PageHeader title="Meetings" subtitle={`${myMeetings.length} meetings`} />

      <div className="flex gap-1 mb-4">
        {['all', 'upcoming', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost text-gray-600'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="No meetings" message="No meetings found." icon={Calendar} />
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-md ${m.status === 'upcoming' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <Calendar className={`w-5 h-5 ${m.status === 'upcoming' ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge type="meeting" value={m.status} />
                      {m.project && <span className="badge badge-gray">{projectMap[m.project]?.name?.slice(0, 25) || '—'}</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{m.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(m.date)} · {m.time} · {m.duration} minutes · {m.participants.length} participants
                    </p>
                    {m.agenda && <p className="text-xs text-gray-400 mt-1 max-w-lg">{m.agenda}</p>}
                    {m.notes && m.status === 'completed' && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <span className="font-medium">Notes: </span>{m.notes}
                      </div>
                    )}
                  </div>
                </div>
                {m.meetingLink && m.status === 'upcoming' && (
                  <a href={m.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" /> Join Meeting
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerMeetings;
