'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UpdateUserForm } from './update-user-form';
import { Edit2, Crown, User as UserIcon } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UpdateUserModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UpdateUserModal({ user, trigger, onSuccess }: UpdateUserModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
    >
      <Edit2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                Edit User
                {user.role === UserRole.admin && (
                  <Badge variant="destructive" className="ml-2">
                    <Crown className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Update user information and permissions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current User Info Display */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <UserIcon className="h-3 w-3" />
            Current Information
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role:</span>
              <Badge
                variant={user.role === UserRole.admin ? 'destructive' : 'default'}
                className="h-5"
              >
                {user.role === UserRole.admin ? (
                  <>
                    <Crown className="mr-1 h-3 w-3" />
                    Admin
                  </>
                ) : (
                  'User'
                )}
              </Badge>
            </div>
          </div>
        </div>

        <UpdateUserForm
          user={user}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}