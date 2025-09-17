'use client';

import { useState, useTransition, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { updateProductSchema } from '@/lib/validators';
import { updateProduct, getAllCategoryNames } from '@/lib/actions/admin-product-actions';
import { deleteUploadThingFilesByUrls } from '@/lib/actions/uploadthing-actions';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ProductImageUpload } from '@/components/ui/product-image-upload';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Save,
  Package,
  Tag,
  FileText,
  Loader2,
  ImageIcon,
  AlertTriangle,
  Boxes,
  Banknote,
  FolderOpen,
  Star
} from 'lucide-react';

type ProductEditFormData = z.infer<typeof updateProductSchema>;

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    category: string;
    images: string[];
    brand: string;
    description: string;
    stock: number;
    price: string;
    rating: string;
    numReviews: number;
    isFeatured: boolean;
    banner: string | null;
    createdAt: Date;
  };
}

export function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Track original images to detect changes
  const originalImagesRef = useRef<string[]>(product.images);
  const originalBannerRef = useRef<string | null>(product.banner);

  // Track newly uploaded images for cleanup
  const newlyUploadedImagesRef = useRef<string[]>([]);
  const formSubmittedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductEditFormData>({
    resolver: (zodResolver(updateProductSchema) as unknown) as Resolver<ProductEditFormData>,
    defaultValues: {
      name: product.name,
      slug: product.slug,
      category: product.category,
      images: product.images,
      brand: product.brand,
      description: product.description,
      stock: product.stock,
      price: product.price,
      isFeatured: product.isFeatured,
      banner: product.banner,
    },
  });

  const watchIsFeatured = watch('isFeatured');
  const watchImages = watch('images');
  const watchBanner = watch('banner');
  const watchCategory = watch('category');

  // Fetch existing categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const categories = await getAllCategoryNames();
      setExistingCategories(categories);
    }
    fetchCategories();
    setCategorySearch(product.category);
  }, [product.category]);

  // Filter categories based on search
  const filteredCategories = existingCategories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

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
    // Track newly uploaded images (ones not in original)
    const newImages = urls.filter(url => !originalImagesRef.current.includes(url));
    newlyUploadedImagesRef.current = newImages;

    setValue('images', urls, { shouldValidate: true });
  };

  const handleImageRemove = async (url: string) => {
    // Only delete from storage if it's a newly uploaded image (not part of original product)
    if (!originalImagesRef.current.includes(url)) {
      try {
        const result = await deleteUploadThingFilesByUrls([url]);
        if (result.success) {
          // Remove from tracking ref as well
          newlyUploadedImagesRef.current = newlyUploadedImagesRef.current.filter(u => u !== url);
          toast.success('Image removed successfully');
        } else {
          toast.error('Failed to remove image');
        }
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
        toast.error('Failed to remove image');
      }
    } else {
      // Original image - will be removed when saving
      toast.info('Image will be removed when you save changes');
    }
  };

  const handleBannerChange = (urls: string[]) => {
    const bannerUrl = urls[0] || '';

    // Track if this is a newly uploaded banner
    if (bannerUrl && bannerUrl !== originalBannerRef.current) {
      if (!newlyUploadedImagesRef.current.includes(bannerUrl)) {
        newlyUploadedImagesRef.current.push(bannerUrl);
      }
    }

    setValue('banner', bannerUrl || null);
  };

  const handleBannerRemove = async (url: string) => {
    // Only delete from storage if it's not the original banner
    if (url !== originalBannerRef.current) {
      try {
        const result = await deleteUploadThingFilesByUrls([url]);
        if (result.success) {
          // Remove from tracking ref
          newlyUploadedImagesRef.current = newlyUploadedImagesRef.current.filter(u => u !== url);
          toast.success('Banner image removed successfully');
        } else {
          toast.error('Failed to remove banner image');
        }
      } catch (error) {
        console.error('Failed to delete banner from storage:', error);
        toast.error('Failed to remove banner image');
      }
    } else {
      // Original banner - will be removed when saving
      toast.info('Banner will be removed when you save changes');
    }
  };

  // Handle cancel with cleanup
  const handleCancel = async () => {
    const hasNewUploads = newlyUploadedImagesRef.current.length > 0;

    if (hasNewUploads) {
      setShowCancelDialog(true);
    } else {
      router.push('/admin/products');
    }
  };

  // Cleanup function that only deletes newly uploaded images
  const cleanupNewUploads = useCallback(async () => {
    if (newlyUploadedImagesRef.current.length > 0) {
      try {
        const result = await deleteUploadThingFilesByUrls(newlyUploadedImagesRef.current);
        if (result.success) {
          // Successfully cleaned up newly uploaded images
        }
      } catch (error) {
        console.error('Failed to cleanup uploads:', error);
      }
    }
  }, []);

  const confirmCancel = async () => {
    setIsCleaningUp(true);

    try {
      await cleanupNewUploads();
      toast.info('Newly uploaded images cleaned up');
    } catch (error) {
      console.error('Failed to cleanup uploads:', error);
    } finally {
      setIsCleaningUp(false);
      setShowCancelDialog(false);
      formSubmittedRef.current = true;

      if (pendingNavigation === 'back') {
        router.back();
      } else if (pendingNavigation) {
        router.push(pendingNavigation);
      } else {
        router.push('/admin/products');
      }
      setPendingNavigation(null);
    }
  };

  // Navigation guard - blocks navigation when there are unsaved uploads
  useNavigationGuard({
    shouldBlock: () => {
      const hasNewUploads = newlyUploadedImagesRef.current.length > 0;
      return hasNewUploads && !formSubmittedRef.current;
    },
    onBlock: (url) => {
      setPendingNavigation(url || null);
      setShowCancelDialog(true);
    },
    message: 'You have newly uploaded images that will be lost. Are you sure you want to leave?'
  });

  const onSubmit = (data: ProductEditFormData) => {
    if (data.images && data.images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    const submitData = {
      ...data,
      id: product.id,
      price: data.price?.toString(),
    };

    startTransition(async () => {
      const result = await updateProduct(submitData);

      if (result.success) {
        // Mark form as submitted and clear refs
        formSubmittedRef.current = true;
        newlyUploadedImagesRef.current = [];

        toast.success('Product updated successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to update product');
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending || isCleaningUp}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isCleaningUp}
              className="min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="relative space-y-2">
              <Label htmlFor="category">Category *</Label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                <Input
                id="category"
                {...register('category')}
                className="pl-9"
                placeholder="Type or select a category"
                value={watchCategory || categorySearch}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategorySearch(value);
                  setValue('category', value);
                  setShowCategoryDropdown(true);
                }}
                onFocus={() => setShowCategoryDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowCategoryDropdown(false), 200);
                }}
                autoComplete="off"
              />
              </div>
              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-auto">
                  {filteredCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setValue('category', category);
                        setCategorySearch(category);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {category}
                    </button>
                  ))}
                  {categorySearch && !existingCategories.includes(categorySearch) && (
                    <div className="px-3 py-2 text-sm text-muted-foreground border-t">
                      Press Enter to create &quot;{categorySearch}&quot;
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Select from existing categories or type a new one
              </p>
              {errors.category && (
                <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
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
            <CardDescription>Update pricing and stock levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (PLN) *</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <div className="relative">
                  <Boxes className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="stock"
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className="pl-9"
                    placeholder="0"
                  />
                </div>
                {errors.stock && (
                  <p className="mt-1 text-sm text-destructive">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="featured" className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Featured Product
                </Label>
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

            <div className="space-y-2">
              <Label htmlFor="banner" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Banner Image (Optional)
              </Label>
              <p className="text-sm text-muted-foreground">
                Wide banner image for featured product promotions
              </p>
              <ProductImageUpload
                value={watchBanner ? [watchBanner] : []}
                onChange={handleBannerChange}
                onRemove={handleBannerRemove}
                maxImages={1}
                disabled={isPending || isCleaningUp}
              />
              {errors.banner && (
                <p className="mt-2 text-sm text-destructive">{errors.banner.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Product Images *
            </CardTitle>
            <CardDescription>
              Update product images (at least one required). First image will be the main product image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageUpload
              value={watchImages || []}
              onChange={handleImagesChange}
              onRemove={handleImageRemove}
              maxImages={5}
              disabled={isPending || isCleaningUp}
            />
            {errors.images && (
              <p className="mt-2 text-sm text-destructive">{errors.images.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>

    {/* Cancel Confirmation Dialog */}
    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Discard Changes?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>You have unsaved changes that will be lost:</p>
              {newlyUploadedImagesRef.current.length > 0 && (
                <ul className="ml-4 space-y-1 text-sm">
                  <li className="flex items-center gap-1">
                    • {newlyUploadedImagesRef.current.length} newly uploaded image{newlyUploadedImagesRef.current.length > 1 ? 's' : ''}
                  </li>
                </ul>
              )}
              <p className="pt-2 font-medium">These newly uploaded images will be permanently deleted.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isCleaningUp}
            onClick={() => {
              setPendingNavigation(null);
            }}
          >
            Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmCancel}
            disabled={isCleaningUp}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCleaningUp ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cleaning up...
              </>
            ) : (
              'Discard & Leave'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}