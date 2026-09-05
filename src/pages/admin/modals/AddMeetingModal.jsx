// AddMeeting Modal

import { useState } from 'react';
import { Modal } from '../../../components/common';
import { PROJECTS } from '../../../data/projects';
import { WORKERS } from '../../../data/users';
import { ADMIN_USER } from '../../../data/users';

const AddMeetingModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: '', project: '', date: '', time: '', duration: '60',
    participants: [], meetingLink: '', status: 'upcoming', agenda: '', notes: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.time) e.time = 'Time is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
    setForm({ title: '', project: '', date: '', time: '', duration: '60', participants: [], meetingLink: '', status: 'upcoming', agenda: '', notes: '' });
    setErrors({});
  };

  const toggleParticipant = (id) => {
    setForm((f) => ({ ...f, participants: f.participants.includes(id) ? f.participants.filter((p) => p !== id) : [...f.participants, id] }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule Meeting" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Meeting Title *</label>
            <input className={`input ${errors.title ? 'border-red-400' : ''}`} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Meeting title" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="label">Project</label>
            <select className="select" value={form.project} onChange={(e) => set('project', e.target.value)}>
              <option value="">All Hands / General</option>
              {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name.slice(0, 40)}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" className="input" value={form.duration} onChange={(e) => set('duration', e.target.value)} min="15" max="480" />
          </div>

          <div>
            <label className="label">Date *</label>
            <input type="date" className={`input ${errors.date ? 'border-red-400' : ''}`} value={form.date} onChange={(e) => set('date', e.target.value)} />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="label">Time *</label>
            <input type="time" className={`input ${errors.time ? 'border-red-400' : ''}`} value={form.time} onChange={(e) => set('time', e.target.value)} />
            {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="label">Meeting Link</label>
            <input className="input" value={form.meetingLink} onChange={(e) => set('meetingLink', e.target.value)} placeholder="https://meet.google.com/..." />
          </div>

          <div className="md:col-span-2">
            <label className="label">Agenda</label>
            <textarea className="input h-16 resize-none" value={form.agenda} onChange={(e) => set('agenda', e.target.value)} placeholder="Meeting agenda..." />
          </div>

          <div className="md:col-span-2">
            <label className="label">Participants</label>
            <div className="border border-gray-200 rounded-md p-3 max-h-36 overflow-y-auto space-y-1">
              {WORKERS.map((w) => (
                <label key={w.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input type="checkbox" checked={form.participants.includes(w.id)} onChange={() => toggleParticipant(w.id)} className="rounded" />
                  <span className="text-sm text-gray-700">{w.name}</span>
                  <span className="text-xs text-gray-400">· {w.department}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary">Schedule Meeting</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMeetingModal;
