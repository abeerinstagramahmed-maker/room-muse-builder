import { useState, useEffect } from 'react';
import { Save, Loader2, Globe, FileText, Megaphone } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  problemTitle: string;
  problemDescription: string;
  featuresTitle: string;
  testimonialsEnabled: boolean;
  announcementBanner: string;
  announcementEnabled: boolean;
}

interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
  keywords: string;
}

const defaultLanding: LandingContent = {
  heroTitle: 'Design Your Dream Room with AI',
  heroSubtitle: 'Upload a photo and let our AI suggest the perfect furniture from top US stores.',
  heroCtaText: 'Start Designing Free',
  problemTitle: 'Furnishing a room shouldn\'t be this hard',
  problemDescription: 'Endless scrolling, mismatched styles, and furniture that doesn\'t fit.',
  featuresTitle: 'Everything you need to design your perfect space',
  testimonialsEnabled: true,
  announcementBanner: '',
  announcementEnabled: false,
};

const defaultSeo: SeoSettings = {
  siteTitle: 'Roomly — AI Interior Design',
  siteDescription: 'Transform any room with AI-powered interior design. Get curated furniture recommendations from top US stores.',
  ogImage: '',
  keywords: 'interior design, AI, furniture, room design, home decor',
};

export default function AdminContent() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [landing, setLanding] = useState<LandingContent>(defaultLanding);
  const [seo, setSeo] = useState<SeoSettings>(defaultSeo);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value')
        .in('key', ['landing_content', 'seo_settings']);

      if (error) throw error;

      data?.forEach(setting => {
        if (setting.key === 'landing_content') {
          setLanding({ ...defaultLanding, ...(setting.value as any) });
        } else if (setting.key === 'seo_settings') {
          setSeo({ ...defaultSeo, ...(setting.value as any) });
        }
      });
    } catch (error: any) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const upsertSetting = async (key: string, value: any) => {
    const { data, error: updateError } = await supabase
      .from('store_settings')
      .update({ value: JSON.parse(JSON.stringify(value)) })
      .eq('key', key)
      .select();

    if (updateError) throw updateError;

    if (!data || data.length === 0) {
      const { error: insertError } = await supabase
        .from('store_settings')
        .insert({ key, value: JSON.parse(JSON.stringify(value)) });
      if (insertError) throw insertError;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertSetting('landing_content', landing);
      await upsertSetting('seo_settings', seo);
      toast({ title: 'Content saved', description: 'Your changes have been published.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Content</h1>
          <p className="text-muted-foreground">Manage landing page content and SEO settings</p>
        </div>

        <Tabs defaultValue="landing">
          <TabsList>
            <TabsTrigger value="landing"><FileText className="h-4 w-4 mr-1" /> Landing Page</TabsTrigger>
            <TabsTrigger value="seo"><Globe className="h-4 w-4 mr-1" /> SEO</TabsTrigger>
            <TabsTrigger value="announcements"><Megaphone className="h-4 w-4 mr-1" /> Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="landing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Hero Section</CardTitle>
                <CardDescription>Main headline and call-to-action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input value={landing.heroTitle} onChange={e => setLanding({ ...landing, heroTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea value={landing.heroSubtitle} onChange={e => setLanding({ ...landing, heroSubtitle: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>CTA Button Text</Label>
                  <Input value={landing.heroCtaText} onChange={e => setLanding({ ...landing, heroCtaText: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Sections</CardTitle>
                <CardDescription>Toggle and customize page sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Problem Section Title</Label>
                  <Input value={landing.problemTitle} onChange={e => setLanding({ ...landing, problemTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Problem Description</Label>
                  <Textarea value={landing.problemDescription} onChange={e => setLanding({ ...landing, problemDescription: e.target.value })} rows={2} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Features Section Title</Label>
                  <Input value={landing.featuresTitle} onChange={e => setLanding({ ...landing, featuresTitle: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Testimonials</Label>
                    <p className="text-xs text-muted-foreground">Display customer testimonials section</p>
                  </div>
                  <Switch checked={landing.testimonialsEnabled} onCheckedChange={v => setLanding({ ...landing, testimonialsEnabled: v })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">SEO Settings</CardTitle>
                <CardDescription>Search engine optimization metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Site Title</Label>
                  <Input value={seo.siteTitle} onChange={e => setSeo({ ...seo, siteTitle: e.target.value })} />
                  <p className="text-xs text-muted-foreground">{seo.siteTitle.length}/60 characters</p>
                </div>
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea value={seo.siteDescription} onChange={e => setSeo({ ...seo, siteDescription: e.target.value })} rows={2} />
                  <p className="text-xs text-muted-foreground">{seo.siteDescription.length}/160 characters</p>
                </div>
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input value={seo.keywords} onChange={e => setSeo({ ...seo, keywords: e.target.value })} placeholder="comma, separated, keywords" />
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input value={seo.ogImage} onChange={e => setSeo({ ...seo, ogImage: e.target.value })} placeholder="https://..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Announcement Banner</CardTitle>
                <CardDescription>Display a banner across the top of the site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Banner</Label>
                    <p className="text-xs text-muted-foreground">Show announcement across the site</p>
                  </div>
                  <Switch checked={landing.announcementEnabled} onCheckedChange={v => setLanding({ ...landing, announcementEnabled: v })} />
                </div>
                {landing.announcementEnabled && (
                  <div className="space-y-2">
                    <Label>Banner Text</Label>
                    <Input value={landing.announcementBanner} onChange={e => setLanding({ ...landing, announcementBanner: e.target.value })} placeholder="🎉 Special offer: Get 50% off Pro!" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
