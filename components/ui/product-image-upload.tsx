'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Upload, Loader2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove?: (url: string) => void | Promise<void>;
  maxImages?: number;
  disabled?: boolean;
}

interface SortableImageItemProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
  disabled?: boolean;
  isMain?: boolean;
}

function SortableImageItem({ url, index, onRemove, disabled, isMain }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: url,
    disabled: disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group aspect-square rounded-lg overflow-hidden border-2 bg-muted transition-all",
        isDragging && "opacity-50 z-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
    >
      {/* Drag handle */}
      <button
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded p-1 cursor-move touch-none"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder image ${index + 1}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <Image
        src={url}
        alt={`Product image ${index + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        draggable={false}
      />

      {/* Delete button overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          disabled={disabled}
          aria-label={`Remove image ${index + 1}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Main image badge */}
      {isMain && (
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-sm">
            Main
          </span>
        </div>
      )}
    </div>
  );
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag and drop with keyboard support
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Require 8px drag before activation to prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { startUpload } = useUploadThing('productImageUploader', {
    onClientUploadComplete: (res) => {
      if (res) {
        /**
         * Extract URLs from the upload response
         * UploadThing v7+ uses 'url' property (standard response format)
         * Legacy versions or certain configurations may use 'fileUrl'
         * We check both to ensure compatibility across versions
         */
        const newUrls = res.map((file) => {
          // Primary: UploadThing v7+ standard response format
          if ('url' in file && typeof file.url === 'string') {
            return file.url;
          }
          // Fallback: Legacy format or alternative configurations
          if ('fileUrl' in file && typeof file.fileUrl === 'string') {
            return file.fileUrl;
          }
          // If neither property exists, log error and skip
          console.error('Unexpected file response format from UploadThing:', file);
          return '';
        }).filter(Boolean);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(value, oldIndex, newIndex);
        onChange(newOrder);
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={value}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {value.map((url, index) => (
              <SortableImageItem
                key={url}
                url={url}
                index={index}
                onRemove={handleRemove}
                disabled={disabled || isUploading}
                isMain={index === 0}
              />
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
                  aria-label="Upload images"
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
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 shadow-lg">
              <Image
                src={activeId}
                alt="Dragging image"
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {value.length > 1 && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Mouse/Touch:</strong> Drag images by the grip handle to reorder
          </p>
          <p>
            <strong>Keyboard:</strong> Tab to focus an image, then use arrow keys to move it
          </p>
          <p className="text-xs">
            The first image will be used as the main product image
          </p>
        </div>
      )}
    </div>
  );
}