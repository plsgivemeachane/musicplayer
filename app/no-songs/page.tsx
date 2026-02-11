'use client'

import React from 'react';
import { FaMusic, FaSearch, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NoSongsPage() {
	return (
		<div className="min-h-screen bg-carbon text-snow flex flex-col items-center justify-center p-4 text-center">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="max-w-md"
			>
				{/* Icon */}
				<div className="w-20 h-20 rounded-full bg-slate flex items-center justify-center mx-auto mb-6">
					<FaExclamationTriangle size={32} className="text-ash" />
				</div>

				{/* Title */}
				<h1 className="font-serif text-3xl text-snow mb-4">
					Không tìm thấy bài hát
				</h1>

				{/* Description */}
				<p className="font-sans text-ash mb-8">
					Chúng tôi không thể tìm thấy bài nào. Có thể có lỗi trong dịch vụ nhạc hoặc kết nối mạng.
				</p>

				{/* Actions */}
				<div className="space-y-3">
					<motion.div whileTap={{ scale: 0.98 }}>
						<Link 
							href="/search"
							className="w-full inline-flex items-center justify-center gap-2
								bg-gradient-glow text-void font-sans font-medium
								py-3 px-6 rounded-lg shadow-glow-sm hover:shadow-glow-md
								transition-shadow duration-200"
						>
							<FaSearch size={14} />
							Tìm kiếm lại
						</Link>
					</motion.div>

					<motion.div whileTap={{ scale: 0.98 }}>
						<Link 
							href="/"
							className="w-full inline-flex items-center justify-center gap-2
								bg-concrete text-silver border border-iron
								py-3 px-6 rounded-lg
								hover:border-emerald hover:text-snow
								transition-all duration-200"
						>
							<FaHome size={14} />
							Về trang chủ
						</Link>
					</motion.div>
				</div>

				{/* Possible reasons */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="mt-10 p-4 bg-concrete rounded-lg border border-iron text-left"
				>
					<p className="font-sans text-xs text-ash uppercase tracking-wider mb-3">
						Lý do có thể:
					</p>
					<ul className="font-sans text-sm text-silver space-y-2">
						<li className="flex items-start gap-2">
							<span className="text-emerald mt-1">•</span>
							<span>Dịch vụ tạm thời không khả dụng</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-emerald mt-1">•</span>
							<span>Sự cố kết nối mạng</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-emerald mt-1">•</span>
							<span>Truy vấn tìm kiếm không chính xác</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-emerald mt-1">•</span>
							<span>Giới hạn API tạm thời</span>
						</li>
					</ul>
				</motion.div>
			</motion.div>
		</div>
	);
}
