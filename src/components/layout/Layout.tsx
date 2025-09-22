import React, { ReactNode, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';

// Clerk imports
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Optionally, remove this check if Clerk handles auth gating
  if (!profile) {
    return <div>{children}</div>;
  }

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Clerk Auth Header */}
        <header className="flex justify-end items-center p-4 gap-4 h-16">
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <Navigation />
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-40 flex">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
                <Navigation mobile onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 pb-20 lg:pb-8">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNavigation />
      </div>
    </ClerkProvider>
  )