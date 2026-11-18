'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  checkServerHealth,
  fetchAllPortfolioData,
  getStoredToken,
  login as apiLogin,
  logout as apiLogout,
  verifyAuth,
} from '@/lib/adminApi';
import type {
  ConnectionMode,
  PortfolioData,
  ToastMessage,
} from '@/types/admin';

export type AdminSection =
  | 'profile'
  | 'about'
  | 'resume'
  | 'projects'
  | 'writing'
  | 'speaking'
  | 'contact';

interface AdminContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  serverOnline: boolean;
  activeSection: AdminSection;
  setActiveSection: (section: AdminSection) => void;
  data: PortfolioData | null;
  setData: React.Dispatch<React.SetStateAction<PortfolioData | null>>;
  refreshData: () => Promise<void>;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  removeToast: (id: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Modals
  isRebuildOpen: boolean;
  openRebuildModal: () => void;
  closeRebuildModal: () => void;
  isCommitOpen: boolean;
  openCommitModal: () => void;
  closeCommitModal: () => void;
  inspectorPayload: { title: string; content: string } | null;
  openInspector: (title: string, content: string) => void;
  closeInspector: () => void;
  connectionMode: ConnectionMode;
  setConnectionMode: (mode: ConnectionMode) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [serverOnline, setServerOnline] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('profile');
  const [data, setData] = useState<PortfolioData | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isRebuildOpen, setIsRebuildOpen] = useState<boolean>(false);
  const [isCommitOpen, setIsCommitOpen] = useState<boolean>(false);
  const [inspectorPayload, setInspectorPayload] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('local');

  const addToast = useCallback(
    (type: 'success' | 'error' | 'info', text: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, text }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const isOnline = await checkServerHealth();
      setServerOnline(isOnline);

      if (!isOnline) {
        addToast(
          'error',
          'Local Companion Server is offline. Run "npm run admin" in your terminal.',
        );
        setIsLoading(false);
        return;
      }

      const res = await fetchAllPortfolioData();
      if (res.ok && res.data) {
        setData(res.data);
      } else if (res.error) {
        addToast('error', res.error);
      }
    } catch (err) {
      addToast('error', `Failed to load data: ${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const initAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const isOnline = await checkServerHealth();
      setServerOnline(isOnline);

      const hasToken = getStoredToken();
      if (hasToken) {
        const valid = await verifyAuth();
        if (valid) {
          setIsAuthenticated(true);
          await refreshData();
          return;
        }
      }
      setIsAuthenticated(false);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (password: string) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(password);
      if (res.ok) {
        setIsAuthenticated(true);
        addToast('success', 'Logged in successfully.');
        await refreshData();
        return { ok: true };
      }
      addToast('error', res.error || 'Invalid credentials.');
      return { ok: false, error: res.error || 'Invalid credentials.' };
    } catch (err) {
      const msg = `Login error: ${String(err)}`;
      addToast('error', msg);
      return { ok: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setData(null);
    addToast('info', 'Logged out.');
  };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const openRebuildModal = () => setIsRebuildOpen(true);
  const closeRebuildModal = () => setIsRebuildOpen(false);
  const openCommitModal = () => setIsCommitOpen(true);
  const closeCommitModal = () => setIsCommitOpen(false);
  const openInspector = (title: string, content: string) =>
    setInspectorPayload({ title, content });
  const closeInspector = () => setInspectorPayload(null);

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        serverOnline,
        activeSection,
        setActiveSection,
        data,
        setData,
        refreshData,
        login,
        logout,
        toasts,
        addToast,
        removeToast,
        isSidebarCollapsed,
        toggleSidebar,
        isRebuildOpen,
        openRebuildModal,
        closeRebuildModal,
        isCommitOpen,
        openCommitModal,
        closeCommitModal,
        inspectorPayload,
        openInspector,
        closeInspector,
        connectionMode,
        setConnectionMode,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
