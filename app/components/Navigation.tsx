'use client'

import Link from 'next/link'
import { FaHome, FaMusic, FaHeart } from 'react-icons/fa'
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
        <Link href="/" className="flex flex-col items-center text-neutral-400 hover:text-white">
          <FaHome className="text-xl" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/library" className="flex flex-col items-center text-neutral-400 hover:text-white">
          <FaMusic className="text-xl" />
          <span className="text-xs mt-1">Library</span>
        </Link>
        <Link href="/playlist?playlistId=favorites" className="flex flex-col items-center text-neutral-400 hover:text-white">
          <FaHeart className="text-xl" />
          <span className="text-xs mt-1">Favorites</span>
        </Link>
        <div className="flex flex-col items-center text-neutral-400 hover:text-white">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex flex-col items-center">
                <FaHeart className="text-xl" />
                <span className="text-xs mt-1">Login</span>
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