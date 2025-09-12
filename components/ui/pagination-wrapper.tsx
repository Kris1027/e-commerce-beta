'use client';

import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { generatePaginationNumbers } from '@/lib/utils';

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export default function PaginationWrapper({
  currentPage,
  totalPages,
  baseUrl,
  className,
}: PaginationWrapperProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePaginationNumbers(currentPage, totalPages);

  return (
    <Pagination className={className}>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <Link href={`${baseUrl}?page=${currentPage - 1}`}>
              <PaginationPrevious />
            </Link>
          </PaginationItem>
        )}

        {pages.map((page, index) => {
          if (typeof page === 'string') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <Link href={`${baseUrl}?page=${page}`}>
                <PaginationLink isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </Link>
            </PaginationItem>
          );
        })}

        {currentPage < totalPages && (
          <PaginationItem>
            <Link href={`${baseUrl}?page=${currentPage + 1}`}>
              <PaginationNext />
            </Link>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}