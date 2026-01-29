import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/lib/types';
import { ProductFormData } from '@/hooks/useAdminProducts';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  original_price: z.coerce.number().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  images: z.string().min(1, 'At least one image URL is required'),
  colors: z.string().optional(),
  materials: z.string().optional(),
  vendor: z.string().min(1, 'Vendor is required'),
  tags: z.string().optional(),
  in_stock: z.boolean(),
  commission_percent: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

const categories = [
  'Living Room',
  'Bedroom',
  'Dining',
  'Office',
  'Outdoor',
  'Lighting',
  'Decor',
];

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<boolean>;
  saving: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  saving,
}: ProductFormDialogProps) {
  const isEdit = !!product;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      original_price: undefined,
      category: '',
      subcategory: '',
      images: '',
      colors: '',
      materials: '',
      vendor: '',
      tags: '',
      in_stock: true,
      commission_percent: 15,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice,
        category: product.category,
        subcategory: product.subcategory || '',
        images: product.images.join(', '),
        colors: product.colors?.join(', ') || '',
        materials: product.materials?.join(', ') || '',
        vendor: product.vendor,
        tags: product.tags?.join(', ') || '',
        in_stock: product.inStock,
        commission_percent: 15,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        original_price: undefined,
        category: '',
        subcategory: '',
        images: '',
        colors: '',
        materials: '',
        vendor: '',
        tags: '',
        in_stock: true,
        commission_percent: 15,
      });
    }
  }, [product, form]);

  const handleSubmit = async (values: FormValues) => {
    const data: ProductFormData = {
      name: values.name,
      description: values.description,
      price: values.price,
      original_price: values.original_price || undefined,
      category: values.category,
      subcategory: values.subcategory || undefined,
      images: values.images.split(',').map(s => s.trim()).filter(Boolean),
      colors: values.colors ? values.colors.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      materials: values.materials ? values.materials.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      vendor: values.vendor,
      tags: values.tags ? values.tags.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      in_stock: values.in_stock,
      commission_percent: values.commission_percent,
    };

    const success = await onSubmit(data);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Modern Sofa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the product..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="original_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URLs (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="colors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colors (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Charcoal, Navy, Ivory" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Velvet, Oak, Steel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="bestseller, new, sale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="in_stock"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">In Stock</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Is this product available for purchase?
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
