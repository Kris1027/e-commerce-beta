'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, CreditCard, Wallet } from 'lucide-react';
import { savePaymentMethod } from '@/lib/actions/checkout-actions';

interface PaymentMethodFormProps {
  initialPaymentMethod: string;
}

const paymentMethods = [
  {
    id: 'cashOnDelivery',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: Truck,
    available: true,
  },
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    description: 'Secure payment with Stripe',
    icon: CreditCard,
    available: false,
    comingSoon: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Fast and secure payment',
    icon: Wallet,
    available: false,
    comingSoon: true,
  },
];

export default function PaymentMethodForm({ initialPaymentMethod }: PaymentMethodFormProps) {
  const [selectedMethod, setSelectedMethod] = useState(initialPaymentMethod);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await savePaymentMethod(selectedMethod);
      
      if (result.success) {
        toast.success('Payment method saved');
        router.push('/checkout/review');
      } else {
        toast.error(result.message || 'Failed to save payment method');
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>
          Choose how you want to pay for your order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup 
            value={selectedMethod} 
            onValueChange={setSelectedMethod}
            className="space-y-3"
          >
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={`relative rounded-lg border p-4 ${
                    !method.available ? 'opacity-60' : 'cursor-pointer hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={method.id} 
                      id={method.id}
                      disabled={!method.available}
                      className="mt-1"
                    />
                    <Label 
                      htmlFor={method.id} 
                      className={`flex-1 ${method.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{method.name}</span>
                            {method.comingSoon && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
          
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/checkout/shipping')}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Continue to Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}