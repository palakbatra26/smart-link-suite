import { ShortUrl, AnalyticsEntry, User } from "@/types";

export const mockUsers: User[] = [
  { id: "u1", email: "john@example.com", name: "John Doe", role: "admin", apiKey: "sk_live_abc123def456", createdAt: "2024-01-15" },
  { id: "u2", email: "jane@example.com", name: "Jane Smith", role: "user", apiKey: "sk_live_xyz789ghi012", createdAt: "2024-02-20" },
  { id: "u3", email: "bob@example.com", name: "Bob Wilson", role: "user", apiKey: "sk_live_mno345pqr678", createdAt: "2024-03-10" },
  { id: "u4", email: "alice@example.com", name: "Alice Chen", role: "user", apiKey: "sk_live_stu901vwx234", createdAt: "2024-04-05" },
];

export const mockUrls: ShortUrl[] = [
  { id: "l1", originalUrl: "https://amazon.com/dp/B09V3KXJPB/ref=cm_sw_r_cp_api_i_dl", shortId: "amzn-deal", userId: "u1", clicks: 1847, isActive: true, createdAt: "2024-06-01", expiryDate: "2025-12-31" },
  { id: "l2", originalUrl: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit", shortId: "q-report", userId: "u1", clicks: 523, isActive: true, createdAt: "2024-07-15" },
  { id: "l3", originalUrl: "https://github.com/facebook/react/issues/12345", shortId: "react-issue", customAlias: "react-bug", userId: "u1", clicks: 312, isActive: true, createdAt: "2024-08-20" },
  { id: "l4", originalUrl: "https://www.figma.com/file/abc123/design-system", shortId: "figma-ds", userId: "u1", clicks: 89, isActive: false, createdAt: "2024-09-01", password: "secret123" },
  { id: "l5", originalUrl: "https://stripe.com/docs/payments/checkout", shortId: "stripe-pay", userId: "u2", clicks: 2341, isActive: true, createdAt: "2024-05-10" },
  { id: "l6", originalUrl: "https://medium.com/some-very-long-article-about-technology", shortId: "tech-read", userId: "u2", clicks: 156, isActive: true, createdAt: "2024-10-01" },
];

const countries = ["United States", "United Kingdom", "Germany", "India", "Brazil", "Canada", "France", "Japan", "Australia", "Nigeria"];
const cities = ["New York", "London", "Berlin", "Mumbai", "São Paulo", "Toronto", "Paris", "Tokyo", "Sydney", "Lagos"];
const devices: Array<"mobile" | "desktop" | "tablet"> = ["desktop", "desktop", "mobile", "mobile", "mobile", "tablet"];
const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Chrome", "Chrome", "Safari"];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

export const mockAnalytics: AnalyticsEntry[] = Array.from({ length: 200 }, (_, i) => {
  const ci = Math.floor(Math.random() * countries.length);
  return {
    id: `a${i}`,
    urlId: mockUrls[Math.floor(Math.random() * mockUrls.length)].id,
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: countries[ci],
    city: cities[ci],
    device: devices[Math.floor(Math.random() * devices.length)],
    browser: browsers[Math.floor(Math.random() * browsers.length)],
    timestamp: randomDate(new Date("2024-06-01"), new Date("2025-04-10")),
  };
});
