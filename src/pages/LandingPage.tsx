import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Globe, Link2, QrCode, Shield, Zap } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: Link2, title: "Smart URL Shortening", desc: "Convert long URLs into short, branded links with AI-powered alias suggestions." },
  { icon: BarChart3, title: "Rich Analytics", desc: "Track every click with detailed insights — location, device, browser, and more." },
  { icon: QrCode, title: "QR Code Generation", desc: "Instantly generate downloadable QR codes for any shortened link." },
  { icon: Globe, title: "Geographic Tracking", desc: "See where your audience is clicking from with country and city-level data." },
  { icon: Shield, title: "Link Security", desc: "Password-protect links, set expiry dates, and detect malicious URLs." },
  { icon: Zap, title: "Public API", desc: "Integrate with your apps using a powerful REST API with key-based auth." },
];

const stats = [
  { value: "10M+", label: "Links Created" },
  { value: "500M+", label: "Clicks Tracked" },
  { value: "190+", label: "Countries" },
  { value: "99.9%", label: "Uptime" },
];

export default function LandingPage() {
  const [demoUrl, setDemoUrl] = useState("");
  const [shortened, setShortened] = useState("");

  const handleDemo = () => {
    if (!demoUrl) return;
    try {
      const u = new URL(demoUrl);
      const domain = u.hostname.replace("www.", "").split(".")[0];
      setShortened(`short.ly/${domain}-${Math.random().toString(36).slice(2, 6)}`);
    } catch {
      setShortened(`short.ly/${Math.random().toString(36).slice(2, 8)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Link2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ShortlyAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Stats</a>
            <a href="#api" className="hover:text-foreground transition-colors">API</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <p className="text-sm font-medium text-primary mb-4">Free plan available • No credit card required</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              URL shortener with{" "}
              <span className="text-gradient">smart aliases</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Create branded short links with AI-powered aliases. Track every click with detailed analytics, QR codes, and a powerful API.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="px-8">
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">View demo</Button>
              </Link>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-8 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <Link2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Shorten your link</h2>
            </div>
            <div className="flex gap-2">
              <input
                value={demoUrl}
                onChange={e => setDemoUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                onKeyDown={e => e.key === "Enter" && handleDemo()}
              />
              <Button onClick={handleDemo} className="px-6">
                Shorten <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            {shortened && (
              <div className="mt-4 p-4 rounded-lg bg-muted border">
                <p className="text-xs text-muted-foreground mb-1">YOUR SHORT LINK:</p>
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-primary font-medium">{shortened}</code>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(shortened)}>
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Everything you need to manage links</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Powerful features for marketers, developers, and businesses of all sizes.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="group p-6 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-300">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Powerful REST API</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">Integrate link shortening into your apps with a simple API call. Generate API keys from your dashboard.</p>
              <Link to="/signup">
                <Button className="mt-6" size="lg">Get your API key <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="bg-sidebar rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-sidebar-foreground">
{`curl -X POST https://api.short.ly/create \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very/long/url",
    "alias": "my-link"
  }'`}
              </pre>
              <pre className="mt-4 text-primary">
{`{
  "shortUrl": "https://short.ly/my-link",
  "clicks": 0,
  "createdAt": "2025-04-10T..."
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to shorten smarter?</h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Join thousands of businesses using ShortlyAI to manage, track, and optimize their links.</p>
        <Link to="/signup">
          <Button size="lg" className="mt-8 px-10">Start for free <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Link2 className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">ShortlyAI</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 ShortlyAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
