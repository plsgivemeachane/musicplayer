'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaHome, FaMusic, FaHeart, FaUser } from 'react-icons/fa'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { SendOptions } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navigation() {
	const { isLoaded, isSignedIn, user } = useUser()
	const pathname = usePathname()

	pb.beforeSend = ((url: string, options: SendOptions) => {
		return {
			...options,
			headers: {
				...options.headers,
				'x-token': 'Sample token'
			}
		}
	})

	const getUserPlaylists = async () => {
		if (!isLoaded || !isSignedIn) return
		const query = `userID="${user.id}"`
		try {
			const userPlaylists = await pb.collection('playlists').getFirstListItem(query)
			return userPlaylists
		} catch (e: any) {
			console.log("No records found! Creating...")
			try {
				if (!localStorage.getItem('playlists')) return
				const data = {
					"userID": user.id,
					"Storages": localStorage.getItem('playlists')
				}
				const record = await pb.collection('playlists').create(data)
				return record
			} finally {
				console.log("Done")
			}
		}
	}

	useEffect(() => {
		const syncUserPlaylists = async () => {
			if (!isSignedIn) return
			try {
				const userPlaylists = await getUserPlaylists()
				if (!userPlaylists) return
				localStorage.setItem('playlists', JSON.stringify(userPlaylists.Storages))
			} catch (error) {
				console.error('Error syncing playlists:', error)
			}
		}
		syncUserPlaylists()
	}, [isSignedIn, user?.id])

	if (!isLoaded) return null

	const navItems = [
		{ href: '/', icon: FaHome, label: 'Nhà', isActive: pathname === '/' },
		{ href: '/library', icon: FaMusic, label: 'Thư viện', isActive: pathname === '/library' },
		{ href: '/playlist?playlistId=favorites', icon: FaHeart, label: 'Yêu thích', isActive: pathname === '/playlist' },
	]

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-[1000] pb-safe">
			<div className="glass border-t border-iron">
				<div className="flex justify-around items-center px-4 py-3 max-w-md mx-auto">
					{navItems.map((item) => (
						<Link
							key={item.href}
							prefetch={true}
							href={item.href}
							className="relative flex flex-col items-center gap-1 group"
						>
							<motion.div
								whileTap={{ scale: 0.95 }}
								className="relative"
							>
								<item.icon 
									className={`text-xl transition-colors duration-200 ${
										item.isActive 
											? 'text-mint' 
											: 'text-ash group-hover:text-silver'
									}`}
								/>
								{item.isActive && (
									<motion.div
										layoutId="nav-indicator"
										className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mint"
										transition={{ type: 'spring', stiffness: 500, damping: 30 }}
									/>
								)}
							</motion.div>
							<span className={`text-xs font-sans transition-colors duration-200 ${
								item.isActive 
									? 'text-mint' 
									: 'text-ash group-hover:text-silver'
							}`}>
								{item.label}
							</span>
						</Link>
					))}
					
					<div className="flex flex-col items-center gap-1 group">
						<SignedOut>
							<SignInButton mode="modal">
								<button className="flex flex-col items-center gap-1">
									<motion.div whileTap={{ scale: 0.95 }}>
										<FaUser className="text-xl text-ash group-hover:text-silver transition-colors duration-200" />
									</motion.div>
									<span className="text-xs font-sans text-ash group-hover:text-silver transition-colors duration-200">
										Đăng nhập
									</span>
								</button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<motion.div whileTap={{ scale: 0.95 }} className="flex flex-col items-center gap-1">
								<UserButton 
									appearance={{
										elements: {
											userButtonTrigger: "focus:outline-none",
											userButtonAvatarBox: "w-5 h-5",
										}
									}}
								/>
								<span className="text-xs font-sans text-ash">Tài khoản</span>
							</motion.div>
						</SignedIn>
					</div>
				</div>
			</div>
		</nav>
	)
}
