'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalCount, pageSize, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const [inputPage, setInputPage] = useState(String(currentPage));

    useEffect(() => {
        setInputPage(String(currentPage));
    }, [currentPage]);

    if (totalPages <= 1) return null;

    const handleJump = (e: React.FormEvent) => {
        e.preventDefault();
        const page = parseInt(inputPage);
        if (isNaN(page) || page < 1 || page > totalPages) {
            toast.error(`请输入有效的页码 (1-${totalPages})`);
            return;
        }
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mt-8 mb-8">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition text-sm font-medium"
            >
                上一页
            </button>

            <span className="text-gray-500 font-medium text-xs sm:text-sm">
                第 {currentPage} 页 / 共 {totalPages} 页
            </span>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition text-sm font-medium"
            >
                下一页
            </button>

            <form onSubmit={handleJump} className="flex items-center gap-2 ml-2 sm:ml-4">
                <span className="text-xs text-gray-400">跳至</span>
                <input
                    type="text"
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    className="w-10 sm:w-12 px-1 py-1 text-center border border-gray-200 rounded text-sm focus:outline-none focus:border-bamguet-dark transition-colors"
                />
                <button
                    type="submit"
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                >
                    Go
                </button>
            </form>
        </div>
    );
}
