import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import qs from 'query-string';
import { CART_CONSTANTS, LOCALE } from '@/lib/constants/cart';
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Validate and normalize quantity for cart items
export function validateQuantity(value: number): number {
  if (isNaN(value) || value < 1) {
    return 1;
  }
  if (value > CART_CONSTANTS.MAX_QUANTITY_PER_ITEM) {
    return CART_CONSTANTS.MAX_QUANTITY_PER_ITEM;
  }
  return Math.floor(value); // Ensure integer quantity
}

// Convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

// Polish phone number format constants
const POLISH_PHONE_LENGTH_WITH_CODE = 11;
const POLISH_PHONE_LENGTH_WITHOUT_CODE = 9;
const POLISH_COUNTRY_CODE_PREFIX = '48';
const POLISH_COUNTRY_CODE_DISPLAY = '+48 ';

const PHONE_FORMATS = {
  WITH_COUNTRY_CODE: {
    length: POLISH_PHONE_LENGTH_WITH_CODE,
    prefix: POLISH_COUNTRY_CODE_PREFIX,
    pattern: /(\d{2})(\d{3})(\d{3})(\d{3})/,
    template: '+$1 $2-$3-$4'
  },
  WITHOUT_COUNTRY_CODE: {
    length: POLISH_PHONE_LENGTH_WITHOUT_CODE,
    pattern: /(\d{3})(\d{3})(\d{3})/,
    template: '$1-$2-$3',
    countryCode: POLISH_COUNTRY_CODE_DISPLAY
  }
} as const;

// Format Polish phone numbers safely
export function formatPhoneNumber(phone: string): string {
  // Handle empty, null, undefined, or whitespace-only strings
  if (!phone?.trim()) {
    return '';
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Only format if exactly 11 digits (Polish format with country code)
  if (digits.length === PHONE_FORMATS.WITH_COUNTRY_CODE.length && 
      digits.startsWith(PHONE_FORMATS.WITH_COUNTRY_CODE.prefix)) {
    return digits.replace(
      PHONE_FORMATS.WITH_COUNTRY_CODE.pattern, 
      PHONE_FORMATS.WITH_COUNTRY_CODE.template
    );
  }
  
  // Format 9-digit Polish numbers (without country code)
  if (digits.length === PHONE_FORMATS.WITHOUT_COUNTRY_CODE.length) {
    return PHONE_FORMATS.WITHOUT_COUNTRY_CODE.countryCode + 
           digits.replace(
             PHONE_FORMATS.WITHOUT_COUNTRY_CODE.pattern,
             PHONE_FORMATS.WITHOUT_COUNTRY_CODE.template
           );
  }
  
  // For invalid formats, return the original if it has some digits
  // This preserves user input for correction rather than losing it
  if (digits.length > 0) {
    return phone;
  }
  
  return '';
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === 'ZodError') {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map(
      (field) => error.errors[field].message
    );

    return fieldErrors.join('. ');
  } else if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}

// Round number to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error('Value is not a number or string');
  }
}

// Custom currency formatter that uses spaces for thousands and commas for decimals
// Example: 1 100,00 zł (standard Polish format)
function formatWithCustomSeparators(amount: number): string {
  // Split into integer and decimal parts
  const parts = amount.toFixed(2).split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1] || '00';

  // Add thousand separators (spaces) to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Combine with comma as decimal separator (Polish style)
  return `${formattedInteger},${decimalPart} zł`;
}

// Format small amounts as groszy (Polish cents)
// Example: 0,50 zł -> 50 gr, 0,01 zł -> 1 gr
function formatAsGroszy(amount: number): string {
  const groszy = Math.round(amount * 100);
  return `${groszy} gr`;
}

// Format currency with automatic groszy handling for amounts below 1 zł
// Uses spaces for thousands and commas for decimals: 1 100,00 zł
// Amounts below 1 zł are shown as groszy: 50 gr
export function formatCurrency(amount: number | string | null, forceZloty?: boolean) {
  // Default to false if not provided
  const shouldForceZloty = forceZloty ?? false;

  if (typeof amount === 'number') {
    // Format as groszy if amount is less than 1 zł and not forced to show złoty
    if (amount < 1 && amount > 0 && !shouldForceZloty) {
      return formatAsGroszy(amount);
    }
    return formatWithCustomSeparators(amount);
  } else if (typeof amount === 'string') {
    const numAmount = Number(amount);
    if (!isNaN(numAmount)) {
      // Format as groszy if amount is less than 1 zł and not forced to show złoty
      if (numAmount < 1 && numAmount > 0 && !shouldForceZloty) {
        return formatAsGroszy(numAmount);
      }
      return formatWithCustomSeparators(numAmount);
    }
    // Return default formatted value for invalid input
    return '0,00 zł';
  } else {
    // Return default formatted value for null/undefined
    return '0,00 zł';
  }
}

// Export separate groszy formatter for direct use when needed
export function formatGroszy(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? Number(amount) : amount;
  if (isNaN(numAmount)) return '0 gr';
  return formatAsGroszy(numAmount);
}

// Format Number
const NUMBER_FORMATTER = new Intl.NumberFormat(LOCALE);

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}

// Shorten UUID
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// Format order status for display
export function formatOrderStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Get order status color for badges
export function getOrderStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

// Check if an order is active (not delivered or cancelled)
export function isActiveOrder(status: string): boolean {
  const inactiveStatuses = ['delivered', 'cancelled'];
  return !inactiveStatuses.includes(status.toLowerCase());
}

// Format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: false, // use 24-hour clock for Polish locale
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: false, // use 24-hour clock for Polish locale
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    LOCALE,
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    LOCALE,
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    LOCALE,
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// Form the pagination links
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
    }
  );
}

// Generate pagination page numbers
export function generatePaginationNumbers(currentPage: number, totalPages: number): (number | string)[] {
  // Show all pages if 7 or fewer
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  // Show ellipsis if current page is far from start
  if (currentPage > 3) {
    pages.push('...');
  }

  // Show pages around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Show ellipsis if current page is far from end
  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  // Always show last page if more than 1 page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

// Convert slug to title case
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Build auth URL with optional callback URL parameter
export function buildAuthUrl(path: string, callbackUrl: string): string {
  // Only append callbackUrl if it's different from the default
  if (callbackUrl !== DEFAULT_AUTH_REDIRECT) {
    return `${path}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }

  return path;
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
