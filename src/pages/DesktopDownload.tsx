import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Icon } from "@iconify/react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const downloads = [
  {
    platform: "Windows",
    subtitle: "For Windows 10 and 11",
    href: "/api/track-download?platform=win",
    icon: "logos:microsoft-windows-icon",
    deviceIcon: "logos:microsoft-windows-icon",
    accent: "from-sky-500/22 to-cyan-500/8",
  },
  {
    platform: "macOS",
    subtitle: "For Apple Silicon and Intel",
    href: "/api/track-download?platform=mac",
    icon: "simple-icons:apple",
    deviceIcon: "simple-icons:apple",
    accent: "from-violet-500/22 to-fuchsia-500/8",
  },
];

const DesktopDownload = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Download LOVIX Desktop App"
        description="Download the LOVIX desktop app for Windows and macOS."
        keywords="LOVIX desktop app, LOVIX download, Windows app, macOS app"
        canonicalPath="/download"
      />

      <main className="relative overflow-hidden">
        <div className="absolute left-1/2 top-8 h-64 w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <section className="container relative mx-auto px-4 py-16 sm:py-24">
          <Link
            to="/dashboard"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_34px_hsl(var(--primary)/0.18)]">
              <Icon icon="line-md:download" className="h-7 w-7" />
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              LOVIX Desktop
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Install the desktop app for a cleaner creative workspace, faster access to your tools, and fewer browser distractions.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            {downloads.map((item) => (
              <a
                key={item.platform}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br ${item.accent} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.14)]`}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-background/40">
                      <Icon icon={item.deviceIcon} className={`h-8 w-8 ${item.platform === "macOS" ? "text-foreground" : ""}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon icon={item.icon} className={`h-5 w-5 ${item.platform === "macOS" ? "text-foreground" : ""}`} />
                        <h2 className="text-xl font-bold text-foreground">{item.platform}</h2>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <Icon icon="line-md:download" className="h-6 w-6 text-primary opacity-80 transition-transform duration-300 group-hover:scale-110" />
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-background/35 px-4 py-3">
                  <span className="flex items-center justify-center gap-2 text-sm font-bold text-foreground">
                    Download for {item.platform}
                    <Icon icon="solar:arrow-right-up-bold-duotone" className="h-4 w-4 text-primary" />
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Secure install", text: "Direct LOVIX download flow." },
              { icon: Zap, title: "Fast access", text: "Open your creative tools faster." },
              { icon: Sparkles, title: "Same account", text: "Use your dashboard and credits." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/60 bg-card/50 p-4">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default DesktopDownload;
