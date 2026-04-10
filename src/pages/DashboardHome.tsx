import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, MousePointerClick, TrendingUp, Globe } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

export default function DashboardHome() {
  const { urls, analytics, user } = useApp();
  const userUrls = urls.filter(u => u.userId === user?.id);
  const totalClicks = userUrls.reduce((s, u) => s + u.clicks, 0);
  const activeLinks = userUrls.filter(u => u.isActive).length;

  const clicksOverTime = useMemo(() => {
    const months: Record<string, number> = {};
    analytics.forEach(a => {
      const urlBelongs = userUrls.some(u => u.id === a.urlId);
      if (!urlBelongs) return;
      const month = a.timestamp.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, clicks]) => ({ month: month.slice(5), clicks }));
  }, [analytics, userUrls]);

  const topCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    analytics.forEach(a => {
      if (!userUrls.some(u => u.id === a.urlId)) return;
      counts[a.country] = (counts[a.country] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, clicks]) => ({ country, clicks }));
  }, [analytics, userUrls]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-1">Here's your link performance overview.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Links", value: userUrls.length, icon: Link2, color: "text-primary" },
          { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-chart-2" },
          { label: "Active Links", value: activeLinks, icon: TrendingUp, color: "text-chart-3" },
          { label: "Countries", value: topCountries.length, icon: Globe, color: "text-chart-4" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={clicksOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCountries.map((c, i) => (
                <div key={c.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm text-foreground">{c.country}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{c.clicks}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
