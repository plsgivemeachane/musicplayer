'use client'

import Link from 'next/link'
import { FaHome, FaMusic, FaHeart, FaUser } from 'react-icons/fa'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { pb } from './Pcketbase'
import { SendOptions } from 'pocketbase'

export default function Navigation() {

  pb.beforeSend = ((url: string, options: SendOptions) => {
    return {
      ...options,
      headers: {
        ...options.headers,
        'x-token': 'Sample token'
      }
    }
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-neutral-800 z-[1000]">
      <div className="flex justify-between items-center px-6 py-3">
        <Link prefetch={true} href="/" className="flex flex-col items-center text-neutral-400 hover:text-white">
          <FaHome className="text-xl" />
          <span className="text-xs mt-1">Nhà</span>
        </Link>
        <Link prefetch={true} href="/library" className="flex flex-col items-center text-neutral-400 hover:text-white">
          <FaMusic className="text-xl" />
          <span className="text-xs mt-1">Thư viện</span>
        </Link>
        <Link prefetch={true} href="/playlist?playlistId=favorites" className="flex flex-col items-center text-neutral-400 hover:text-white">
          <FaHeart className="text-xl" />
          <span className="text-xs mt-1">Yêu thích</span>
        </Link>
        <div className="flex flex-col items-center text-neutral-400 hover:text-white">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex flex-col items-center">
                <FaUser className="text-xl" />
                <span className="text-xs mt-1">Đăng nhập</span>
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}
