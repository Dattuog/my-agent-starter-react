// components/interview-room/interview-header.tsx
'use client';

import Link from 'next/link';

interface InterviewHeaderProps {
  participantName: string;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function InterviewHeader({ participantName, onMenuToggle, isMobileMenuOpen }: InterviewHeaderProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#223649] px-4 lg:px-10 py-3">
      <div className="flex items-center gap-2 text-white min-w-[180px] pr-6">
        <div className="size-6 flex items-center justify-center">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-white text-xl font-bold leading-tight tracking-[-0.015em] whitespace-nowrap align-middle">InterviewAI</span>
      </div>
      
      <div className="flex flex-1 justify-end items-center gap-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-9">
            <Link href="/dashboard" className="text-white text-sm font-medium leading-normal hover:text-gray-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/interviews" className="text-white text-sm font-medium leading-normal hover:text-gray-300 transition-colors">
              Interviews
            </Link>
            <Link href="/settings" className="text-white text-sm font-medium leading-normal hover:text-gray-300 transition-colors">
              Settings
            </Link>
          </nav>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-white hover:text-gray-300 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 lg:size-10 ring-2 ring-white/20"
            style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format")`
            }}
          />
          <span className="hidden sm:block text-white text-sm font-medium">{participantName}</span>
        </div>
      </div>
    </header>
  );
}