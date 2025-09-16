import { ORDER_STATUS } from '@/lib/validators';
import { Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

// Type-safe status configurations using ORDER_STATUS constants
export type OrderStatusKey = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Status color mappings
export const statusColors: Record<OrderStatusKey, string> = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [ORDER_STATUS.PROCESSING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [ORDER_STATUS.SHIPPED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Status icon mappings
export const statusIcons: Record<OrderStatusKey, typeof Clock> = {
  [ORDER_STATUS.PENDING]: Clock,
  [ORDER_STATUS.PROCESSING]: Package,
  [ORDER_STATUS.SHIPPED]: Truck,
  [ORDER_STATUS.DELIVERED]: CheckCircle2,
  [ORDER_STATUS.CANCELLED]: XCircle,
};

/**
 * Get the appropriate status icon for an order status
 * @param status - The order status string
 * @returns The corresponding Lucide icon component
 */
export function getStatusIcon(status: string): typeof Clock {
  const normalizedStatus = status.toLowerCase() as OrderStatusKey;
  return statusIcons[normalizedStatus] || Clock;
}

/**
 * Get the appropriate status color classes for an order status
 * @param status - The order status string
 * @returns The corresponding Tailwind CSS classes
 */
export function getStatusColor(status: string): string {
  const normalizedStatus = status.toLowerCase() as OrderStatusKey;
  return statusColors[normalizedStatus] || statusColors[ORDER_STATUS.PENDING];
}

/**
 * Get the display name for an order status
 * @param status - The order status string
 * @returns The formatted display name
 */
export function getStatusDisplayName(status: string): string {
  const normalizedStatus = status.toLowerCase();
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
}

/**
 * Check if a status is valid
 * @param status - The status to check
 * @returns Whether the status is valid
 */
export function isValidOrderStatus(status: string): status is OrderStatusKey {
  const normalizedStatus = status.toLowerCase();
  return Object.values(ORDER_STATUS).includes(normalizedStatus as OrderStatusKey);
}