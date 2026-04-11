import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { User, ShortUrl, AnalyticsEntry } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  urls: ShortUrl[];
  analytics: AnalyticsEntry[];
  allUsers: User[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUrl: (originalUrl: string, customAlias?: string, expiryDate?: string, password?: string) => Promise<ShortUrl>;
  updateUrl: (id: string, updates: Partial<ShortUrl>) => Promise<void>;
  deleteUrl: (id: string) => Promise<void>;
  toggleUrl: (id: string) => Promise<void>;
  getUrlAnalytics: (urlId: string) => AnalyticsEntry[];
  adminStats: { totalUsers: number; totalUrls: number; totalClicks: number; activeLinks: number } | null;
  fetchAdminData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateShortId(url: string): string {
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
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string>(() => localStorage.getItem("token") || "");
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<{ totalUsers: number; totalUrls: number; totalClicks: number; activeLinks: number } | null>(null);

  const fetchUrls = useCallback(async () => {
    if (!token || !user) return;
    try {
      const [urlsRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/urls`, {
          headers: { "x-user-id": user.id, Authorization: token }
        }),
        fetch(`${API_URL}/analytics`, {
          headers: { "x-user-id": user.id, Authorization: token }
        })
      ]);
      if (urlsRes.ok) {
        const data = await urlsRes.json();
        setUrls(data);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) fetchUrls();
  }, [user, token, fetchUrls]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return true;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      return true;
    } catch (err: any) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken("");
    setUrls([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const createUrl = useCallback(async (originalUrl: string, customAlias?: string, expiryDate?: string, password?: string) => {
    if (!token || !user) throw new Error("Not authenticated");
    
    const shortId = customAlias || generateShortId(originalUrl);
    const res = await fetch(`${API_URL}/urls`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": user.id, Authorization: token },
      body: JSON.stringify({ originalUrl, shortId, customAlias, expiryDate, password })
    });
    if (!res.ok) throw new Error("Failed to create URL");
    const newUrl = await res.json();
    setUrls(prev => [newUrl, ...prev]);
    return newUrl;
  }, [token, user]);

  const updateUrl = useCallback(async (id: string, updates: Partial<ShortUrl>) => {
    if (!token || !user) return;
    const res = await fetch(`${API_URL}/urls/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": user.id, Authorization: token },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const updated = await res.json();
      setUrls(prev => prev.map(u => u.id === id ? updated : u));
    }
  }, [token, user]);

  const deleteUrl = useCallback(async (id: string) => {
    if (!token || !user) return;
    const res = await fetch(`${API_URL}/urls/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": user.id, Authorization: token }
    });
    if (res.ok) setUrls(prev => prev.filter(u => u.id !== id));
  }, [token, user]);

  const toggleUrl = useCallback(async (id: string) => {
    if (!token || !user) return;
    const res = await fetch(`${API_URL}/urls/${id}/toggle`, {
      method: "PUT",
      headers: { "x-user-id": user.id, Authorization: token }
    });
    if (res.ok) {
      const updated = await res.json();
      setUrls(prev => prev.map(u => u.id === id ? updated : u));
    }
  }, [token, user]);

  const getUrlAnalytics = useCallback((_urlId: string) => {
    return [];
  }, []);

  const fetchAdminData = useCallback(async () => {
    if (!token || !user || user.role !== "admin") return;
    try {
      const [usersRes, urlsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers: { "x-user-id": user.id, Authorization: token } }),
        fetch(`${API_URL}/admin/urls`, { headers: { "x-user-id": user.id, Authorization: token } }),
        fetch(`${API_URL}/admin/stats`, { headers: { "x-user-id": user.id, Authorization: token } })
      ]);
      if (usersRes.ok) setAllUsers(await usersRes.json());
      if (urlsRes.ok) setUrls(await urlsRes.json());
      if (statsRes.ok) setAdminStats(await statsRes.json());
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  }, [token, user]);

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!user, urls, analytics, allUsers,
      login, signup, logout, createUrl, updateUrl, deleteUrl, toggleUrl, getUrlAnalytics,
      adminStats, fetchAdminData
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