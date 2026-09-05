// Status label and color helpers

export const PROJECT_STATUS_CONFIG = {
  planning: { label: 'Planning', badge: 'badge-blue' },
  active: { label: 'Active', badge: 'badge-green' },
  on_hold: { label: 'On Hold', badge: 'badge-yellow' },
  completed: { label: 'Completed', badge: 'badge-gray' },
  cancelled: { label: 'Cancelled', badge: 'badge-red' },
};

export const TASK_STATUS_CONFIG = {
  not_started: { label: 'Not Started', badge: 'badge-gray' },
  assigned: { label: 'Assigned', badge: 'badge-blue' },
  in_progress: { label: 'In Progress', badge: 'badge-purple' },
  submitted: { label: 'Submitted', badge: 'badge-yellow' },
  under_review: { label: 'Under Review', badge: 'badge-orange' },
  completed: { label: 'Completed', badge: 'badge-green' },
  failed: { label: 'Failed', badge: 'badge-red' },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Low', badge: 'badge-gray' },
  medium: { label: 'Medium', badge: 'badge-blue' },
  high: { label: 'High', badge: 'badge-orange' },
  critical: { label: 'Critical', badge: 'badge-red' },
};

export const EXECUTION_STATUS_CONFIG = {
  queued: { label: 'Queued', badge: 'badge-gray' },
  running: { label: 'Running', badge: 'badge-blue' },
  passed: { label: 'Passed', badge: 'badge-green' },
  failed: { label: 'Failed', badge: 'badge-red' },
  timeout: { label: 'Timeout', badge: 'badge-yellow' },
};

export const MEETING_STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', badge: 'badge-blue' },
  in_progress: { label: 'In Progress', badge: 'badge-green' },
  completed: { label: 'Completed', badge: 'badge-gray' },
  cancelled: { label: 'Cancelled', badge: 'badge-red' },
};

export const USER_STATUS_CONFIG = {
  active: { label: 'Active', badge: 'badge-green' },
  inactive: { label: 'Inactive', badge: 'badge-gray' },
};

export const GITHUB_STATUS_CONFIG = {
  passed: { label: 'Passed', badge: 'badge-green' },
  failed: { label: 'Failed', badge: 'badge-red' },
  running: { label: 'Running', badge: 'badge-blue' },
  pending: { label: 'Pending', badge: 'badge-yellow' },
};
