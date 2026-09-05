// Worker Execution Detail - same component, different prefix routing

import AdminExecutionDetail from '../admin/ExecutionDetail';

// Re-export with worker prefix
const WorkerExecutionDetail = () => <AdminExecutionDetail prefix="worker" />;

export default WorkerExecutionDetail;
