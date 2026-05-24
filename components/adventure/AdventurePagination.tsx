"use client";

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
          className="px-4 py-2 bg-[#141d2e] border border-gray-700 rounded-lg text-gray-400 hover:bg-[#141d2e]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
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
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === pageNum
                    ? "bg-cyan-500 text-white"
                    : "bg-[#141d2e] border border-gray-700 text-gray-400 hover:bg-[#141d2e]/80"
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
          className="px-4 py-2 bg-[#141d2e] border border-gray-700 rounded-lg text-gray-400 hover:bg-[#141d2e]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">
        {totalCount} aventures • Page {currentPage}/{totalPages}
      </p>
    </>
  );
}
