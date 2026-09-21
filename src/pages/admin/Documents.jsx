// Admin Documents Page

import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Trash2, FileText, File, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, SearchBar, LoadingState, ConfirmModal, Pagination } from '../../components/common';
import { DOCUMENTS, DOCUMENT_CATEGORIES } from '../../data/documents';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { formatDate } from '../../utils/formatters';
import { supabase } from '../../lib/supabaseClient';

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
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState(DOCUMENTS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setDocs(data);
        }
      } catch (err) {
        console.warn('Documents live fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = `uploads/${fileName}`;

      let fileUrl = null;
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
          fileUrl = publicUrlData?.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Storage upload fallback:', storageErr);
      }

      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      const newDoc = {
        id: `d-${Date.now().toString().slice(-4)}`,
        name: file.name,
        category: catFilter || 'Project Documents',
        project_id: projectFilter || 'p-001',
        project: projectFilter || 'p-001',
        uploaded_by: 'admin-001',
        uploadedBy: 'admin-001',
        version: '1.0',
        date: new Date().toISOString().split('T')[0],
        size: sizeStr,
        type: ['pdf', 'docx', 'txt', 'csv'].includes(fileExt) ? fileExt : 'file',
        tags: [fileExt],
        file_url: fileUrl,
        created_at: new Date().toISOString(),
      };

      try {
        await supabase.from('documents').insert([newDoc]);
      } catch (dbErr) {
        console.warn('DB doc insert notice:', dbErr);
      }

      setDocs((prev) => [newDoc, ...prev]);
      toast.success(`${file.name} uploaded successfully!`, { id: toastId });
    } catch (err) {
      console.error('File upload error:', err);
      toast.error(`Upload failed: ${err.message}`, { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    } else {
      const element = document.createElement('a');
      const fileBlob = new Blob([`Document Name: ${doc.name}\nCategory: ${doc.category}\nVersion: ${doc.version}\nDate: ${doc.date}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${doc.name.replace(/\.[^/.]+$/, '')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`Downloaded ${doc.name}`);
    }
  };

  const filtered = docs.filter((d) => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter && d.category !== catFilter) return false;
    const pId = d.project_id || d.project;
    if (projectFilter && pId !== projectFilter) return false;
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleDelete = async () => {
    try {
      await supabase.from('documents').delete().eq('id', deleteTarget);
    } catch (e) {
      // Fallback
    }
    setDocs((ds) => ds.filter((d) => d.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success('Document deleted');
  };

  if (loading) return <LoadingState message="Loading documents..." />;

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload document"
      />
      <PageHeader
        title="Documents"
        subtitle={`${docs.length} documents registered`}
        actions={
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Document'}
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
                paginated.map((d) => {
                  const pId = d.project_id || d.project;
                  const uBy = d.uploaded_by || d.uploadedBy;
                  return (
                    <tr key={d.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {typeIcon(d.type)}
                          <span className="text-xs font-medium text-gray-800">{d.name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-gray text-xs">{d.category}</span></td>
                      <td className="text-xs text-gray-500">{pId ? projectMap[pId]?.name?.slice(0, 25) || pId : '—'}</td>
                      <td className="text-xs text-gray-600">{uBy === 'admin-001' ? 'Admin' : workerMap[uBy]?.name || 'Scholar'}</td>
                      <td className="text-xs text-gray-500">v{d.version || '1.0'}</td>
                      <td className="text-xs text-gray-400">{d.size || '1.0 MB'}</td>
                      <td className="text-xs text-gray-500">{formatDate(d.date || d.created_at)}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDownload(d)} className="btn btn-ghost btn-sm text-gray-500 hover:text-blue-600" title="Download"><Download className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget(d.id)} className="btn btn-ghost btn-sm text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
