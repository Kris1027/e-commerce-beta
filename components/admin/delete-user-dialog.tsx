'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface DeleteUserDialogProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    ordersCount: number;
  };
  onDelete: (userId: string) => void;
  isDeleting: boolean;
}

export function DeleteUserDialog({ user, onDelete, isDeleting }: DeleteUserDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          disabled={isDeleting}
          onSelect={(e) => e.preventDefault()}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Are you sure you want to delete this user?</p>
              <div className="bg-muted p-3 rounded-md space-y-1">
                <div className="font-medium">{user.name || 'Anonymous'}</div>
                <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                <div className="text-sm text-muted-foreground">ID: {user.id}</div>
              </div>
              <p className="text-sm text-destructive font-medium">
                This action cannot be undone. All user data including wishlists and order history will be permanently deleted.
              </p>
              {user.ordersCount > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  This user has {user.ordersCount} order(s). Make sure all active orders are completed or cancelled before deletion.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onDelete(user.id)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}