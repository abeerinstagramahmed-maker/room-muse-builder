import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, Camera, Save, CreditCard, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, updatePassword } = useAuthContext();
  const { profile, loading: profileLoading, saving, updateProfile, uploadAvatar } = useProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Avatar must be under 2MB.', variant: 'destructive' });
      return;
    }
    await uploadAvatar(file);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords don\'t match', description: 'Please confirm your password.', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    await updatePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setChangingPassword(false);
  };

  const initials = (profile?.full_name || user?.email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="container max-w-2xl py-8 md:py-12">
        <h1 className="font-display text-3xl font-bold">Edit Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account settings</p>

        <div className="mt-8 space-y-6">
          {/* Avatar & Name */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Profile Photo</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG under 2MB</p>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword || !newPassword}
                variant="outline"
                className="gap-2"
              >
                {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Save a card for faster checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Payment methods will be available once Stripe is configured in the admin dashboard.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your cards are securely stored by Stripe — we never see your full card number.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
