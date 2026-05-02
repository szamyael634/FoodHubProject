/**
 * Hub E-Commerce - Supabase Client Module
 * Centralized Supabase client initialization and API helpers
 */

(function() {
    'use strict';

    // Supabase configuration from environment
    const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'https://gladttjcpcgpvxdrhqmx.supabase.co';
    const SUPABASE_KEY = window.ENV?.SUPABASE_PUBLISHABLE_KEY || window.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYWR0dGpjcGNncHZ4ZHJocW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODkyMTIsImV4cCI6MjA5MzI2NTIxMn0.HON5KpR2tuXISMZl4hgx48A0qYaxeUlBMHg7fO0rNJI';
    const SUPABASE_SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

    let supabaseClient = null;
    let supabaseClientPromise = null;

    /**
     * Load Supabase SDK from CDN
     */
    function loadSupabaseSdk() {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            return Promise.resolve(window.supabase);
        }

        return new Promise((resolve, reject) => {
            const existingScript = document.querySelector('script[data-hub-supabase-sdk="true"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(window.supabase));
                existingScript.addEventListener('error', () => reject(new Error('Failed to load Supabase SDK')));
                return;
            }

            const script = document.createElement('script');
            script.src = SUPABASE_SDK_URL;
            script.async = true;
            script.dataset.hubSupabaseSdk = 'true';
            script.onload = () => resolve(window.supabase);
            script.onerror = () => reject(new Error('Failed to load Supabase SDK'));
            document.head.appendChild(script);
        });
    }

    /**
     * Get or initialize Supabase client
     */
    async function getSupabaseClient() {
        if (!SUPABASE_URL || !SUPABASE_KEY) {
            console.error('Supabase credentials not configured');
            return null;
        }

        if (supabaseClient) return supabaseClient;

        if (!supabaseClientPromise) {
            supabaseClientPromise = loadSupabaseSdk().then((supabase) => {
                if (!supabase || typeof supabase.createClient !== 'function') {
                    throw new Error('Supabase SDK not available');
                }

                supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true,
                        storageKey: 'hub_supabase_auth',
                    },
                    realtime: {
                        timeout: 20000,
                    }
                });

                window.hubSupabase = supabaseClient;
                return supabaseClient;
            }).catch((error) => {
                console.error('Failed to initialize Supabase client:', error);
                supabaseClientPromise = null;
                return null;
            });
        }

        return supabaseClientPromise;
    }

    /**
     * Get current user from Supabase auth
     */
    async function getCurrentUser() {
        const supabase = await getSupabaseClient();
        if (!supabase) return null;

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.warn('Error getting current user:', error.message);
            return null;
        }
        return user;
    }

    /**
     * Get user profile with role
     */
    async function getUserProfile(userId) {
        const supabase = await getSupabaseClient();
        if (!supabase || !userId) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.warn('Error fetching user profile:', error.message);
            return null;
        }
        return data;
    }

    /**
     * Sign in with email/password
     */
    async function signIn(email, password) {
        const supabase = await getSupabaseClient();
        if (!supabase) return { error: { message: 'Supabase not initialized' } };

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) return { error };

        // Store tokens for legacy compatibility
        if (data.session) {
            localStorage.setItem('hub_access_token', data.session.access_token);
            localStorage.setItem('hub_refresh_token', data.session.refresh_token);
            localStorage.setItem('hub_user_id', data.user.id);
            
            // Fetch and store user role
            const profile = await getUserProfile(data.user.id);
            if (profile) {
                localStorage.setItem('hub_user_role', profile.role);
                localStorage.setItem('hub_user_email', profile.email);
            }
        }

        return { data, error: null };
    }

    /**
     * Sign up with email/password
     */
    async function signUp(email, password, userData = {}) {
        const supabase = await getSupabaseClient();
        if (!supabase) return { error: { message: 'Supabase not initialized' } };

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    role: userData.role || 'customer'
                }
            }
        });

        return { data, error };
    }

    /**
     * Sign out
     */
    async function signOut() {
        const supabase = await getSupabaseClient();
        if (!supabase) return { error: { message: 'Supabase not initialized' } };

        const { error } = await supabase.auth.signOut();
        
        // Clear local storage
        localStorage.removeItem('hub_access_token');
        localStorage.removeItem('hub_refresh_token');
        localStorage.removeItem('hub_user_id');
        localStorage.removeItem('hub_user_role');
        localStorage.removeItem('hub_user_email');
        localStorage.removeItem('hub_supabase_auth');

        return { error };
    }

    /**
     * Subscribe to realtime changes
     */
    async function subscribeToTable(table, callback, filter = {}) {
        const supabase = await getSupabaseClient();
        if (!supabase) return null;

        const channel = supabase
            .channel(`${table}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    ...filter
                },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();

        return channel;
    }

    /**
     * Upload file to Supabase Storage
     */
    async function uploadFile(bucket, path, file) {
        const supabase = await getSupabaseClient();
        if (!supabase) return { error: { message: 'Supabase not initialized' } };

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) return { error };

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return { data: { ...data, publicUrl }, error: null };
    }

    /**
     * API helper for Edge Functions
     */
    async function callEdgeFunction(functionName, options = {}) {
        const supabase = await getSupabaseClient();
        if (!supabase) return { error: { message: 'Supabase not initialized' } };

        const { data, error } = await supabase.functions.invoke(functionName, options);
        return { data, error };
    }

    // Expose to global scope
    window.HubSupabase = {
        getClient: getSupabaseClient,
        getCurrentUser,
        getUserProfile,
        signIn,
        signUp,
        signOut,
        subscribeToTable,
        uploadFile,
        callEdgeFunction,
        // Direct access to supabase client
        get supabase() {
            return supabaseClient;
        }
    };

    // Legacy compatibility
    window.getSupabaseClient = getSupabaseClient;

    console.log('✅ Supabase client module loaded');
})();
