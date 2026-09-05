// AddTask Modal

import { useState } from 'react';
import { Modal } from '../../../components/common';
import { PROJECTS } from '../../../data/projects';
import { WORKERS } from '../../../data/users';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../../data/tasks';

const AddTaskModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: '', description: '', project: '', assignedTo: '', priority: 'medium',
    startDate: '', dueDate: '', githubRepo: '', githubBranch: '', expectedOutput: '', status: 'assigned',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Task title is required';
    if (!form.project) e.project = 'Project is required';
    if (!form.assignedTo) e.assignedTo = 'Assigned worker is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
    setForm({ title: '', description: '', project: '', assignedTo: '', priority: 'medium', startDate: '', dueDate: '', githubRepo: '', githubBranch: '', expectedOutput: '', status: 'assigned' });
    setErrors({});
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Task" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Task Title *</label>
            <input className={`input ${errors.title ? 'border-red-400' : ''}`} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Enter task title" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Task description..." />
          </div>

          <div>
            <label className="label">Project *</label>
            <select className={`select ${errors.project ? 'border-red-400' : ''}`} value={form.project} onChange={(e) => set('project', e.target.value)}>
              <option value="">Select project</option>
              {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.project && <p className="text-xs text-red-500 mt-1">{errors.project}</p>}
          </div>

          <div>
            <label className="label">Assign To *</label>
            <select className={`select ${errors.assignedTo ? 'border-red-400' : ''}`} value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
              <option value="">Select worker</option>
              {WORKERS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            {errors.assignedTo && <p className="text-xs text-red-500 mt-1">{errors.assignedTo}</p>}
          </div>

          <div>
            <label className="label">Priority</label>
            <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
          </div>

          <div>
            <label className="label">Due Date *</label>
            <input type="date" className={`input ${errors.dueDate ? 'border-red-400' : ''}`} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
          </div>

          <div>
            <label className="label">GitHub Repository</label>
            <input className="input" value={form.githubRepo} onChange={(e) => set('githubRepo', e.target.value)} placeholder="research-org/repo-name" />
          </div>

          <div>
            <label className="label">GitHub Branch</label>
            <input className="input" value={form.githubBranch} onChange={(e) => set('githubBranch', e.target.value)} placeholder="feature/task-name" />
          </div>

          <div className="md:col-span-2">
            <label className="label">Expected Output</label>
            <textarea className="input h-16 resize-none" value={form.expectedOutput} onChange={(e) => set('expectedOutput', e.target.value)} placeholder="Describe the expected deliverables..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary">Create Task</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;
