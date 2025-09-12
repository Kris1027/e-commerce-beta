'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveShippingAddress } from '@/lib/actions/checkout-actions';
import AddressManager from '@/components/profile/address-manager';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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

interface CheckoutAddressSelectorProps {
  userName: string;
}

export default function CheckoutAddressSelector({ userName }: CheckoutAddressSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    
    // Automatically proceed with the selected address
    startTransition(async () => {
      const result = await saveShippingAddress({
        fullName: address.fullName,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      });
      
      if (result.success) {
        toast.success('Shipping address saved!');
        router.push('/checkout/payment');
      } else {
        toast.error(result.message || 'Failed to save address');
        setSelectedAddress(null);
      }
    });
  };

  if (isPending && selectedAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Saving shipping address...</p>
        <div className="text-sm text-center text-muted-foreground">
          <p className="font-medium">{selectedAddress.fullName}</p>
          <p>{selectedAddress.street}</p>
          <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
          <p>{selectedAddress.country}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AddressManager 
        userName={userName} 
        onSelectAddress={handleAddressSelect}
        selectionMode={true}
      />
      
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Cart
        </Button>
        <div className="text-sm text-muted-foreground">
          Select or add an address to continue
        </div>
      </div>
    </div>
  );
}