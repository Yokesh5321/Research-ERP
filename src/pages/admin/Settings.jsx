// Admin Settings Page

import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/common';

const TABS = ['Account', 'Notifications', 'Appearance', 'Security', 'Organization'];

const AdminSettings = () => {
  const [tab, setTab] = useState('Account');
  const [orgName, setOrgName] = useState('Research Organization');
  const [theme, setTheme] = useState('light');

  const handleSave = () => toast.success('Settings saved successfully');

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and application settings" />

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`w-full text-left px-3 py-2 text-sm rounded-md ${tab === t ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                {t}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {tab === 'Account' && (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Account Settings</h3>
              <div>
                <label className="label">Full Name</label>
                <input className="input" defaultValue="Dr. Rajesh Kumar" />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" defaultValue="admin@researcherp.org" type="email" />
              </div>
              <div>
                <label className="label">Designation</label>
                <input className="input" defaultValue="Research Director" />
              </div>
              <div>
                <label className="label">Department</label>
                <input className="input" defaultValue="Administration" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" defaultValue="+91 98765 43210" />
              </div>
              <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Notification Preferences</h3>
              {[
                'New task assignments', 'Task deadline reminders', 'GitHub commit alerts',
                'Code execution results', 'Meeting invitations', 'Project status updates', 'Admin comments',
              ].map((item) => (
                <label key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 cursor-pointer">
                  <span className="text-sm text-gray-700">{item}</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                </label>
              ))}
              <button onClick={handleSave} className="btn btn-primary">Save Preferences</button>
            </div>
          )}

          {tab === 'Appearance' && (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Appearance</h3>
              <div>
                <label className="label">Theme</label>
                <select className="select w-48" value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark (coming soon)</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select className="select w-48">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div>
                <label className="label">Timezone</label>
                <select className="select w-48">
                  <option>Asia/Kolkata (IST)</option>
                  <option>UTC</option>
                </select>
              </div>
              <button onClick={handleSave} className="btn btn-primary">Save Appearance</button>
            </div>
          )}

          {tab === 'Security' && (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Security Settings</h3>
              <div>
                <label className="label">Current Password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input className="input" type="password" placeholder="••••••••" />
              </div>
              <button onClick={() => toast.success('Password changed successfully')} className="btn btn-primary">Change Password</button>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account.</p>
                <button onClick={() => toast.success('2FA setup coming soon')} className="btn btn-secondary">Enable 2FA</button>
              </div>
            </div>
          )}

          {tab === 'Organization' && (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">Organization Settings</h3>
              <div>
                <label className="label">Organization Name</label>
                <input className="input" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div>
                <label className="label">Organization Type</label>
                <select className="select">
                  <option>Academic Research Institute</option>
                  <option>R&D Department</option>
                  <option>University</option>
                </select>
              </div>
              <div>
                <label className="label">Default GitHub Organization</label>
                <input className="input" defaultValue="research-org" />
              </div>
              <div>
                <label className="label">Academic Year</label>
                <input className="input" defaultValue="2024-2025" />
              </div>
              <button onClick={handleSave} className="btn btn-primary">Save Organization Settings</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
