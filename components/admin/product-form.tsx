'use client';

import { useState, useTransition, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { insertProductSchema } from '@/lib/validators';
import { createProduct, getAllCategoryNames } from '@/lib/actions/admin-product-actions';
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
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Tag,
  FileText,
  Loader2,
  ImageIcon,
  AlertTriangle
} from 'lucide-react';

type ProductFormData = z.infer<typeof insertProductSchema>;

export function ProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Track uploaded images for cleanup
  const uploadedImagesRef = useRef<string[]>([]);
  const formSubmittedRef = useRef(false);

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
  const watchBanner = watch('banner');
  const watchCategory = watch('category');

  // Fetch existing categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const categories = await getAllCategoryNames();
      setExistingCategories(categories);
    }
    fetchCategories();
  }, []);

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
    // Track all uploaded images
    uploadedImagesRef.current = urls;
    setValue('images', urls, { shouldValidate: true });
  };

  const handleBannerChange = (urls: string[]) => {
    const bannerUrl = urls[0] || '';
    setValue('banner', bannerUrl || null);
  };

  // Handle cancel with cleanup
  const handleCancel = async () => {
    const hasUploads = uploadedImagesRef.current.length > 0 || watchBanner;

    if (hasUploads) {
      setShowCancelDialog(true);
    } else {
      router.push('/admin/products');
    }
  };

  // Cleanup function that can be reused
  const cleanupUploads = useCallback(async () => {
    const urlsToDelete = [...uploadedImagesRef.current];
    if (watchBanner) {
      urlsToDelete.push(watchBanner);
    }

    if (urlsToDelete.length > 0) {
      try {
        const result = await deleteUploadThingFilesByUrls(urlsToDelete);
        if (result.success) {
          console.log('Cleaned up uploaded images');
        }
      } catch (error) {
        console.error('Failed to cleanup uploads:', error);
      }
    }
  }, [watchBanner]);

  const confirmCancel = async () => {
    setIsCleaningUp(true);

    try {
      await cleanupUploads();
      toast.success('Uploaded images cleaned up');
    } catch (error) {
      console.error('Failed to cleanup uploads:', error);
    } finally {
      setIsCleaningUp(false);
      setShowCancelDialog(false);
      formSubmittedRef.current = true; // Mark as handled

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
      const hasUploads = uploadedImagesRef.current.length > 0 || !!watchBanner;
      return hasUploads && !formSubmittedRef.current;
    },
    onBlock: (url) => {
      setPendingNavigation(url || null);
      setShowCancelDialog(true);
    },
    message: 'You have uploaded images that will be lost. Are you sure you want to leave?'
  });

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
        // Mark form as submitted and clear refs
        formSubmittedRef.current = true;
        uploadedImagesRef.current = [];

        toast.success('Product created successfully!');
        router.push('/admin/products');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to create product');
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const hasUploads = uploadedImagesRef.current.length > 0 || watchBanner;
              if (hasUploads) {
                setPendingNavigation('back');
                setShowCancelDialog(true);
              } else {
                router.back();
              }
            }}
            disabled={isPending || isCleaningUp}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

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

            <div className="relative">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                {...register('category')}
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
                  // Delay to allow clicking on dropdown items
                  setTimeout(() => setShowCategoryDropdown(false), 200);
                }}
                autoComplete="off"
              />
              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md max-h-60 overflow-auto">
                  {filteredCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
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
                      Press Enter to create "{categorySearch}"
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
              <p className="text-sm text-muted-foreground mb-2">
                Wide banner image for product promotions
              </p>
              <ProductImageUpload
                value={watchBanner ? [watchBanner] : []}
                onChange={handleBannerChange}
                maxImages={1}
                disabled={isPending || isCleaningUp}
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
              <ul className="ml-4 space-y-1 text-sm">
                {uploadedImagesRef.current.length > 0 && (
                  <li className="flex items-center gap-1">
                    • {uploadedImagesRef.current.length} product image{uploadedImagesRef.current.length > 1 ? 's' : ''}
                  </li>
                )}
                {watchBanner && (
                  <li className="flex items-center gap-1">
                    • 1 banner image
                  </li>
                )}
              </ul>
              <p className="pt-2 font-medium">These images will be permanently deleted.</p>
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