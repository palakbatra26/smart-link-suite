import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const COLORS = ["hsl(155,52%,42%)", "hsl(200,65%,50%)", "hsl(35,90%,55%)", "hsl(280,60%,55%)", "hsl(0,72%,51%)"];

export default function AnalyticsPage() {
  const { urls, analytics, user } = useApp();
  const [searchParams] = useSearchParams();
  const userUrls = urls.filter(u => u.userId === user?.id);
  const [selectedUrl, setSelectedUrl] = useState(searchParams.get("url") || "all");

  const filtered = useMemo(() => {
    if (selectedUrl === "all") return analytics.filter(a => userUrls.some(u => u.id === a.urlId));
    return analytics.filter(a => a.urlId === selectedUrl);
  }, [selectedUrl, analytics, userUrls]);

  const clicksOverTime = useMemo(() => {
    const days: Record<string, number> = {};
    filtered.forEach(a => {
      const day = a.timestamp.slice(0, 10);
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([date, clicks]) => ({ date: date.slice(5), clicks }));
  }, [filtered]);

  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(a => { counts[a.device] = (counts[a.device] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [filtered]);

  const browserData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(a => { counts[a.browser] = (counts[a.browser] || 0) + 1; });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, clicks]) => ({ name, clicks }));
  }, [filtered]);

  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(a => { counts[a.country] = (counts[a.country] || 0) + 1; });
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([country, clicks]) => ({ country, clicks }));
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} total events tracked</p>
        </div>
        <Select value={selectedUrl} onValueChange={setSelectedUrl}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select link" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Links</SelectItem>
            {userUrls.map(u => (
              <SelectItem key={u.id} value={u.id}>short.ly/{u.shortId}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Clicks</p><p className="text-3xl font-bold text-foreground mt-1">{filtered.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Unique Countries</p><p className="text-3xl font-bold text-foreground mt-1">{new Set(filtered.map(f => f.country)).size}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Mobile Share</p><p className="text-3xl font-bold text-foreground mt-1">{filtered.length ? Math.round(filtered.filter(f => f.device === "mobile").length / filtered.length * 100) : 0}%</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Clicks Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clicksOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Device Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Browsers</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} width={60} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="clicks" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Countries</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {countryData.map((c, i) => (
                <div key={c.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                    <span className="text-sm text-foreground">{c.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(c.clicks / countryData[0].clicks) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-6 text-right">{c.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
