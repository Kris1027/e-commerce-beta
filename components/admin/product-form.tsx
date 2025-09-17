'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { insertProductSchema } from '@/lib/validators';
import { createProduct } from '@/lib/actions/admin-product-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ProductImageUpload } from '@/components/ui/product-image-upload';
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Tag,
  FileText,
  Loader2,
  ImageIcon
} from 'lucide-react';
import Link from 'next/link';

type ProductFormData = z.infer<typeof insertProductSchema>;

const COMMON_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Sports',
  'Home & Garden',
  'Toys',
  'Beauty',
  'Automotive',
  'Food & Beverages',
  'Office Supplies'
];

export function ProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [bannerUrl, setBannerUrl] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: (zodResolver(insertProductSchema) as unknown) as Resolver<ProductFormData>,
    defaultValues: {
      name: '',
      slug: '',
      category: '',
      images: [],
      brand: '',
      description: '',
      stock: 0,
      price: '0.00',
      rating: '0.00',
      numReviews: 0,
      isFeatured: false,
      banner: null,
    },
  });

  const watchIsFeatured = watch('isFeatured');
  const watchImages = watch('images');

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    setValue('slug', generateSlug(name));
  };

  const handleImagesChange = (urls: string[]) => {
    setValue('images', urls, { shouldValidate: true });
  };

  const handleBannerChange = (urls: string[]) => {
    const bannerUrl = urls[0] || '';
    setBannerUrl(bannerUrl);
    setValue('banner', bannerUrl || null);
  };

  const onSubmit = (data: ProductFormData) => {
    if (data.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    const submitData = {
      ...data,
      price: data.price.toString(),
      rating: '0.00',
      numReviews: 0,
    };

    startTransition(async () => {
      const result = await createProduct(submitData);

      if (result.success) {
        toast.success('Product created successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to create product');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Product
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <div className="relative">
                <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  {...register('name', { onChange: handleNameChange })}
                  className="pl-9"
                  placeholder="e.g., Wireless Bluetooth Headphones"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="wireless-bluetooth-headphones"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="brand">Brand *</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="brand"
                  {...register('brand')}
                  className="pl-9"
                  placeholder="e.g., Sony"
                />
              </div>
              {errors.brand && (
                <p className="mt-1 text-sm text-destructive">{errors.brand.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="e.g., Electronics"
                list="categories"
              />
              <datalist id="categories">
                {COMMON_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && (
                <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  {...register('description')}
                  className="pl-9 min-h-[120px]"
                  placeholder="Product description..."
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
            <CardDescription>Set pricing and stock levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (PLN) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-destructive">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="featured">Featured Product</Label>
                <p className="text-sm text-muted-foreground">
                  Display this product in featured sections
                </p>
              </div>
              <Switch
                id="featured"
                checked={watchIsFeatured}
                onCheckedChange={(checked: boolean) => setValue('isFeatured', checked)}
              />
            </div>

            <div>
              <Label htmlFor="banner">Banner Image (Optional)</Label>
              <ProductImageUpload
                value={bannerUrl ? [bannerUrl] : []}
                onChange={handleBannerChange}
                maxImages={1}
                disabled={isPending}
              />
              {errors.banner && (
                <p className="mt-1 text-sm text-destructive">{errors.banner.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Product Images
            </CardTitle>
            <CardDescription>
              Upload product images (at least one required). First image will be the main product image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageUpload
              value={watchImages || []}
              onChange={handleImagesChange}
              maxImages={5}
              disabled={isPending}
            />
            {errors.images && (
              <p className="mt-2 text-sm text-destructive">{errors.images.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}