// Admin Execution Detail Page

import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { EmptyState } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { EXECUTIONS } from '../../data/executions';
import { TASKS } from '../../data/tasks';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { formatDateTime } from '../../utils/formatters';

const taskMap = Object.fromEntries(TASKS.map((t) => [t.id, t]));
const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));

const AdminExecutionDetail = ({ prefix = 'admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const ex = EXECUTIONS.find((e) => e.id === id);
  if (!ex) return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <EmptyState title="Execution not found" />
    </div>
  );

  const task = taskMap[ex.task];
  const project = projectMap[ex.project];
  const worker = workerMap[ex.student];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(`/${prefix}/executions`)} className="btn btn-ghost btn-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Executions
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-mono text-gray-600">{ex.submissionId}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status Banner */}
          <div className={`rounded-lg p-4 border ${ex.status === 'passed' ? 'bg-green-50 border-green-200' : ex.status === 'failed' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-3">
              {ex.status === 'passed' ? <CheckCircle className="w-6 h-6 text-green-600" /> : ex.status === 'failed' ? <XCircle className="w-6 h-6 text-red-600" /> : <Clock className="w-5 h-5 text-blue-600" />}
              <div>
                <p className="text-sm font-semibold text-gray-800">Execution {ex.finalResult}</p>
                <p className="text-xs text-gray-500">{ex.testsPassed} of {ex.totalTests} tests passed · {ex.executionTime}</p>
              </div>
            </div>
          </div>

          {/* Test Cases */}
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Test Cases</h3></div>
            <div className="divide-y divide-gray-100">
              {ex.testCases.map((tc, i) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tc.status === 'passed' ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    <span className="text-sm text-gray-700">{tc.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{tc.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Console Output */}
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Console Output</h3></div>
            <div className="p-4">
              <pre className="text-xs text-gray-700 bg-gray-50 rounded-md p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{ex.consoleOutput || 'No output'}</pre>
            </div>
          </div>

          {/* Error Output */}
          {ex.errorOutput && (
            <div className="card">
              <div className="card-header"><h3 className="text-sm font-semibold text-red-700">Error Output</h3></div>
              <div className="p-4">
                <pre className="text-xs text-red-700 bg-red-50 rounded-md p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">{ex.errorOutput}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Submission Info</h3>
            <dl className="space-y-3">
              <div><dt className="text-xs text-gray-400">Submission ID</dt><dd className="text-xs font-mono text-gray-700">{ex.submissionId}</dd></div>
              <div><dt className="text-xs text-gray-400">Student</dt><dd className="text-sm font-medium text-gray-700">{worker?.name || '—'}</dd></div>
              <div><dt className="text-xs text-gray-400">Project</dt><dd className="text-sm text-blue-600 hover:underline"><Link to={`/${prefix}/projects/${ex.project}`}>{project?.name?.slice(0, 30) || '—'}</Link></dd></div>
              <div><dt className="text-xs text-gray-400">Task</dt><dd className="text-sm text-blue-600 hover:underline"><Link to={`/${prefix}/tasks/${ex.task}`}>{task?.title?.slice(0, 30) || '—'}</Link></dd></div>
              <div><dt className="text-xs text-gray-400">Commit</dt><dd className="text-xs font-mono text-gray-700">{ex.commit}</dd></div>
              <div><dt className="text-xs text-gray-400">Commit Message</dt><dd className="text-xs text-gray-600">{ex.commitMessage}</dd></div>
              <div><dt className="text-xs text-gray-400">Started At</dt><dd className="text-xs text-gray-600">{formatDateTime(ex.startTime)}</dd></div>
              <div><dt className="text-xs text-gray-400">Finished At</dt><dd className="text-xs text-gray-600">{formatDateTime(ex.endTime)}</dd></div>
              <div><dt className="text-xs text-gray-400">Duration</dt><dd className="text-sm font-medium text-gray-700">{ex.executionTime}</dd></div>
              <div><dt className="text-xs text-gray-400">Final Result</dt><dd><StatusBadge type="execution" value={ex.status} /></dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExecutionDetail;
