'use client'

import React from 'react';
import { FaMusic, FaSearch, FaPlus } from 'react-icons/fa';
import Link from 'next/link';

export default function NoSongsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md">
        <FaMusic className="mx-auto text-6xl text-blue-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">No Songs Found</h1>
        <p className="text-neutral-400 mb-6">
          We couldn't find any songs matching your search or there might be an issue with the music service.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/search"
            className="w-full inline-flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaSearch className="mr-2" /> Try Another Search
          </Link>
          
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center bg-neutral-800 text-neutral-300 py-3 px-6 rounded-lg hover:bg-neutral-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-neutral-500">
          <p>Possible reasons:</p>
          <ul className="list-disc list-inside text-left">
            <li>Service temporarily unavailable</li>
            <li>Network connection issues</li>
            <li>Incorrect search query</li>
            <li>Temporary API limitations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
