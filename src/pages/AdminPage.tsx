import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, Link2, MousePointerClick, Trash2, Shield } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function AdminPage() {
  const { user, allUsers, urls, analytics, deleteUrl } = useApp();

  if (user?.role !== "admin") return <Navigate to="/dashboard" replace />;

  const totalClicks = urls.reduce((s, u) => s + u.clicks, 0);
  const activeLinks = urls.filter(u => u.isActive).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">Platform-wide management and statistics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: allUsers.length, icon: Users },
          { label: "Total Links", value: urls.length, icon: Link2 },
          { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick },
          { label: "Active Links", value: activeLinks, icon: Link2 },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="urls">All URLs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-4 font-medium text-foreground">{u.name}</td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4"><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></td>
                        <td className="p-4 text-muted-foreground">{u.createdAt}</td>
                        <td className="p-4 text-muted-foreground">{urls.filter(l => l.userId === u.id).length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium text-muted-foreground">Short ID</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Original URL</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Clicks</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls.map(url => (
                      <tr key={url.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-4 font-mono text-sm text-primary">{url.shortId}</td>
                        <td className="p-4 text-muted-foreground max-w-xs truncate">{url.originalUrl}</td>
                        <td className="p-4 text-foreground">{url.clicks}</td>
                        <td className="p-4"><Badge variant={url.isActive ? "default" : "secondary"}>{url.isActive ? "Active" : "Disabled"}</Badge></td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { deleteUrl(url.id); toast.success("URL deleted"); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
