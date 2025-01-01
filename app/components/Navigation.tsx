'use client'

import Link from 'next/link'
import { FaHome, FaMusic, FaHeart, FaUser } from 'react-icons/fa'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { SendOptions } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { useEffect } from 'react'

export default function Navigation() {

  const { isLoaded, isSignedIn ,user } = useUser()



  pb.beforeSend = ((url: string, options: SendOptions) => {
    return {
      ...options,
      headers: {
        ...options.headers,
        'x-token': 'Sample token'
      }
    }
  })

  // get playlists of user
  const getUserPlaylists = async () => {
    if(!isLoaded || !isSignedIn) return
    const query = `userID="${user.id}"`
    console.log(query)
    try {  
      const userPlaylists = await pb.collection('playlists').getFirstListItem(query)
      return userPlaylists
    } catch(e: any) {
      console.log(await e)
      console.log("No records found! create 1")
      try {
        if(!localStorage.getItem('playlists')) return;
        const data = {
          "userID": user.id,
          "Storages": localStorage.getItem('playlists')
        };

        console.log(data)
        // Create
        const record = await pb.collection('playlists').create(data);
        return record
        console.log("Success",record)
      } finally {
        console.log("Done")
      }
    }

  }

  useEffect(() => {
    const syncUserPlaylists = async () => {
      if (!isSignedIn) return;
      
      try {
        const userPlaylists = await getUserPlaylists();
        if(!userPlaylists) return
        // Update client
        console.log(userPlaylists.Storages)

        localStorage.setItem('playlists', JSON.stringify(userPlaylists.Storages));

        // console.log('User Playlists:', userPlaylists);

        // // Sync local storage to server
        // if (localStorage.getItem('playlists')) {
        //   const data = {
        //     "userID": user.id,
        //     "Storages": localStorage.getItem('playlists')
        //   };
          

        //   const record = await pb.collection('playlists').update(userPlaylists.id, data);
        //   console.log("Updated",record)
        // }
      } catch (error) {
        console.error('Error syncing playlists:', error);
      }
    };

    syncUserPlaylists();
  }, [isSignedIn, user?.id])

  if(!isLoaded) return

  
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
