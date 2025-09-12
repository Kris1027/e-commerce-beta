import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
  activeStep: number;
}

const steps = [
  { name: 'Shipping', href: '/checkout/shipping' },
  { name: 'Payment', href: '/checkout/payment' },
  { name: 'Review', href: '/checkout/review' },
];

export default function CheckoutSteps({ activeStep }: CheckoutStepsProps) {
  const currentStepIndex = activeStep;

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center space-x-4 sm:space-x-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <li key={step.name} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium',
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'ml-2 text-sm font-medium',
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'ml-2 hidden h-0.5 w-8 sm:inline-block',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}