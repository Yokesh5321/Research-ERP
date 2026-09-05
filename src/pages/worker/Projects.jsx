// Worker Projects Page

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingState, EmptyState, PageHeader, SearchBar, ProgressBar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { PROJECTS } from '../../data/projects';
import { formatDate } from '../../utils/formatters';

const WorkerProjects = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const myProjects = PROJECTS.filter((p) => p.team.includes(userId) || p.manager === userId);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = myProjects.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingState message="Loading projects..." />;

  return (
    <div>
      <PageHeader title="My Projects" subtitle={`${myProjects.length} projects assigned to you`} />
      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects..." className="w-64" />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Role</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">{search ? 'No projects found' : 'No projects assigned'}</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <p className="text-xs font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </td>
                    <td className="text-xs text-gray-500">{p.manager === userId ? 'Project Manager' : 'Team Member'}</td>
                    <td><StatusBadge type="project" value={p.status} /></td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <ProgressBar value={p.progress} className="flex-1" />
                        <span className="text-xs text-gray-500">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="text-xs text-gray-500">{formatDate(p.endDate)}</td>
                    <td>
                      <Link to={`/worker/projects/${p.id}`} className="btn btn-secondary btn-sm">View</Link>
                    </td>
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

export default WorkerProjects;
