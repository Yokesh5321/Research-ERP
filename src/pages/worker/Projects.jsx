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

  if (loading) return <LoadingState message="Loading teams..." />;

  return (
    <div>
      <PageHeader title="My Teams" subtitle={`${myProjects.length} teams assigned to you`} />
      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search teams or projects..." className="w-72" />
      </div>

      <div className="card shadow-sm">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="text-sm font-bold">Team Name</th>
                <th className="text-sm font-bold">Assigned Project</th>
                <th className="text-sm font-bold">My Role</th>
                <th className="text-sm font-bold">Status</th>
                <th className="text-sm font-bold">Progress</th>
                <th className="text-sm font-bold">Deadline</th>
                <th className="text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-base">{search ? 'No teams found' : 'No teams assigned'}</td></tr>
              ) : (
                filtered.map((p) => {
                  const mgr = p.manager || p.manager_id;
                  const endDate = p.endDate || p.end_date;
                  const teamTitle = p.teamName || `Team ${p.name.split(' ')[0]}`;

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                      <td>
                        <Link to={`/worker/projects/${p.id}`} className="text-blue-700 hover:text-blue-900 font-bold text-base hover:underline block">
                          {teamTitle}
                        </Link>
                      </td>
                      <td>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.category}</p>
                      </td>
                      <td className="text-sm text-gray-600 font-medium">{mgr === userId ? 'Team Lead' : 'Student Intern'}</td>
                      <td><StatusBadge type="project" value={p.status} /></td>
                      <td>
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <ProgressBar value={p.progress || 0} className="flex-1" />
                          <span className="text-xs font-semibold text-gray-600 w-9">{p.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(endDate)}</td>
                      <td>
                        <Link to={`/worker/projects/${p.id}`} className="btn btn-secondary btn-sm text-sm font-semibold">View Details</Link>
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
