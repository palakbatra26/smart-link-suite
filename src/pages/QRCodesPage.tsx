import { useApp } from "@/context/AppContext";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function QRCodesPage() {
  const { urls, user } = useApp();
  const userUrls = urls.filter(u => u.userId === user?.id && u.isActive);

  const downloadQR = (shortId: string) => {
    const svg = document.querySelector(`#qr-${shortId} svg`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => { ctx?.drawImage(img, 0, 0, 400, 400); const a = document.createElement("a"); a.download = `qr-${shortId}.png`; a.href = canvas.toDataURL("image/png"); a.click(); };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR Codes</h1>
        <p className="text-muted-foreground mt-1">Download QR codes for your active links</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {userUrls.map(url => (
          <Card key={url.id}>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div id={`qr-${url.shortId}`} className="p-3 bg-background rounded-lg border">
                <QRCodeSVG value={`https://short.ly/${url.shortId}`} size={140} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-primary">short.ly/{url.shortId}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{url.originalUrl}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadQR(url.shortId)}>
                <Download className="mr-2 h-3.5 w-3.5" /> Download PNG
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {userUrls.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No active links to generate QR codes for.</div>
      )}
    </div>
  );
}
