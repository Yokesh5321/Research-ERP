// Admin GitHub Page

import { useState, useEffect } from 'react';
import { GitBranch, GitCommit, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PageHeader, SearchBar, LoadingState, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { GITHUB_COMMITS, GITHUB_ACTIVITY_TIMELINE, GITHUB_REPOS } from '../../data/github';
import { PROJECTS } from '../../data/projects';
import { formatRelativeTime, formatDateTime } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const AdminGitHub = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [repoFilter, setRepoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = GITHUB_COMMITS.filter((c) => {
    if (search && !c.message.toLowerCase().includes(search.toLowerCase()) && !c.authorName.toLowerCase().includes(search.toLowerCase())) return false;
    if (repoFilter && c.repo !== repoFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const activityIcons = {
    commit: <GitCommit className="w-4 h-4 text-blue-500" />,
    execution: <Clock className="w-4 h-4 text-yellow-500" />,
    execution_complete: <CheckCircle className="w-4 h-4 text-green-500" />,
    execution_failed: <XCircle className="w-4 h-4 text-red-500" />,
  };

  if (loading) return <LoadingState message="Loading GitHub data..." />;

  return (
    <div>
      <PageHeader title="GitHub" subtitle="Repository activity and commit history" />

      {/* Repo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {GITHUB_REPOS.slice(0, 4).map((r) => {
          const proj = projectMap[r.project];
          return (
            <div key={r.id} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 truncate">{r.name}</span>
              </div>
              <p className="text-xs text-gray-400 truncate mb-2">{proj?.name || '—'}</p>
              <div className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{r.branches.length} branches</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Commits Table */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex flex-wrap gap-3 items-center">
                <h3 className="text-sm font-semibold text-gray-800">Recent Commits</h3>
                <SearchBar value={search} onChange={setSearch} placeholder="Search commits..." className="w-44" />
                <select value={repoFilter} onChange={(e) => setRepoFilter(e.target.value)} className="select w-44 text-xs">
                  <option value="">All Repos</option>
                  {GITHUB_REPOS.map((r) => <option key={r.id} value={r.name}>{r.name.split('/')[1]}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select w-32 text-xs">
                  <option value="">All Status</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="running">Running</option>
                </select>
              </div>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Repository</th>
                    <th>Branch</th>
                    <th>Commit</th>
                    <th>Author</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No commits found</td></tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <p className="text-xs font-medium text-gray-800">{c.repo.split('/')[1]}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.message}</p>
                        </td>
                        <td className="text-xs font-mono text-gray-500">{c.branch.split('/').pop()}</td>
                        <td className="text-xs font-mono text-gray-600">{c.sha}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <Avatar name={c.authorName} size="sm" />
                            <span className="text-xs text-gray-700">{c.authorName.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="text-xs text-gray-400 whitespace-nowrap">{formatRelativeTime(c.timestamp)}</td>
                        <td><StatusBadge type="github" value={c.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-gray-800">Activity Timeline</h3>
          </div>
          <div className="p-4">
            <div className="relative">
              {GITHUB_ACTIVITY_TIMELINE.map((a, i) => (
                <div key={a.id} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      {activityIcons[a.type] || <GitCommit className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    {i < GITHUB_ACTIVITY_TIMELINE.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" style={{ minHeight: 16 }} />
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="text-xs text-gray-700 leading-snug">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.author} · {formatRelativeTime(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGitHub;
