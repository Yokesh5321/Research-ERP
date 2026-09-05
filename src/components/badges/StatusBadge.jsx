// StatusBadge component

import { PROJECT_STATUS_CONFIG, TASK_STATUS_CONFIG, PRIORITY_CONFIG, EXECUTION_STATUS_CONFIG, MEETING_STATUS_CONFIG, USER_STATUS_CONFIG, GITHUB_STATUS_CONFIG } from '../../utils/constants';

const CONFIG_MAP = {
  project: PROJECT_STATUS_CONFIG,
  task: TASK_STATUS_CONFIG,
  priority: PRIORITY_CONFIG,
  execution: EXECUTION_STATUS_CONFIG,
  meeting: MEETING_STATUS_CONFIG,
  user: USER_STATUS_CONFIG,
  github: GITHUB_STATUS_CONFIG,
};

const StatusBadge = ({ type, value }) => {
  const config = CONFIG_MAP[type] || {};
  const statusConfig = config[value];

  if (!statusConfig) {
    return <span className="badge badge-gray">{value || '—'}</span>;
  }

  return <span className={`badge ${statusConfig.badge}`}>{statusConfig.label}</span>;
};

export default StatusBadge;
