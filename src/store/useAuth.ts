import { create } from 'zustand';
import { account } from '@/lib/appwrite';
import { ID, OAuthProvider } from 'appwrite';

export interface User {
  $id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  hydrate: async () => {
    try {
      const user = await account.get();
      set({ user: { $id: user.$id, email: user.email, name: user.name }, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    set({ error: null, loading: true });
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      set({ user: { $id: user.$id, email: user.email, name: user.name }, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Login failed', loading: false });
      throw e;
    }
  },

  register: async (email, password, name) => {
    set({ error: null, loading: true });
    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      set({ user: { $id: user.$id, email: user.email, name: user.name }, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Registration failed', loading: false });
      throw e;
    }
  },

  loginWithGoogle: () => {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/`,
      `${window.location.origin}/login`,
    );
  },

  loginWithGithub: () => {
    account.createOAuth2Session(
      OAuthProvider.Github,
      `${window.location.origin}/`,
      `${window.location.origin}/login`,
    );
  },

  logout: async () => {
    await account.deleteSession('current');
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
