import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import SEOHead from "@/components/SEOHead";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const isDesktopApp = typeof window !== 'undefined' && !!(window as any).__lovixDesktop;

const sendWelcomeEmail = (name: string) => {
  callAPI('send-welcome-email', { name }).catch(() => {});
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignUp = searchParams.get("mode") === "signup";

  const [isLogin, setIsLogin] = useState(!isSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          let message = error.message;
          if (error.message.includes("Invalid login credentials"))
            message = "Invalid email or password. Please try again.";
          if (error.message.toLowerCase().includes("confirm") || error.message.toLowerCase().includes("not confirmed"))
            message = "Please confirm your email first. Check your inbox for the confirmation link.";
          toast({ title: "Sign in failed", description: message, variant: "destructive" });
        }
      } else {
        const { error, needsConfirmation } = await signUp(email, password, fullName);
        if (error) {
          let message = error.message;
          if (error.message.includes("User already registered"))
            message = "An account with this email already exists. Please sign in instead.";
          toast({ title: "Sign up failed", description: message, variant: "destructive" });
        } else if (needsConfirmation) {
          setPendingEmail(email);
          setResendCooldown(60);
          sendWelcomeEmail(fullName);
        } else {
          sendWelcomeEmail(fullName);
          navigate('/dashboard');
        }
      }
    } catch {
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail });
      if (error) throw error;
      setResendCooldown(60);
      toast({ title: "Email sent!", description: "Check your inbox for the confirmation link." });
    } catch {
      toast({ title: "Failed to resend", description: "Please try again.", variant: "destructive" });
    } finally {
      setResendLoading(false);
    }
  };

  const toggleMode = () => { setIsLogin(!isLogin); setErrors({}); setPendingEmail(null); };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
    } catch {
      toast({ title: "An error occurred", description: "Please try again later.", variant: "destructive" });
    }
  };

  // ── Check email screen ─────────────────────────────────────────
  if (pendingEmail) {
    return (
      <div className="min-h-screen flex bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 animate-fade-in-up text-center">
            {/* Logo */}
            <Link to={isDesktopApp ? "/auth" : "/"} className="flex items-center gap-2 group justify-center">
              <img src="/logo-wordmark.svg" alt="LOVIX AI" className="h-11 w-auto" />
            </Link>

            {/* Mail icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Mail className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-bold text-foreground">Check your inbox!</h1>
              <p className="text-muted-foreground">
                We sent a confirmation link to
              </p>
              <div className="px-4 py-2 rounded-xl bg-card border border-border inline-block">
                <span className="text-foreground font-semibold">{pendingEmail}</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Click the link in the email to activate your account and get your{" "}
                <span className="text-primary font-semibold">150 free credits</span>.
              </p>
            </div>

            {/* Credits hint */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
              <p className="text-sm text-primary font-semibold flex items-center gap-2 justify-center">
                <Sparkles className="w-4 h-4" />
                Your 150 free credits are waiting
              </p>
              <p className="text-xs text-muted-foreground">Confirm your email to unlock AI image, video &amp; influencer creation</p>
            </div>

            {/* Resend */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Didn't receive the email?</p>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-card border-border hover:bg-accent"
                onClick={handleResend}
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendLoading ? (
                  <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation email"}
                  </>
                )}
              </Button>
            </div>

            <button onClick={() => { setPendingEmail(null); setIsLogin(true); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to sign in
            </button>
          </div>
        </div>

        {/* Right video side */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
        </div>
      </div>
    );
  }

  // ── Normal login/signup form ───────────────────────────────────
  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <Link to={isDesktopApp ? "/auth" : "/"} className="flex items-center gap-2 group">
            <img src="/logo-wordmark.svg" alt="LOVIX AI" className="h-11 w-auto" />
          </Link>

          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "Sign in to continue creating with AI" : "Start generating amazing content with LOVIX"}
            </p>
            {!isLogin && (
              <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Get 150 free credits — No credit card required!
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="text" placeholder="John Doe" value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="pl-12 h-12 bg-card border-border" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={email}
                  onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  className={`pl-12 h-12 bg-card border-border ${errors.email ? 'border-destructive' : ''}`}
                  required />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                  className={`pl-12 pr-12 h-12 bg-card border-border ${errors.password ? 'border-destructive' : ''}`}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 glow-soft" disabled={isLoading}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}<ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-12 bg-card border-border hover:bg-accent" onClick={handleGoogleSignIn}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={toggleMode} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <blockquote className="max-w-md space-y-4">
            <p className="text-2xl font-display font-medium text-foreground">
              "LOVIX has completely transformed how I create content. The AI is incredible."
            </p>
            <footer className="text-muted-foreground">— Creative Director, Studio X</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Auth;
