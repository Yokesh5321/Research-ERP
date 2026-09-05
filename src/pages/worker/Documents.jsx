// Worker Documents Page

import { useState, useEffect } from 'react';
import { Download, FileText, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { DOCUMENTS, DOCUMENT_CATEGORIES } from '../../data/documents';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { formatDate } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));

const typeIcon = (type) => {
  if (type === 'pdf') return <File className="w-4 h-4 text-red-500" />;
  if (type === 'docx') return <FileText className="w-4 h-4 text-blue-500" />;
  return <File className="w-4 h-4 text-gray-400" />;
};

const WorkerDocuments = () => {
  const { user } = useAuth();
  const userId = user?.id || 'w-001';
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  // Worker sees documents related to their projects or uploaded by them or admin
  const myProjectIds = PROJECTS.filter((p) => p.team.includes(userId) || p.manager === userId).map((p) => p.id);
  const myDocs = DOCUMENTS.filter((d) => !d.project || myProjectIds.includes(d.project) || d.uploadedBy === userId || d.uploadedBy === 'admin-001');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = myDocs.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && d.category !== catFilter) return false;
    return true;
  });

  if (loading) return <LoadingState message="Loading documents..." />;

  return (
    <div>
      <PageHeader title="Documents" subtitle={`${myDocs.length} documents available`} />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents..." className="w-56" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="select w-48">
          <option value="">All Categories</option>
          {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Project</th>
                <th>Uploaded By</th>
                <th>Version</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No documents found</td></tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {typeIcon(d.type)}
                        <span className="text-xs font-medium text-gray-800">{d.name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-gray text-xs">{d.category}</span></td>
                    <td className="text-xs text-gray-500">{d.project ? projectMap[d.project]?.name?.slice(0, 25) : '—'}</td>
                    <td className="text-xs text-gray-600">{d.uploadedBy === 'admin-001' ? 'Admin' : workerMap[d.uploadedBy]?.name || '—'}</td>
                    <td className="text-xs text-gray-500">v{d.version}</td>
                    <td className="text-xs text-gray-500">{formatDate(d.date)}</td>
                    <td>
                      <button onClick={() => toast.success('Download started')} className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600" title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </button>
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

export default WorkerDocuments;
