import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
    i === 1 ||
    i === totalPages ||
    i >= currentPage - 1 && i <= currentPage + 1)
    {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-text-secondary">
        Showing {startItem}-{endItem} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-border-color rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          
          <ChevronLeft size={16} />
        </button>
        {pages.map((page, index) =>
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-2 border rounded text-sm ${page === currentPage ? 'bg-accent text-white border-accent' : 'border-border-color hover:bg-gray-50'} ${page === '...' ? 'cursor-default' : ''}`}>
          
            {page}
          </button>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-border-color rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          
          <ChevronRight size={16} />
        </button>
      </div>
    </div>);

}