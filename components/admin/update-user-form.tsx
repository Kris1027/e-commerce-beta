'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminUpdateUserSchema, AdminUpdateUserInput } from '@/lib/validators';
import { updateUserAsAdmin } from '@/lib/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, User, Mail, Shield } from 'lucide-react';
import { UserRole } from '@prisma/client';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface UpdateUserFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UpdateUserForm({ user, onSuccess, onCancel }: UpdateUserFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AdminUpdateUserInput>({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  const onSubmit = (data: AdminUpdateUserInput) => {
    startTransition(async () => {
      const result = await updateUserAsAdmin(user.id, data);

      if (result.success) {
        toast.success('User updated successfully');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to update user');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Full Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter user's full name"
                  disabled={isPending}
                  className="h-10"
                />
              </FormControl>
              <FormDescription className="text-xs">
                {"The user's display name across the platform"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="user@example.com"
                  disabled={isPending}
                  className="h-10"
                />
              </FormControl>
              <FormDescription className="text-xs">
                The email used for authentication and communication
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role Field */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                User Role
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UserRole.user}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>User</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Standard customer access
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value={UserRole.admin}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span>Admin</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Full system access
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                Admin users can access the admin panel and manage the system
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update User'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}