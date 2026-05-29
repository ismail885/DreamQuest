"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdventurePaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function AdventurePagination({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: AdventurePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <>
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px] text-gray-400 hover:text-white hover:border-[rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 rounded-[10px] font-medium transition-all duration-200 ${
                  currentPage === pageNum
                    ? "bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white"
                    : "bg-transparent border border-[rgba(6,182,212,0.2)] text-gray-400 hover:text-white hover:border-[rgba(6,182,212,0.4)]"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-transparent border border-[rgba(6,182,212,0.2)] rounded-[10px] text-gray-400 hover:text-white hover:border-[rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        {totalCount} aventures • Page {currentPage}/{totalPages}
      </p>
    </>
  );
}
