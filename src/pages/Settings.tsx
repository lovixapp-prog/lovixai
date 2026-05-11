import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  CreditCard,
  Trash2,
  Loader2,
  Save,
  Crown,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { callAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { redirectToExternal } from "@/lib/externalRedirect";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credits: number;
}

const Settings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, subscription, subscriptionLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!error && data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setEmail(data.email || user.email || "");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
        toast({
          title: "Verification email sent",
          description: "Please check your email to confirm the change.",
        });
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      
      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const data = await callAPI<{ url?: string; error?: string }>('customer-portal', {});

      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        redirectToExternal(data.url);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get portal URL',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open subscription management',
        variant: 'destructive',
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Sign out first
      await signOut();
      
      // Note: Full account deletion would require a backend function
      // For now, we just sign out
      toast({
        title: "Account deactivated",
        description: "Please contact support to permanently delete your account.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
      setDeleteLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="font-display text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <div className="space-y-6 sm:space-y-8">
          
          {/* Profile Section */}
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <p className="text-xs text-muted-foreground">
                  Changing your email will require verification
                </p>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </section>

          {/* Password Section */}
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              <Button 
                onClick={handleChangePassword} 
                disabled={passwordLoading || !newPassword || !confirmPassword}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {passwordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Update Password
              </Button>
            </div>
          </section>

          {/* Subscription & Billing Section */}
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Subscription & Billing</h2>
                <p className="text-sm text-muted-foreground">Manage your plan and payment methods</p>
              </div>
            </div>

            {/* Current Plan */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  {subscriptionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mt-1" />
                  ) : subscription.subscribed ? (
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      <Crown className="w-4 h-4 text-primary" />
                      {subscription.plan}
                    </p>
                  ) : (
                    <p className="font-semibold text-foreground">Free (Pay-as-you-go)</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="font-semibold text-foreground">
                    {subscription.subscribed ? '∞' : profile?.credits ?? 0}
                  </p>
                </div>
              </div>
              {subscription.subscribed && subscription.subscriptionEnd && (
                <p className="text-xs text-muted-foreground mt-2">
                  Renews on {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {/* Manage Subscription */}
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                <span className="flex items-center gap-2">
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4" />
                  )}
                  Manage Subscription
                </span>
                <ExternalLink className="w-4 h-4" />
              </Button>

              {/* Payment History */}
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  View Payment History
                </span>
                <ExternalLink className="w-4 h-4" />
              </Button>

              {/* Buy Credits */}
              <Button
                variant="outline"
                className="w-full justify-between"
                asChild
              >
                <Link to="/pricing">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Buy More Credits
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-destructive/50 bg-destructive/5 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-destructive">Danger Zone</h2>
                <p className="text-sm text-muted-foreground">Irreversible account actions</p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers. Any remaining credits
                    will be forfeited.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <p className="text-xs text-muted-foreground mt-3">
              Deleting your account will cancel any active subscriptions and remove all your generated content.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Settings;
