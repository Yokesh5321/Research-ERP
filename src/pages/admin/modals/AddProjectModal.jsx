// AddProject Modal

import { useState } from 'react';
import { Modal } from '../../../components/common';
import { WORKERS } from '../../../data/users';
import { RESEARCH_CATEGORIES, PROJECT_PRIORITIES, PROJECT_STATUSES } from '../../../data/projects';

const GITHUB_REPOS_LIST = [
  'research-org/new-project',
  'research-org/ai-research',
  'research-org/bio-analysis',
];

const AddProjectModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    teamName: '', name: '', description: '', category: '', manager: '', team: [], startDate: '', endDate: '', priority: 'medium', githubRepo: '', status: 'planning',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.teamName.trim()) e.teamName = 'Team name is required';
    if (!form.name.trim()) e.name = 'Project name is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.manager) e.manager = 'Project lead is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = 'End date must be after start date';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
    setForm({ teamName: '', name: '', description: '', category: '', manager: '', team: [], startDate: '', endDate: '', priority: 'medium', githubRepo: '', status: 'planning' });
    setErrors({});
  };

  const toggleTeam = (id) => {
    setForm((f) => ({
      ...f, team: f.team.includes(id) ? f.team.filter((t) => t !== id) : [...f.team, id],
    }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Team & Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Team Name *</label>
            <input className={`input ${errors.teamName ? 'border-red-400' : ''}`} value={form.teamName} onChange={(e) => set('teamName', e.target.value)} placeholder="e.g. Team Alpha" />
            {errors.teamName && <p className="text-xs text-red-500 mt-1">{errors.teamName}</p>}
          </div>

          <div>
            <label className="label">Assigned Project Name *</label>
            <input className={`input ${errors.name ? 'border-red-400' : ''}`} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Enter project title" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Team & project description..." />
          </div>

          <div>
            <label className="label">Research Category *</label>
            <select className={`select ${errors.category ? 'border-red-400' : ''}`} value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select category</option>
              {RESEARCH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="label">Project Lead / Manager *</label>
            <select className={`select ${errors.manager ? 'border-red-400' : ''}`} value={form.manager} onChange={(e) => set('manager', e.target.value)}>
              <option value="">Select lead</option>
              {WORKERS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            {errors.manager && <p className="text-xs text-red-500 mt-1">{errors.manager}</p>}
          </div>

          <div>
            <label className="label">Start Date *</label>
            <input type="date" className={`input ${errors.startDate ? 'border-red-400' : ''}`} value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
            {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <label className="label">End Date *</label>
            <input type="date" className={`input ${errors.endDate ? 'border-red-400' : ''}`} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
            {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
          </div>

          <div>
            <label className="label">Priority</label>
            <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {PROJECT_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">GitHub Repository</label>
            <input className="input" value={form.githubRepo} onChange={(e) => set('githubRepo', e.target.value)} placeholder="e.g. research-org/project-name" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Student Interns (Team Members)</label>
            <div className="border border-gray-200 rounded-md p-3 max-h-36 overflow-y-auto space-y-1">
              {WORKERS.map((w) => (
                <label key={w.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input type="checkbox" checked={form.team.includes(w.id)} onChange={() => toggleTeam(w.id)} className="rounded" />
                  <span className="text-sm font-medium text-gray-800">{w.name}</span>
                  <span className="text-xs text-gray-500">· {w.department}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn btn-secondary text-base">Cancel</button>
          <button type="submit" className="btn btn-primary text-base">Create Team</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectModal;
