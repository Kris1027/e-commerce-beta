'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { generatePaginationNumbers, cn } from '@/lib/utils';

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
  showFirstLast?: boolean;
  preserveParams?: boolean;
  totalItems?: number;
  showPageInfo?: boolean;
}

export function PaginationWrapper({
  currentPage,
  totalPages,
  baseUrl,
  className,
  showFirstLast = false,
  preserveParams = false,
  totalItems,
  showPageInfo = false,
}: PaginationWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePaginationNumbers(currentPage, totalPages);

  const buildUrl = (page: number) => {
    if (preserveParams) {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      return `${baseUrl}?${params.toString()}`;
    }
    return `${baseUrl}?page=${page}`;
  };

  const handlePageClick = (page: number) => {
    router.push(buildUrl(page));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showPageInfo && totalItems && (
        <div className="text-sm text-muted-foreground text-center">
          Page {currentPage} of {totalPages} ({totalItems} total items)
        </div>
      )}
      <Pagination>
        <PaginationContent>
          {showFirstLast && (
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageClick(1)}
                disabled={currentPage === 1}
                className="h-9 w-9 cursor-pointer"
                aria-label="Go to first page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}

          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageClick(currentPage - 1)}
                href={buildUrl(currentPage - 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {pages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <PaginationItem key={`ellipsis-between-${pages[index-1]}-and-${pages[index+1]}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => handlePageClick(page)}
                  href={buildUrl(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageClick(currentPage + 1)}
                href={buildUrl(currentPage + 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {showFirstLast && (
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageClick(totalPages)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 cursor-pointer"
                aria-label="Go to last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}