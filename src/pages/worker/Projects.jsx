// Worker Projects Page

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingState, EmptyState, PageHeader, SearchBar, ProgressBar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { PROJECTS } from '../../data/projects';
import { formatDate } from '../../utils/formatters';
import { api } from '../../services/api';

const WorkerProjects = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
        const res = await api.projects.getAll();
        let fetched = [];
        if (res && res.success && Array.isArray(res.data)) {
          fetched = res.data;
        }
        const knownIds = new Set(fetched.map((p) => p.id));
        const combined = [...localCustom.filter((cp) => !knownIds.has(cp.id)), ...fetched];
        if (combined.length === 0) {
          setProjects(PROJECTS);
        } else {
          setProjects(combined);
        }
      } catch (err) {
        console.warn('WorkerProjects fetch error:', err);
        const localCustom = JSON.parse(localStorage.getItem('custom_projects') || '[]');
        const knownIds = new Set(localCustom.map((p) => p.id));
        setProjects([...localCustom, ...PROJECTS.filter((p) => !knownIds.has(p.id))]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const myProjects = projects.filter((p) => {
    const mgr = p.manager || p.manager_id;
    const team = Array.isArray(p.team) ? p.team : [];
    return team.includes(userId) || mgr === userId;
  });

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
                filtered.map((p) => {
                  const mgr = p.manager || p.manager_id;
                  const endDate = p.endDate || p.end_date;
                  return (
                    <tr key={p.id}>
                      <td>
                        <p className="text-xs font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </td>
                      <td className="text-xs text-gray-500">{mgr === userId ? 'Project Manager' : 'Team Member'}</td>
                      <td><StatusBadge type="project" value={p.status} /></td>
                      <td>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <ProgressBar value={p.progress || 0} className="flex-1" />
                          <span className="text-xs text-gray-500">{p.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="text-xs text-gray-500">{formatDate(endDate)}</td>
                      <td>
                        <Link to={`/worker/projects/${p.id}`} className="btn btn-secondary btn-sm">View</Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkerProjects;
