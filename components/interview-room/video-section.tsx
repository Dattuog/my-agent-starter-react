// components/interview-room/video-section.tsx
'use client';

import { ReactNode } from 'react';

interface VideoSectionProps {
  children: ReactNode;
}

export function VideoSection({ children }: VideoSectionProps) {
  return (
    <div className="p-4">
      <div className="relative flex items-center justify-center bg-gradient-to-br from-[#0c7ff2] to-[#1e3a8a] bg-cover bg-center aspect-video rounded-lg overflow-hidden shadow-2xl">
        {/* Background overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Video content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 flex items-center gap-2 text-white/80">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">LIVE</span>
        </div>
        
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/80">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <span className="text-sm font-medium">HD</span>
        </div>
      </div>
    </div>
  );
}