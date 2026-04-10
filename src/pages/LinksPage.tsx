import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Copy, ExternalLink, Trash2, Edit, BarChart3, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export default function LinksPage() {
  const { urls, user, createUrl, deleteUrl, toggleUrl, updateUrl } = useApp();
  const userUrls = urls.filter(u => u.userId === user?.id);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editOriginal, setEditOriginal] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const filtered = userUrls.filter(u =>
    u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    u.shortId.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newUrl) { toast.error("URL is required"); return; }
    try { new URL(newUrl); } catch { toast.error("Invalid URL"); return; }
    createUrl(newUrl, newAlias || undefined, newExpiry || undefined, newPassword || undefined);
    toast.success("Link created!");
    setShowCreate(false);
    setNewUrl(""); setNewAlias(""); setNewExpiry(""); setNewPassword("");
  };

  const handleEdit = () => {
    if (!editId || !editOriginal) return;
    try { new URL(editOriginal); } catch { toast.error("Invalid URL"); return; }
    updateUrl(editId, { originalUrl: editOriginal });
    toast.success("Link updated!");
    setEditId(null);
  };

  const shortBase = "short.ly/";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Links</h1>
          <p className="text-muted-foreground mt-1">{userUrls.length} total links</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Link</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Short Link</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Destination URL *</Label>
                <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com/very-long-url" />
              </div>
              <div className="space-y-2">
                <Label>Custom Alias (optional)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{shortBase}</span>
                  <Input value={newAlias} onChange={e => setNewAlias(e.target.value)} placeholder="my-custom-link" />
                </div>
                <p className="text-xs text-muted-foreground">Leave empty for AI-generated smart alias</p>
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (optional)</Label>
                <Input type="date" value={newExpiry} onChange={e => setNewExpiry(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password Protection (optional)</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave empty for no password" />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Short Link</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search links..." className="max-w-sm" />

      <div className="space-y-3">
        {filtered.map(url => (
          <Card key={url.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={`https://${shortBase}${url.shortId}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
                      {shortBase}{url.shortId}
                    </a>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(`https://${shortBase}${url.shortId}`); toast.success("Copied!"); }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    {!url.isActive && <Badge variant="secondary">Disabled</Badge>}
                    {url.password && <Badge variant="outline">🔒</Badge>}
                    {url.expiryDate && <Badge variant="outline" className="text-xs">Expires {url.expiryDate}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{url.originalUrl}</p>
                  <p className="text-xs text-muted-foreground mt-1">{url.clicks.toLocaleString()} clicks • Created {new Date(url.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={url.isActive} onCheckedChange={() => toggleUrl(url.id)} />
                  <Button size="sm" variant="ghost" onClick={() => setQrUrl(url.shortId)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Link to={`/dashboard/analytics?url=${url.id}`}>
                    <Button size="sm" variant="ghost"><BarChart3 className="h-4 w-4" /></Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => { setEditId(url.id); setEditOriginal(url.originalUrl); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { deleteUrl(url.id); toast.success("Deleted"); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No links found. Create your first short link!</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Link</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Destination URL</Label>
              <Input value={editOriginal} onChange={e => setEditOriginal(e.target.value)} />
            </div>
            <Button onClick={handleEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={!!qrUrl} onOpenChange={() => setQrUrl(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>QR Code</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="p-4 bg-background rounded-xl border" id="qr-container">
              <QRCodeSVG value={`https://${shortBase}${qrUrl}`} size={200} />
            </div>
            <p className="text-sm text-muted-foreground">{shortBase}{qrUrl}</p>
            <Button onClick={() => {
              const svg = document.querySelector("#qr-container svg");
              if (!svg) return;
              const svgData = new XMLSerializer().serializeToString(svg);
              const canvas = document.createElement("canvas");
              canvas.width = 400; canvas.height = 400;
              const ctx = canvas.getContext("2d");
              const img = new Image();
              img.onload = () => { ctx?.drawImage(img, 0, 0, 400, 400); const a = document.createElement("a"); a.download = `qr-${qrUrl}.png`; a.href = canvas.toDataURL("image/png"); a.click(); };
              img.src = "data:image/svg+xml;base64," + btoa(svgData);
            }}>
              Download PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
