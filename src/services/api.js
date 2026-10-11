/**
 * Research ERP — Direct Supabase Client API Service
 * Replaces the Express backend with direct Supabase database and auth operations.
 * Pure frontend — zero backend server required!
 */

import { supabase } from '../lib/supabaseClient';
import { WORKERS } from '../data/users';
import { SEED_ATTENDANCE } from '../data/attendance';

// Helper to normalize project properties
const normalizeProject = (p) => {
  if (!p) return null;
  const sDate = p.startDate || p.start_date || new Date().toISOString().split('T')[0];
  const eDate = p.endDate || p.end_date || null;
  const repo = p.githubRepo || p.github_repo || '';
  const cAt = p.createdAt || p.created_at || new Date().toISOString();
  const uAt = p.updatedAt || p.updated_at || new Date().toISOString();
  const tTasks = p.totalTasks !== undefined ? p.totalTasks : (p.total_tasks || 0);
  const cTasks = p.completedTasks !== undefined ? p.completedTasks : (p.completed_tasks || 0);

  return {
    ...p,
    id: p.id,
    name: p.name,
    description: p.description || '',
    category: p.category || 'Artificial Intelligence',
    priority: p.priority || 'medium',
    status: p.status || 'planning',
    progress: p.progress || 0,
    manager_id: p.manager_id || p.manager || null,
    startDate: sDate,
    start_date: sDate,
    endDate: eDate,
    end_date: eDate,
    githubRepo: repo,
    github_repo: repo,
    createdAt: cAt,
    created_at: cAt,
    updatedAt: uAt,
    updated_at: uAt,
    totalTasks: tTasks,
    total_tasks: tTasks,
    completedTasks: cTasks,
    completed_tasks: cTasks,
    team: Array.isArray(p.team) ? p.team : [],
  };
};

export const api = {
  // Auth API
  auth: {
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    },
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw error || new Error('Not logged in');
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      return { success: true, user: { ...user, profile } };
    },
    register: async (userData) => {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role || 'worker',
          },
        },
      });
      if (error) throw error;
      return { success: true, user: data.user };
    },
  },

  // Projects API
  projects: {
    getAll: async (params = {}) => {
      let query = supabase.from('projects').select('*');
      if (params.status) query = query.eq('status', params.status);
      if (params.category) query = query.eq('category', params.category);
      if (params.search) query = query.ilike('name', `%${params.search}%`);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.warn('[Direct Supabase] Fetch projects error, returning local:', error.message);
        return { success: true, data: [] };
      }
      return { success: true, count: data.length, data: data.map(normalizeProject) };
    },
    getById: async (id) => {
      const { data: project, error: pErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (pErr) throw pErr;
      if (!project) throw new Error('Project not found');

      const { data: tasks } = await supabase.from('tasks').select('*').eq('project_id', id);
      return { success: true, data: normalizeProject({ ...project, tasks: tasks || [] }) };
    },
    create: async (project) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: project.name,
          description: project.description || '',
          category: project.category || 'Artificial Intelligence',
          priority: project.priority || 'medium',
          status: project.status || 'planning',
          start_date: project.startDate || project.start_date || new Date().toISOString().split('T')[0],
          end_date: project.endDate || project.end_date || null,
          github_repo: project.githubRepo || project.github_repo || '',
          team: Array.isArray(project.team) ? project.team : [],
          progress: project.progress || 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: normalizeProject(data) };
    },
    update: async (id, updates) => {
      const payload = { ...updates, updated_at: new Date().toISOString() };
      if (updates.startDate) payload.start_date = updates.startDate;
      if (updates.endDate) payload.end_date = updates.endDate;
      if (updates.githubRepo) payload.github_repo = updates.githubRepo;

      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: normalizeProject(data) };
    },
    delete: async (id) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },

  // Tasks API
  tasks: {
    getAll: async (params = {}) => {
      let query = supabase.from('tasks').select('*');
      if (params.projectId) query = query.eq('project_id', params.projectId);
      if (params.assigneeId) query = query.eq('assignee_id', params.assigneeId);
      if (params.status) query = query.eq('status', params.status);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.warn('[Direct Supabase] Fetch tasks error:', error.message);
        return { success: true, data: [] };
      }
      return { success: true, count: data.length, data };
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data };
    },
    create: async (task) => {
      const { data, error } = await supabase.from('tasks').insert([task]).select().single();
      if (error) throw error;
      return { success: true, data };
    },
    update: async (id, updates) => {
      const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data };
    },
  },

  // Meetings API
  meetings: {
    getAll: async () => {
      const { data, error } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });
      if (error) return { success: true, data: [] };
      return { success: true, data };
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('meetings').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data };
    },
    create: async (meeting) => {
      const { data, error } = await supabase.from('meetings').insert([meeting]).select().single();
      if (error) throw error;
      return { success: true, data };
    },
    update: async (id, updates) => {
      const { data, error } = await supabase.from('meetings').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data };
    },
    delete: async (id) => {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },

  // Documents API
  documents: {
    getAll: async () => {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) return { success: true, data: [] };
      return { success: true, data };
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data };
    },
    create: async (doc) => {
      const { data, error } = await supabase.from('documents').insert([doc]).select().single();
      if (error) throw error;
      return { success: true, data };
    },
    delete: async (id) => {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  },

  // Notifications API
  notifications: {
    getAll: async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) return { success: true, data: [] };
      return { success: true, data };
    },
    markRead: async (id) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    markAllRead: async (userId) => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
      if (error) throw error;
      return { success: true };
    },
    create: async (notif) => {
      const { data, error } = await supabase.from('notifications').insert([notif]).select().single();
      if (error) throw error;
      return { success: true, data };
    },
  },

  // Profiles API
  profiles: {
    getAll: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('name', { ascending: true });
      if (error) return { success: true, data: WORKERS };
      return { success: true, data };
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data };
    },
    update: async (id, updates) => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return { success: true, data };
    },
  },

  // GitHub Integration API
  github: {
    getRepos: async () => {
      const { data, error } = await supabase.from('github_repos').select('*').order('created_at', { ascending: false });
      if (error) return { success: true, count: 0, data: [] };
      return { success: true, count: data.length, data };
    },
    getCommits: async () => {
      const { data, error } = await supabase.from('github_commits').select('*').order('timestamp', { ascending: false });
      if (error) return { success: true, count: 0, data: [] };
      return { success: true, count: data.length, data };
    },
  },

  // Code Execution Engine (Mock / Sandbox)
  executions: {
    run: async (payload) => {
      const exec = {
        task_id: payload.taskId,
        language: payload.language,
        code: payload.code,
        status: 'completed',
        output: 'Executed successfully.',
        execution_time_ms: 120,
        created_at: new Date().toISOString(),
      };
      const { data } = await supabase.from('executions').insert([exec]).select().maybeSingle();
      return { success: true, data: data || exec };
    },
    getAll: async () => {
      const { data, error } = await supabase.from('executions').select('*').order('created_at', { ascending: false });
      if (error) return { success: true, data: [] };
      return { success: true, data };
    },
    getById: async (id) => {
      const { data, error } = await supabase.from('executions').select('*').eq('id', id).single();
      if (error) throw error;
      return { success: true, data };
    },
  },

  // Attendance Management API (Direct Supabase)
  attendance: {
    getSummary: async (date) => {
      const targetDate = date || new Date().toISOString().split('T')[0];

      // Fetch active candidates
      let candidatesCount = 0;
      const { count: cCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'worker');

      candidatesCount = cCount || WORKERS.length;

      // Fetch attendance records for date
      const { data: records, error: rErr } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('attendance_date', targetDate);

      let list = records;
      if (rErr || !records || records.length === 0) {
        list = SEED_ATTENDANCE.filter((a) => a.attendance_date === targetDate);
        if (list.length === 0) list = SEED_ATTENDANCE;
      }

      const present = list.filter((r) => r.status === 'present').length;
      const absent = list.filter((r) => r.status === 'absent').length;
      const percentage = candidatesCount > 0 ? Math.round((present / candidatesCount) * 100) : 0;

      return {
        success: true,
        data: {
          date: targetDate,
          totalCandidates: candidatesCount,
          markedTotal: list.length,
          present,
          absent,
          attendancePercentage: percentage,
          recentActivity: list.slice(0, 10),
        },
      };
    },
    getCandidates: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, erp_id, name, full_name, email, department, designation, avatar, status')
        .eq('role', 'worker')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return { success: true, data: WORKERS.filter((w) => w.status === 'active') };
      }
      return { success: true, data };
    },
    getAll: async (params = {}) => {
      let query = supabase.from('attendance_records').select('*');
      if (params.date) query = query.eq('attendance_date', params.date);
      if (params.month) query = query.like('attendance_date', `${params.month}%`);
      if (params.status) query = query.eq('status', params.status);
      if (params.candidateId) query = query.eq('candidate_id', params.candidateId);

      const { data, error } = await query.order('attendance_date', { ascending: false });
      if (error || !data || data.length === 0) {
        let list = [...SEED_ATTENDANCE];
        if (params.date) list = list.filter((r) => r.attendance_date === params.date);
        if (params.status) list = list.filter((r) => r.status === params.status);
        if (params.candidateId) list = list.filter((r) => r.candidate_id === params.candidateId || r.candidate_erp === params.candidateId);
        return { success: true, count: list.length, data: list };
      }
      return { success: true, count: data.length, data };
    },
    mark: async (record) => {
      const payload = {
        candidate_id: record.candidateId,
        attendance_date: record.attendanceDate || new Date().toISOString().split('T')[0],
        status: record.status || 'present',
        check_in_time: record.checkInTime || null,
        check_out_time: record.checkOutTime || null,
        remarks: record.remarks || '',
      };
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert([payload], { onConflict: 'candidate_id,attendance_date' })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    },
    bulkMark: async ({ attendanceDate, records }) => {
      const payloads = records.map((r) => ({
        candidate_id: r.candidateId,
        attendance_date: attendanceDate,
        status: r.status || 'present',
        check_in_time: r.checkInTime || null,
        check_out_time: r.checkOutTime || null,
        remarks: r.remarks || '',
      }));

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(payloads, { onConflict: 'candidate_id,attendance_date' })
        .select();

      if (error) throw error;
      return { success: true, count: data?.length || 0, data };
    },
    update: async (id, updates) => {
      const payload = {
        ...(updates.status && { status: updates.status }),
        ...(updates.checkInTime !== undefined && { check_in_time: updates.checkInTime }),
        ...(updates.checkOutTime !== undefined && { check_out_time: updates.checkOutTime }),
        ...(updates.remarks !== undefined && { remarks: updates.remarks }),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('attendance_records')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    },
    delete: async (id) => {
      const { error } = await supabase.from('attendance_records').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    getCandidateSummary: async (candidateId) => {
      const { data: records, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('attendance_date', { ascending: false });

      const list = !error && records && records.length > 0
        ? records
        : SEED_ATTENDANCE.filter((r) => r.candidate_id === candidateId || r.candidate_erp === candidateId);

      const present = list.filter((r) => r.status === 'present').length;
      const absent = list.filter((r) => r.status === 'absent').length;
      const total = list.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        success: true,
        data: {
          candidateId,
          totalMarked: total,
          present,
          absent,
          attendancePercentage: percentage,
          history: list,
        },
      };
    },
  },
};

export default api;
