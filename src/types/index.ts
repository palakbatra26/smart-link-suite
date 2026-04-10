export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  apiKey: string;
  createdAt: string;
}

export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortId: string;
  customAlias?: string;
  userId: string;
  clicks: number;
  expiryDate?: string;
  isActive: boolean;
  password?: string;
  createdAt: string;
}

export interface AnalyticsEntry {
  id: string;
  urlId: string;
  ip: string;
  country: string;
  city: string;
  device: "mobile" | "desktop" | "tablet";
  browser: string;
  timestamp: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
}
