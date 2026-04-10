import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Key } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ApiPage() {
  const { user } = useApp();
  const [showKey, setShowKey] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Access</h1>
        <p className="text-muted-foreground mt-1">Use the ShortlyAI API to programmatically create and manage links.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> Your API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={showKey ? user.apiKey : "sk_live_" + "•".repeat(20)}
              readOnly
              className="font-mono text-sm"
            />
            <Button size="sm" variant="outline" onClick={() => setShowKey(!showKey)}>
              {showKey ? "Hide" : "Show"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(user.apiKey); toast.success("API key copied!"); }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Keep your API key secure. Do not share it publicly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">API Documentation</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Create Short URL</h3>
            <div className="bg-sidebar rounded-lg p-4 font-mono text-xs text-sidebar-foreground overflow-x-auto">
              <pre>{`POST /api/v1/create-short-url
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "url": "https://example.com/long-url",
  "alias": "custom-alias",     // optional
  "expiryDate": "2025-12-31",  // optional
  "password": "secret"          // optional
}

Response:
{
  "success": true,
  "data": {
    "shortUrl": "https://short.ly/custom-alias",
    "shortId": "custom-alias",
    "originalUrl": "https://example.com/long-url",
    "clicks": 0,
    "createdAt": "2025-04-10T12:00:00Z"
  }
}`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Get Link Analytics</h3>
            <div className="bg-sidebar rounded-lg p-4 font-mono text-xs text-sidebar-foreground overflow-x-auto">
              <pre>{`GET /api/v1/analytics/:urlId
Headers:
  Authorization: Bearer YOUR_API_KEY

Response:
{
  "success": true,
  "data": {
    "totalClicks": 1234,
    "countries": [...],
    "devices": [...],
    "clicksOverTime": [...]
  }
}`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Rate Limits</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Free plan: 100 requests/hour</p>
              <p>• Pro plan: 1,000 requests/hour</p>
              <p>• Enterprise: Unlimited</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
