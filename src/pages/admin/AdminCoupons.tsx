import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number | null;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

const emptyCoupon = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_order: 0,
  max_uses: null as number | null,
  expires_at: '',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (!error && data) setCoupons(data);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openNew = () => {
    setEditId(null);
    setForm(emptyCoupon);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order: c.min_order ?? 0,
      max_uses: c.max_uses,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || form.discount_value <= 0) {
      toast({ title: 'Validation error', description: 'Code and discount value are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order: form.min_order || 0,
      max_uses: form.max_uses || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    if (editId) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', editId);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Coupon updated' });
    } else {
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Coupon created' });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchCoupons();
  };

  const toggleActive = async (c: Coupon) => {
    await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from('coupons').delete().eq('id', id);
    toast({ title: 'Coupon deleted' });
    fetchCoupons();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Coupons</h1>
            <p className="text-muted-foreground">Manage discount codes</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> New Coupon
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : coupons.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No coupons yet</TableCell></TableRow>
              ) : coupons.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}</TableCell>
                  <TableCell>{c.min_order ? `$${c.min_order}` : '—'}</TableCell>
                  <TableCell>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</TableCell>
                  <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</TableCell>
                  <TableCell>
                    <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(c)} title={c.active ? 'Deactivate' : 'Activate'}>
                        {c.active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCoupon(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Coupon' : 'New Coupon'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Coupon Code</Label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. SAVE20" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value</Label>
                  <Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Order ($)</Label>
                  <Input type="number" value={form.min_order ?? ''} onChange={e => setForm(f => ({ ...f, min_order: Number(e.target.value) || 0 }))} className="mt-1" />
                </div>
                <div>
                  <Label>Max Uses (blank = unlimited)</Label>
                  <Input type="number" value={form.max_uses ?? ''} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value ? Number(e.target.value) : null }))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Expires At</Label>
                <Input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
