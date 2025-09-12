'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { shippingAddressSchema } from '@/lib/validators';
import { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from '@/lib/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { formatPhoneNumber } from '@/lib/utils';
import { 
  Loader2, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Home, 
  Briefcase, 
  Star,
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Extended schema with label
const addressFormSchema = shippingAddressSchema.extend({
  phone: z.string().min(6, 'Phone number must be at least 6 characters'),
  label: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface Address {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  label?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AddressManagerProps {
  userName: string;
  onSelectAddress?: (address: Address) => void;
  selectionMode?: boolean;
}

export default function AddressManager({ userName, onSelectAddress, selectionMode = false }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: userName || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Poland',
      phone: '',
      label: 'home',
    },
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await getUserAddresses();
      setAddresses(data as Address[]);
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      let result;
      if (editingAddress) {
        result = await updateAddress(editingAddress.id, data);
      } else {
        result = await addAddress(data);
      }

      if (result.success) {
        toast.success(result.message);
        setIsDialogOpen(false);
        setEditingAddress(null);
        form.reset();
        loadAddresses();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    form.reset({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      label: address.label || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteAddress(id);
      if (result.success) {
        toast.success(result.message);
        loadAddresses();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to delete address');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      const result = await setDefaultAddress(id);
      if (result.success) {
        toast.success(result.message);
        loadAddresses();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to set default address');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const getLabelIcon = (label?: string | null) => {
    switch (label?.toLowerCase()) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Shipping Addresses</h3>
          <p className="text-sm text-muted-foreground">
            Manage your shipping addresses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingAddress(null);
                form.reset({
                  fullName: userName || '',
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: 'Poland',
                  phone: '',
                  label: 'home',
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
              <DialogDescription>
                {editingAddress 
                  ? 'Update your shipping address details' 
                  : 'Add a new shipping address to your account'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Select
                    value={form.watch('label')}
                    onValueChange={(value) => form.setValue('label', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a label" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...form.register('fullName')}
                    placeholder="Recipient's full name"
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  {...form.register('street')}
                  placeholder="ul. Marszałkowska 123"
                />
                {form.formState.errors.street && (
                  <p className="text-sm text-red-500">{form.formState.errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    placeholder="Warsaw"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">Voivodeship</Label>
                  <Input
                    id="state"
                    {...form.register('state')}
                    placeholder="Mazowieckie"
                  />
                  {form.formState.errors.state && (
                    <p className="text-sm text-red-500">{form.formState.errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Postal Code</Label>
                  <Input
                    id="zipCode"
                    {...form.register('zipCode')}
                    placeholder="00-001"
                  />
                  {form.formState.errors.zipCode && (
                    <p className="text-sm text-red-500">{form.formState.errors.zipCode.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value="Poland"
                    disabled
                    className="bg-muted"
                  />
                  <Input
                    type="hidden"
                    {...form.register('country')}
                    value="Poland"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register('phone')}
                  placeholder="+48 123 456 789"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingAddress(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAddress ? 'Update' : 'Add'} Address
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No addresses added yet</p>
            <Button 
              onClick={() => {
                setEditingAddress(null);
                form.reset({
                  fullName: userName || '',
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: 'Poland',
                  phone: '',
                  label: 'home',
                });
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getLabelIcon(address.label)}
                    <CardTitle className="text-base">
                      {address.label ? 
                        address.label.charAt(0).toUpperCase() + address.label.slice(1) : 
                        'Address'}
                    </CardTitle>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={deletingId === address.id}
                        >
                          {deletingId === address.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(address.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{address.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {address.street}<br />
                  {address.city}, {address.state} {address.zipCode}<br />
                  {address.country}
                </p>
                {address.phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {formatPhoneNumber(address.phone)}
                  </p>
                )}
                {selectionMode ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => onSelectAddress?.(address)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Use This Address
                  </Button>
                ) : (
                  !address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleSetDefault(address.id)}
                      disabled={settingDefaultId === address.id}
                    >
                      {settingDefaultId === address.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Set as Default
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}