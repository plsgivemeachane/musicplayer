'use client'

import React from 'react';
import { FaMusic, FaSearch, FaPlus } from 'react-icons/fa';
import Link from 'next/link';

export default function NoSongsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <FaMusic className="mx-auto text-6xl text-blue-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Không tìm thấy bài nào cả</h1>
        <p className="text-neutral-400 mb-6">
          Chúng tôi không the thây bài nào cả. Hoặc có thế có lỗi trong dịch vụ nhạc.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/search"
            className="w-full inline-flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaSearch className="mr-2" /> Để tôi search lại
          </Link>
          
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center bg-neutral-800 text-neutral-300 py-3 px-6 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Về nhà
          </Link>
        </div>

        <div className="mt-8 text-sm text-neutral-500">
          <p>Lý do có thể xảy ra:</p>
          <ul className="list-disc list-inside text-left">
            <li>Dịch vụ tạm thời không khả dụng</li>
            <li>Sự cố kết nối mạng</li>
            <li>Truy vấn tìm kiếm không chính xác</li>
            <li>Giới hạn API tạm thời</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
