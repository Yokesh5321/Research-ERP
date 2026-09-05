// Admin Profile Page

import { useState } from 'react';
import { Mail, Phone, GitBranch, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, ProgressBar, Avatar } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_USER } from '../../data/users';
import { formatDate } from '../../utils/formatters';

const AdminProfile = () => {
  const { user } = useAuth();
  const profile = user || ADMIN_USER;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    designation: profile.designation,
    department: profile.department,
    githubUsername: profile.githubUsername,
    skills: profile.skills,
  });

  const handleSave = () => {
    setEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setForm({
      name: profile.name, email: profile.email, phone: profile.phone,
      designation: profile.designation, department: profile.department,
      githubUsername: profile.githubUsername, skills: profile.skills,
    });
    setEditing(false);
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your personal information" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="card p-6 flex flex-col items-center text-center">
          <Avatar name={form.name} size="xl" />
          <h2 className="text-lg font-semibold text-gray-900 mt-4">{form.name}</h2>
          <p className="text-sm text-gray-500">{form.designation}</p>
          <p className="text-xs text-gray-400 mt-0.5">{form.department}</p>
          <span className="mt-3 badge badge-blue">Admin</span>
          <div className="mt-4 w-full space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-gray-500"><Mail className="w-4 h-4" />{form.email}</div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><Phone className="w-4 h-4" />{form.phone}</div>
            {form.githubUsername && <div className="flex items-center gap-2 text-sm text-gray-500"><GitBranch className="w-4 h-4" />{form.githubUsername}</div>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
            {form.skills.map((s) => <span key={s} className="badge badge-gray">{s}</span>)}
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
                  <p className="text-sm text-gray-700 py-2 border-b border-transparent">{form[key] || '—'}</p>
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

export default AdminProfile;
