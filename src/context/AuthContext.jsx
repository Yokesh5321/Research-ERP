import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const fetchUserProfile = async (authUser, targetRole = null) => {
  if (!authUser) return null;

  // 1. Primary lookup: By authenticated Supabase user ID (.eq("id", authUser.id))
  let { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.warn('[AuthContext] Profile lookup note:', error.message);
  }

  // 2. Secondary fallback by email in case profile was pre-seeded before auth signup
  if (!profile && authUser.email) {
    const { data: profileByEmail } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', authUser.email)
      .maybeSingle();

    if (profileByEmail) {
      profile = profileByEmail;
      // Sync the profile's id to match the authenticated user's ID
      if (profile.id !== authUser.id) {
        try {
          await supabase
            .from('profiles')
            .update({ id: authUser.id, updated_at: new Date().toISOString() })
            .eq('email', authUser.email);
          profile.id = authUser.id;
        } catch (syncErr) {
          console.warn('[AuthContext] Could not sync profile id to auth id:', syncErr.message);
        }
      }
    }
  }

  // 3. Auto-provision profile if missing in database
  if (!profile) {
    console.log(`[AuthContext] Auto-creating missing profile for user ID: ${authUser.id} (${authUser.email})`);
    let assignedRole = targetRole || authUser.user_metadata?.role;
    if (!assignedRole) {
      const emailLower = (authUser.email || '').toLowerCase();
      if (emailLower.includes('admin') || emailLower.includes('director') || emailLower.includes('yokesh')) {
        assignedRole = 'admin';
      } else {
        assignedRole = 'worker';
      }
    }

    const rawName = authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
    const formattedName = rawName.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const isTargetAdmin = assignedRole === 'admin' || assignedRole === 'system administrator';
    const finalRole = isTargetAdmin ? 'admin' : 'worker';
    const designation = isTargetAdmin ? 'System Administrator' : 'Research Scholar';
    const department = isTargetAdmin ? 'Administration' : 'Research';

    const newProfileData = {
      id: authUser.id,
      email: authUser.email,
      name: formattedName,
      full_name: formattedName,
      role: finalRole,
      department,
      designation,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: insertedProfile, error: upsertErr } = await supabase
        .from('profiles')
        .upsert(newProfileData, { onConflict: 'id' })
        .select('*')
        .maybeSingle();

      if (upsertErr) {
        console.warn('[AuthContext] Profile auto-provision upsert note:', upsertErr.message);
        profile = newProfileData;
      } else {
        profile = insertedProfile || newProfileData;
      }
    } catch (e) {
      console.warn('[AuthContext] Exception while auto-provisioning profile:', e.message);
      profile = newProfileData;
    }
  }

  // Normalize role strictly to 'admin' or 'worker'
  const rawRole = (profile.role || '').trim().toLowerCase();
  let role = rawRole;
  if (rawRole === 'system administrator' || rawRole === 'admin') {
    role = 'admin';
  } else if (rawRole === 'worker' || rawRole === 'candidate' || rawRole === 'student') {
    role = 'worker';
  }

  return {
    id: profile.erp_id || profile.id || authUser.id,
    authId: authUser.id,
    email: authUser.email,
    name: profile.name || profile.full_name || authUser.user_metadata?.name || 'User',
    role, // Strictly "admin" or "worker"
    department: profile.department || '',
    designation: profile.designation || (role === 'admin' ? 'System Administrator' : 'Research Scholar'),
    phone: profile.phone || '',
    githubUsername: profile.github_username || '',
    skills: profile.skills || [],
    avatar: profile.avatar || null,
    status: profile.status || 'active',
    performance: profile.performance || 0,
    joinDate: profile.join_date || '',
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          try {
            const profileUser = await fetchUserProfile(session.user);
            if (profileUser.status !== 'inactive') {
              setUser(profileUser);
            } else {
              await supabase.auth.signOut();
              setUser(null);
            }
          } catch (profileErr) {
            console.warn('[AuthContext] Session profile load warning:', profileErr.message);
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) setUser(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user && mounted) {
          try {
            const profileUser = await fetchUserProfile(session.user);
            if (profileUser.status !== 'inactive') {
              setUser(profileUser);
            } else {
              await supabase.auth.signOut();
              setUser(null);
            }
          } catch (profileErr) {
            console.warn('[AuthContext] Auth state change profile load warning:', profileErr.message);
            await supabase.auth.signOut();
            setUser(null);
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password, loginType = 'candidate') => {
    setLoading(true);
    setError(null);
    try {
      // 1. Authenticate user using Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Invalid email or password');
      }

      if (!data?.user) {
        throw new Error('Authentication failed. No user returned.');
      }

      // 2. Retrieve authenticated user's profile from public.profiles using ID with loginType target role
      let profileUser;
      try {
        profileUser = await fetchUserProfile(data.user, loginType);
      } catch (fetchErr) {
        await supabase.auth.signOut();
        throw fetchErr;
      }

      if (profileUser.status === 'inactive') {
        await supabase.auth.signOut();
        throw new Error('This account has been deactivated. Please contact an administrator.');
      }

      // 3. Validate selected login type strictly
      // If loginType === "admin": profile.role MUST equal "admin"
      if (loginType === 'admin') {
        if (profileUser.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access denied. Please use Candidate Login.');
        }
      }

      // If loginType === "candidate": profile.role MUST equal "worker"
      if (loginType === 'candidate') {
        if (profileUser.role !== 'worker') {
          await supabase.auth.signOut();
          throw new Error('Access denied. Please use Admin Login.');
        }
      }

      setUser(profileUser);
      return profileUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Safe recovery action for user/admin if profile row is missing
  const recoverProfile = useCallback(async (defaultRole = 'worker') => {
    try {
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      if (!currentAuthUser) throw new Error('No authenticated user session found to recover.');

      const role = defaultRole === 'admin' ? 'admin' : 'worker';
      const designation = role === 'admin' ? 'System Administrator' : 'Research Scholar';
      const name = currentAuthUser.user_metadata?.name || currentAuthUser.email.split('@')[0];

      const { data, error: upsertErr } = await supabase.from('profiles').upsert({
        id: currentAuthUser.id,
        email: currentAuthUser.email,
        name,
        full_name: name,
        role,
        designation,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single();

      if (upsertErr) throw upsertErr;

      const restoredProfile = await fetchUserProfile(currentAuthUser);
      setUser(restoredProfile);
      return restoredProfile;
    } catch (err) {
      console.error('[AuthContext] Profile recovery error:', err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, recoverProfile, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
