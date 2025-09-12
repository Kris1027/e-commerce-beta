'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { shippingAddressSchema } from '@/lib/validators';
import { saveShippingAddress } from '@/lib/actions/checkout-actions';
import { ArrowRight } from 'lucide-react';

type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;

interface ShippingAddressFormProps {
  userId?: string;
  userEmail?: string | null;
  defaultValues?: Partial<ShippingAddressFormData>;
}

export function ShippingAddressForm({ 
  defaultValues 
}: ShippingAddressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: defaultValues || {
      fullName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Poland',
      phone: '',
    },
  });

  const onSubmit = (data: ShippingAddressFormData) => {
    startTransition(async () => {
      const result = await saveShippingAddress(data);
      
      if (result.success) {
        toast.success('Shipping address saved successfully!');
        // Navigate immediately - toast will persist after navigation
        router.push('/checkout/payment');
      } else {
        toast.error(result.message || 'Failed to save address');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              {...register('fullName')}
              type="text"
              id="fullName"
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="John Doe"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium mb-2">
              Street Address
            </label>
            <input
              {...register('street')}
              type="text"
              id="street"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="ul. Marszałkowska 123"
            />
            {errors.street && (
              <p className="mt-1 text-sm text-destructive">{errors.street.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-2">
              City
            </label>
            <input
              {...register('city')}
              type="text"
              id="city"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Warsaw"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-2">
              Voivodeship
            </label>
            <input
              {...register('state')}
              type="text"
              id="state"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Mazowieckie"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
              Postal Code
            </label>
            <input
              {...register('zipCode')}
              type="text"
              id="zipCode"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="00-001"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-destructive">{errors.zipCode.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-2">
              Country
            </label>
            <div className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
              Poland
            </div>
            <input
              {...register('country')}
              type="hidden"
              value="Poland"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number (Optional)
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="+48 123 456 789"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-md border border-input px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer"
        >
          Back to Cart
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            'Saving...'
          ) : (
            <>
              Continue to Payment
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}