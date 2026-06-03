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
          className="px-4 py-2 bg-transparent border border-cyan-500/20 rounded-[10px] text-gray-300 hover:text-white hover:border-cyan-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 ease-out"
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
                className={`w-10 h-10 rounded-[10px] font-medium transition-all duration-300 ease-out hover:scale-105 ${
                  currentPage === pageNum
                    ? "bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-transparent border border-cyan-500/20 text-gray-300 hover:text-white hover:border-cyan-500/40"
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
          className="px-4 py-2 bg-transparent border border-cyan-500/20 rounded-[10px] text-gray-300 hover:text-white hover:border-cyan-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 ease-out"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-gray-300 text-sm mt-4">
        {totalCount} aventures • Page {currentPage}/{totalPages}
      </p>
    </>
  );
}
