// Standardized action result types for consistent error handling

export type ActionResult<T = void> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };

export type ListResult<T> = 
  | { success: true; data: T[]; error?: never }
  | { success: false; data: T[]; error: string }; // Return empty array with error for backward compatibility

export type PaginatedResult<T> = 
  | { 
      success: true; 
      data: T[]; 
      currentPage: number;
      totalPages: number;
      total: number;
      hasMore: boolean;
      error?: never;
    }
  | { 
      success: false; 
      data: T[]; 
      currentPage: number;
      totalPages: number;
      total: number;
      hasMore: boolean;
      error: string;
    };

// Helper function to create error results
export function createErrorResult<T>(message: string): ActionResult<T> {
  return {
    success: false,
    error: message,
  };
}

export function createListErrorResult<T>(message: string): ListResult<T> {
  return {
    success: false,
    data: [],
    error: message,
  };
}

export function createPaginatedErrorResult<T>(
  message: string,
  page: number = 1
): PaginatedResult<T> {
  return {
    success: false,
    data: [],
    currentPage: page,
    totalPages: 0,
    total: 0,
    hasMore: false,
    error: message,
  };
}