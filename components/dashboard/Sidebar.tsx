'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, FileText, Share2, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Content', href: '/dashboard/content', icon: FileText },
    { label: 'Shared', href: '/dashboard/shared', icon: Share2 },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button - Hidden on larger screens */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onClose?.()}
          className="h-10 w-10"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/40 z-30"
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 w-64 h-screen bg-card border-r border-border z-40 md:relative md:translate-x-0 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center group-hover:shadow-lg transition-shadow">
                    <span className="text-primary-foreground font-bold">B</span>
                  </div>
                  <div className="flex-1">
                    <h1 className="font-bold text-lg">Brainly</h1>
                    <p className="text-xs text-muted-foreground">{user?.username || user?.email}</p>
                  </div>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose?.()}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors group"
                    >
                      <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 space-y-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
