'use client'

import { Home, Search, Library, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', icon: Home, label: 'Trang chủ' },
    { href: '/search', icon: Search, label: 'Tìm kiếm' },
    { href: '/library', icon: Library, label: 'Thư viện' },
  ];

  const handleCreatePlaylist = () => {
    const params = new URLSearchParams(window.location.search);
    const fromPlayer = params.get('from') === 'player';

    router.push(fromPlayer ? '/?from=player' : '/');
    
    setTimeout(() => {
      const event = new CustomEvent('createPlaylist');
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/5 z-50 pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              
              <span className={`text-[10px] font-medium ${
                isActive ? 'text-primary-400' : 'text-gray-500'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full"
                />
              )}
            </Link>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCreatePlaylist}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
        >
          <div className="p-2 rounded-xl bg-gray-800/50">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium text-gray-500">Tạo mới</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
