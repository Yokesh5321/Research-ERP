// Admin Documents Page

import { useState, useEffect } from 'react';
import { Upload, Download, Trash2, FileText, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, ConfirmModal, Pagination } from '../../components/common';
import { DOCUMENTS, DOCUMENT_CATEGORIES } from '../../data/documents';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { formatDate } from '../../utils/formatters';

const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const PAGE_SIZE = 10;

const typeIcon = (type) => {
  if (type === 'pdf') return <File className="w-4 h-4 text-red-500" />;
  if (type === 'docx') return <FileText className="w-4 h-4 text-blue-500" />;
  return <File className="w-4 h-4 text-gray-400" />;
};

const AdminDocuments = () => {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState(DOCUMENTS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = docs.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && d.category !== catFilter) return false;
    if (projectFilter && d.project !== projectFilter) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = () => {
    setDocs((ds) => ds.filter((d) => d.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success('Document deleted');
  };

  if (loading) return <LoadingState message="Loading documents..." />;

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`${docs.length} documents`}
        actions={
          <button onClick={() => toast.success('Upload functionality coming soon')} className="btn btn-primary">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents..." className="w-56" />
        <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} className="select w-48">
          <option value="">All Categories</option>
          {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }} className="select w-48">
          <option value="">All Projects</option>
          {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name.slice(0, 35)}</option>)}
        </select>
        {(search || catFilter || projectFilter) && (
          <button onClick={() => { setSearch(''); setCatFilter(''); setProjectFilter(''); setPage(1); }} className="btn btn-ghost btn-sm text-gray-500">Clear</button>
        )}
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
                <th>Size</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No documents found</td></tr>
              ) : (
                paginated.map((d) => (
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
                    <td className="text-xs text-gray-400">{d.size}</td>
                    <td className="text-xs text-gray-500">{formatDate(d.date)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast.success('Download started')} className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(d.id)} className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmModal open={!!deleteTarget} title="Delete Document" message="Delete this document?" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} danger />
    </div>
  );
};

export default AdminDocuments;
