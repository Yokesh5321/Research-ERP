// Admin Task Detail Page

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, CheckCircle, Clock, Circle, PlayCircle, Eye } from 'lucide-react';
import { LoadingState, EmptyState, ProgressBar, Avatar } from '../../components/common';
import StatusBadge from '../../components/badges/StatusBadge';
import { TASKS } from '../../data/tasks';
import { PROJECTS } from '../../data/projects';
import { WORKERS } from '../../data/users';
import { EXECUTIONS } from '../../data/executions';
import { formatDate, formatDateTime } from '../../utils/formatters';

const workerMap = Object.fromEntries(WORKERS.map((w) => [w.id, w]));
const projectMap = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));

const TIMELINE_STEPS = [
  { key: 'assigned', label: 'Task Assigned', statuses: ['assigned', 'in_progress', 'submitted', 'under_review', 'completed', 'failed'] },
  { key: 'in_progress', label: 'Work Started', statuses: ['in_progress', 'submitted', 'under_review', 'completed', 'failed'] },
  { key: 'submitted', label: 'Code Submitted', statuses: ['submitted', 'under_review', 'completed', 'failed'] },
  { key: 'execution', label: 'Execution', statuses: ['under_review', 'completed', 'failed'] },
  { key: 'review', label: 'Under Review', statuses: ['completed'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
];

const AdminTaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const task = TASKS.find((t) => t.id === id);
  const project = task ? projectMap[task.project] : null;
  const worker = task ? workerMap[task.assignedTo] : null;
  const execution = task?.executionId ? EXECUTIONS.find((e) => e.id === task.executionId) : null;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <LoadingState />;
  if (!task) return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4"><ArrowLeft className="w-4 h-4" /> Back</button>
      <EmptyState title="Task not found" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/admin/tasks')} className="btn btn-ghost btn-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Tasks
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600 truncate">{task.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <StatusBadge type="task" value={task.status} />
              <StatusBadge type="priority" value={task.priority} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">Progress</span>
                <span className="text-xs text-gray-700 font-medium">{task.progress}%</span>
              </div>
              <ProgressBar value={task.progress} />
            </div>

            {task.expectedOutput && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium text-gray-600 mb-1">Expected Output</p>
                <p className="text-sm text-gray-700">{task.expectedOutput}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Task Timeline</h3>
            <div className="relative">
              {TIMELINE_STEPS.map((step, i) => {
                const isDone = step.statuses.includes(task.status);
                const isCurrent = step.key === task.status || (step.key === 'assigned' && task.status === 'not_started');
                return (
                  <div key={step.key} className="flex gap-4 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {isDone ? <CheckCircle className="w-4 h-4 text-green-600" /> : isCurrent ? <Clock className="w-4 h-4 text-blue-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 ${isDone ? 'bg-green-200' : 'bg-gray-200'}`} style={{ minHeight: 20 }} />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className={`text-sm font-medium ${isDone ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GitHub */}
          {task.githubRepo && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><GitBranch className="w-4 h-4" /> GitHub</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Repository</p>
                  <p className="text-sm font-mono text-blue-600">{task.githubRepo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Branch</p>
                  <p className="text-sm font-mono text-gray-700">{task.githubBranch}</p>
                </div>
              </div>
            </div>
          )}

          {/* Execution */}
          {execution && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Latest Execution</h3>
                <Link to={`/admin/executions/${execution.id}`} className="btn btn-ghost btn-sm text-blue-600 text-xs">
                  <Eye className="w-3.5 h-3.5" /> View Detail
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Result</p>
                  <StatusBadge type="execution" value={execution.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="text-sm font-medium text-gray-700">{execution.executionTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tests</p>
                  <p className="text-sm font-medium text-gray-700">{execution.testsPassed}/{execution.totalTests} passed</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Commit</p>
                  <p className="text-sm font-mono text-gray-700">{execution.commit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          {task.comments?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Comments</h3>
              {task.comments.map((c, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-gray-100 last:border-b-0">
                  <Avatar name="Admin" size="sm" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Admin</p>
                    <p className="text-sm text-gray-600">{c}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Task Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-400">Project</dt>
                <dd><Link to={`/admin/projects/${task.project}`} className="text-sm text-blue-600 hover:underline">{project?.name || '—'}</Link></dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Assigned To</dt>
                <dd className="flex items-center gap-2 mt-1">
                  <Avatar name={worker?.name} size="sm" />
                  <Link to={`/admin/workers/${task.assignedTo}`} className="text-sm text-blue-600 hover:underline">{worker?.name || '—'}</Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Start Date</dt>
                <dd className="text-sm text-gray-700">{formatDate(task.startDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Due Date</dt>
                <dd className="text-sm text-gray-700">{formatDate(task.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Submitted At</dt>
                <dd className="text-sm text-gray-700">{task.submittedAt ? formatDate(task.submittedAt) : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Execution</dt>
                <dd className="text-sm text-gray-700">{execution ? <StatusBadge type="execution" value={execution.status} /> : '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskDetail;
