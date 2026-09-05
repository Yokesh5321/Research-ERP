// Worker Profile Page

import { useState } from 'react';
import { Mail, Phone, GitBranch, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { WORKERS } from '../../data/users';
import { PROJECTS } from '../../data/projects';
import { TASKS } from '../../data/tasks';
import { formatDate } from '../../utils/formatters';

const WorkerProfile = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const workerData = WORKERS.find((w) => w.id === userId) || WORKERS[0];

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: workerData.name,
    email: workerData.email,
    phone: workerData.phone,
    designation: workerData.designation,
    department: workerData.department,
    githubUsername: workerData.githubUsername,
    skills: workerData.skills,
  });

  const myProjects = PROJECTS.filter((p) => p.team.includes(userId) || p.manager === userId);
  const myTasks = TASKS.filter((t) => t.assignedTo === userId);
  const completedTasks = myTasks.filter((t) => t.status === 'completed');
  const activeTasks = myTasks.filter((t) => !['completed', 'failed', 'not_started'].includes(t.status));

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setForm({
      name: workerData.name, email: workerData.email, phone: workerData.phone,
      designation: workerData.designation, department: workerData.department,
      githubUsername: workerData.githubUsername, skills: workerData.skills,
    });
    setEditing(false);
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal information and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <Avatar name={form.name} size="xl" />
          <h2 className="text-lg font-semibold text-gray-900 mt-4">{form.name}</h2>
          <p className="text-sm text-gray-500">{form.designation}</p>
          <p className="text-xs text-gray-400">{form.department}</p>
          <StatusBadge type="user" value={workerData.status} />

          <div className="w-full mt-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5" />{form.email}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5" />{form.phone}</div>
            {form.githubUsername && <div className="flex items-center gap-2 text-xs text-gray-500"><GitBranch className="w-3.5 h-3.5" />{form.githubUsername}</div>}
          </div>

          <div className="w-full mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500">Performance</span>
              <span className="font-semibold text-blue-700">{workerData.performance}%</span>
            </div>
            <ProgressBar value={workerData.performance} />
          </div>

          <div className="w-full mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
            <div className="text-center"><p className="text-base font-bold text-gray-800">{myProjects.length}</p><p className="text-xs text-gray-400">Projects</p></div>
            <div className="text-center"><p className="text-base font-bold text-blue-600">{activeTasks.length}</p><p className="text-xs text-gray-400">Active</p></div>
            <div className="text-center"><p className="text-base font-bold text-green-600">{completedTasks.length}</p><p className="text-xs text-gray-400">Done</p></div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-gray-800">Personal Information</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="btn btn-ghost btn-sm text-gray-500"><X className="w-3.5 h-3.5" /> Cancel</button>
                <button onClick={handleSave} className="btn btn-primary btn-sm"><Save className="w-3.5 h-3.5" /> Save</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', key: 'name' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Designation', key: 'designation' },
              { label: 'Department', key: 'department' },
              { label: 'GitHub Username', key: 'githubUsername' },
            ].map(({ label, key, type = 'text' }) => (
              <div key={key}>
                <label className="label">{label}</label>
                {editing ? (
                  <input type={type} className="input" value={form[key] || ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                ) : (
                  <p className="text-sm text-gray-700 py-2">{form[key] || '—'}</p>
                )}
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="label">Skills</label>
              {editing ? (
                <input className="input" value={form.skills.join(', ')} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value.split(', ').map((s) => s.trim()) }))} placeholder="Skills (comma-separated)" />
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.skills.map((s) => <span key={s} className="badge badge-blue">{s}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
