import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { name: "Video", path: "/video-model" },
  { name: "Image", path: "/image-model" },
  { name: "AI Influencer", path: "/ai-influencer" },
  { name: "UGC Ads", path: "/ugc-marketing", badge: "NEW" },
  { name: "Motion", path: "/motion-control" },
  { name: "Pricing", path: "/pricing" },
];

const LovixLogo = () => (
  <div className="relative flex-shrink-0">
    <img
      src="/logo.svg"
      alt="LOVIX logo"
      width="32"
      height="32"
      className="w-8 h-8"
    />
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-[0_1px_0_hsl(var(--border)/0.3),0_8px_32px_hsl(var(--background)/0.5)]"
          : "bg-background/40 backdrop-blur-xl border-b border-transparent"
      }`}
    >
      {/* Gradient bottom line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500 ${
          scrolled ? "opacity-60" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--violet)/0.6), hsl(var(--primary)/0.5), hsl(var(--cyan)/0.4), transparent)",
        }}
      />

      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <LovixLogo />
              <div
                className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                style={{ background: "radial-gradient(hsl(var(--primary)), transparent)" }}
              />
            </div>
            <span className="font-display text-xl font-bold gradient-text-aurora">
              LOVIX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-foreground bg-white/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground tracking-wider">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--violet)))",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-2.5">
            {user ? (
              <Link to="/dashboard">
                <Button
                  className="rounded-full font-semibold tracking-wide text-sm px-5"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85))",
                    boxShadow: "0 4px 20px hsl(var(--primary)/0.3)",
                  }}
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground text-sm rounded-full"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button
                    className="rounded-full font-semibold tracking-wide text-sm px-5"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85))",
                      boxShadow: "0 4px 20px hsl(var(--primary)/0.3)",
                    }}
                  >
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-border/30 animate-fade-in-up">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-foreground bg-white/6"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/4"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-primary-foreground">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-border/30 flex flex-col gap-2.5">
              {user ? (
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-full font-semibold" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85))" }}>
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full text-sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-full font-semibold" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.85))" }}>
                      Start Creating Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
