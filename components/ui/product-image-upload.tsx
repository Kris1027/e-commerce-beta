'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import { toast } from 'sonner';

interface ProductImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove?: (url: string) => void | Promise<void>;
  maxImages?: number;
  disabled?: boolean;
}

export function ProductImageUpload({
  value = [],
  onChange,
  onRemove,
  maxImages = 5,
  disabled = false,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { startUpload } = useUploadThing('productImageUploader', {
    onClientUploadComplete: (res) => {
      if (res) {
        const newUrls = res.map((file) => file.url);
        onChange([...value, ...newUrls]);
        toast.success(`${res.length} image${res.length > 1 ? 's' : ''} uploaded successfully`);
      }
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadError: (error: Error) => {
      toast.error(error.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = filesToUpload.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file sizes (max 4MB each)
    const oversizedFiles = filesToUpload.filter(
      (file) => file.size > 4 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 4MB');
      return;
    }

    setIsUploading(true);

    try {
      await startUpload(filesToUpload);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
      setIsUploading(false);
    }

    // Reset the input
    e.target.value = '';
  };

  const handleRemove = async (indexToRemove: number) => {
    const urlToRemove = value[indexToRemove];
    const newUrls = value.filter((_, index) => index !== indexToRemove);

    // Update the UI immediately
    onChange(newUrls);

    // Call the onRemove callback if provided to handle storage deletion
    if (onRemove && urlToRemove) {
      try {
        await onRemove(urlToRemove);
      } catch (error) {
        console.error('Failed to remove image from storage:', error);
        // Image is already removed from UI, so we don't revert
      }
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value];
    const [movedItem] = newUrls.splice(fromIndex, 1);
    if (movedItem) {
      newUrls.splice(toIndex, 0, movedItem);
    }
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
              if (fromIndex !== index) {
                handleReorder(fromIndex, index);
              }
            }}
          >
            <Image
              src={url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover cursor-move"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemove(index)}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2">
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Main
                </span>
              </div>
            )}
          </div>
        ))}

        {value.length < maxImages && (
          <label
            className={cn(
              'relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted transition-colors cursor-pointer flex flex-col items-center justify-center gap-2',
              isUploading && 'pointer-events-none opacity-50',
              disabled && 'pointer-events-none opacity-50'
            )}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="sr-only"
            />
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploadProgress}%
                </span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center px-2">
                  Upload Image
                </span>
                <span className="text-xs text-muted-foreground">
                  {value.length}/{maxImages}
                </span>
              </>
            )}
          </label>
        )}
      </div>

      {value.length > 1 && (
        <p className="text-sm text-muted-foreground">
          Drag and drop images to reorder. First image will be the main product image.
        </p>
      )}
    </div>
  );
}