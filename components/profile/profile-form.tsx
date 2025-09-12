'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { shippingAddressSchema } from '@/lib/validators';
import { updateProfile } from '@/lib/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, User, Mail, Lock, Phone, MapPin, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(6, 'Phone number must be at least 6 characters').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val),
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Use existing shippingAddressSchema directly
const addressSchema = shippingAddressSchema;

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

interface UserData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  address: unknown;
  paymentMethod?: string | null;
  createdAt?: Date;
}

interface ProfileFormProps {
  user: UserData;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const userAddress = user.address as { 
    street?: string; 
    city?: string; 
    state?: string; 
    zipCode?: string; 
    country?: string; 
    phone?: string;
  } | null;
  
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      phone: userAddress?.phone || '',
    },
  });
  
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user.name || '',
      street: userAddress?.street || '',
      city: userAddress?.city || '',
      state: userAddress?.state || '',
      zipCode: userAddress?.zipCode || '',
      country: userAddress?.country || '',
      phone: userAddress?.phone || '',
    },
  });
  
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const result = await updateProfile({
        name: data.name || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
      });
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await updateProfile({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      
      if (result.success) {
        toast.success(result.message);
        passwordForm.reset();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onAddressSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    try {
      const result = await updateProfile({
        address: data,
      });
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to update address');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="address">Address</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your basic account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline-block h-4 w-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  {...profileForm.register('name')}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline-block h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...profileForm.register('email')}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {profileForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline-block h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...profileForm.register('phone')}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
                {profileForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">{profileForm.formState.errors.phone.message}</p>
                )}
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  <Lock className="inline-block h-4 w-4 mr-2" />
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register('currentPassword')}
                  placeholder="Enter your current password"
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  <Lock className="inline-block h-4 w-4 mr-2" />
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register('newPassword')}
                  placeholder="Enter your new password"
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  <Lock className="inline-block h-4 w-4 mr-2" />
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="address" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
            <CardDescription>
              Manage your default shipping address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="inline-block h-4 w-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  {...addressForm.register('fullName')}
                  placeholder="Enter recipient's full name"
                  disabled={isLoading}
                />
                {addressForm.formState.errors.fullName && (
                  <p className="text-sm text-red-500">{addressForm.formState.errors.fullName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="street">
                  <MapPin className="inline-block h-4 w-4 mr-2" />
                  Street Address
                </Label>
                <Input
                  id="street"
                  {...addressForm.register('street')}
                  placeholder="Enter your street address"
                  disabled={isLoading}
                />
                {addressForm.formState.errors.street && (
                  <p className="text-sm text-red-500">{addressForm.formState.errors.street.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...addressForm.register('city')}
                    placeholder="City"
                    disabled={isLoading}
                  />
                  {addressForm.formState.errors.city && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.city.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...addressForm.register('state')}
                    placeholder="State"
                    disabled={isLoading}
                  />
                  {addressForm.formState.errors.state && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.state.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    {...addressForm.register('zipCode')}
                    placeholder="Zip Code"
                    disabled={isLoading}
                  />
                  {addressForm.formState.errors.zipCode && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.zipCode.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...addressForm.register('country')}
                    placeholder="Country"
                    disabled={isLoading}
                  />
                  {addressForm.formState.errors.country && (
                    <p className="text-sm text-red-500">{addressForm.formState.errors.country.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="addressPhone">
                  <Phone className="inline-block h-4 w-4 mr-2" />
                  Phone Number (Optional)
                </Label>
                <Input
                  id="addressPhone"
                  type="tel"
                  {...addressForm.register('phone')}
                  placeholder="Enter phone number"
                  disabled={isLoading}
                />
                {addressForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">{addressForm.formState.errors.phone.message}</p>
                )}
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                Save Address
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}