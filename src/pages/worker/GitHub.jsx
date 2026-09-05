// Worker GitHub Page

import { useState, useEffect } from 'react';
import { GitBranch, GitCommit } from 'lucide-react';
import { PageHeader, LoadingState, EmptyState, SearchBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { GITHUB_COMMITS, GITHUB_REPOS } from '../../data/github';
import { PROJECTS } from '../../data/projects';
import { formatRelativeTime } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const WorkerGitHub = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const myCommits = GITHUB_COMMITS.filter((c) => c.author === userId);
  const myRepos = [...new Set(myCommits.map((c) => c.repo))];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = myCommits.filter((c) => {
    if (!search) return true;
    return c.message.toLowerCase().includes(search.toLowerCase()) || c.repo.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <LoadingState message="Loading GitHub data..." />;

  return (
    <div>
      <PageHeader title="GitHub Activity" subtitle={`${myCommits.length} commits across ${myRepos.length} repositories`} />

      {/* My Repos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {myRepos.map((repo) => {
          const repoData = GITHUB_REPOS.find((r) => r.name === repo);
          const project = repoData ? projectMap[repoData.project] : null;
          const repoCommits = myCommits.filter((c) => c.repo === repo);
          return (
            <div key={repo} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">{repo.split('/')[1]}</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{project?.name?.slice(0, 30) || '—'}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-gray-500"><GitCommit className="w-3.5 h-3.5" />{repoCommits.length} commits</div>
              </div>
            </div>
          );
        })}
        {myRepos.length === 0 && (
          <div className="md:col-span-3">
            <EmptyState title="No repositories" message="You haven't made any commits yet." />
          </div>
        )}
      </div>

      {/* Commit Table */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">My Commits</h3>
          <SearchBar value={search} onChange={setSearch} placeholder="Search commits..." className="w-56" />
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Branch</th>
                <th>Commit</th>
                <th>Message</th>
                <th>Changes</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No commits found</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="text-xs font-medium text-gray-700">{c.repo.split('/')[1]}</td>
                    <td className="text-xs font-mono text-gray-500">{c.branch.split('/').pop()}</td>
                    <td className="text-xs font-mono text-gray-600">{c.sha}</td>
                    <td className="text-xs text-gray-700 max-w-[200px] truncate">{c.message}</td>
                    <td className="text-xs">
                      <span className="text-green-600">+{c.additions}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600">-{c.deletions}</span>
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
  );
};

export default WorkerGitHub;
