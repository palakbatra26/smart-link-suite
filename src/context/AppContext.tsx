import React, { createContext, useContext, useState, useCallback } from "react";
import { User, ShortUrl, AnalyticsEntry } from "@/types";
import { mockUsers, mockUrls, mockAnalytics } from "@/data/mockData";

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  urls: ShortUrl[];
  analytics: AnalyticsEntry[];
  allUsers: User[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  createUrl: (originalUrl: string, customAlias?: string, expiryDate?: string, password?: string) => ShortUrl;
  updateUrl: (id: string, updates: Partial<ShortUrl>) => void;
  deleteUrl: (id: string) => void;
  toggleUrl: (id: string) => void;
  getUrlAnalytics: (urlId: string) => AnalyticsEntry[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateShortId(url: string): string {
  // AI-like smart alias generation
  try {
    const u = new URL(url);
    const domain = u.hostname.replace("www.", "").split(".")[0];
    const pathParts = u.pathname.split("/").filter(Boolean);
    const meaningful = pathParts.find(p => p.length > 2 && !/^\d+$/.test(p) && p !== "dp" && p !== "ref");
    if (meaningful) {
      const clean = meaningful.replace(/[^a-zA-Z]/g, "").slice(0, 8);
      return `${domain.slice(0, 5)}-${clean}`.toLowerCase();
    }
    return `${domain.slice(0, 6)}-${Math.random().toString(36).slice(2, 6)}`;
  } catch {
    return Math.random().toString(36).slice(2, 8);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [urls, setUrls] = useState<ShortUrl[]>(mockUrls);
  const [analytics] = useState<AnalyticsEntry[]>(mockAnalytics);

  const login = useCallback((email: string, _password: string) => {
    const found = mockUsers.find(u => u.email === email);
    if (found) { setUser(found); return true; }
    // Demo: any email works
    const newUser: User = { id: `u${Date.now()}`, email, name: email.split("@")[0], role: "user", apiKey: `sk_live_${Math.random().toString(36).slice(2, 14)}`, createdAt: new Date().toISOString() };
    setUser(newUser);
    return true;
  }, []);

  const signup = useCallback((name: string, email: string, _password: string) => {
    const newUser: User = { id: `u${Date.now()}`, email, name, role: "user", apiKey: `sk_live_${Math.random().toString(36).slice(2, 14)}`, createdAt: new Date().toISOString() };
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const createUrl = useCallback((originalUrl: string, customAlias?: string, expiryDate?: string, password?: string) => {
    const newUrl: ShortUrl = {
      id: `l${Date.now()}`,
      originalUrl,
      shortId: customAlias || generateShortId(originalUrl),
      customAlias,
      userId: user?.id || "u1",
      clicks: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiryDate,
      password,
    };
    setUrls(prev => [newUrl, ...prev]);
    return newUrl;
  }, [user]);

  const updateUrl = useCallback((id: string, updates: Partial<ShortUrl>) => {
    setUrls(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUrl = useCallback((id: string) => {
    setUrls(prev => prev.filter(u => u.id !== id));
  }, []);

  const toggleUrl = useCallback((id: string) => {
    setUrls(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  }, []);

  const getUrlAnalytics = useCallback((urlId: string) => {
    return analytics.filter(a => a.urlId === urlId);
  }, [analytics]);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, urls, analytics, allUsers: mockUsers,
      login, signup, logout, createUrl, updateUrl, deleteUrl, toggleUrl, getUrlAnalytics,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
