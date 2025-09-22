import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, auth } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      loading: true,

      // Initialize auth state
      initialize: async () => {
        try {
          const { session, error } = await auth.getSession()

          if (error) throw error

          if (session) {
            set({ session, user: session.user })
            await get().fetchProfile(session.user.id)
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
        } finally {
          set({ loading: false })
        }
      },

      // Fetch user profile from database
      fetchProfile: async (userId) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) throw error
          set({ profile: data })
        } catch (error) {
          console.error('Profile fetch error:', error)
        }
      },

      // Sign in
      signIn: async (email, password) => {
        const { data, error } = await auth.signIn(email, password)

        if (error) return { error }

        set({ user: data.user, session: data.session })
        await get().fetchProfile(data.user.id)

        return { data }
      },

      // Sign up
      signUp: async (email, password, userData) => {
        const { data, error } = await auth.signUp(email, password, userData)
        return { data, error }
      },

      // Sign out
      signOut: async () => {
        const { error } = await auth.signOut()
        if (!error) {
          set({ user: null, profile: null, session: null })
        }
        return { error }
      },

      // Update profile
      updateProfile: async (updates) => {
        const userId = get().user?.id
        if (!userId) return { error: new Error('No user logged in') }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

          if (error) throw error
          set({ profile: data })
          return { data }
        } catch (error) {
          return { error }
        }
      },

      // Check if user has role
      hasRole: (role) => {
        return get().profile?.role === role
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        return !!get().user
      }
    }),
    {
      name: 'collab-auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
)
