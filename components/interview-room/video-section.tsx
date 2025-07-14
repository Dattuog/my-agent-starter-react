// components/interview-room/video-section.tsx
'use client';

import { ReactNode } from 'react';

interface VideoSectionProps {
  children: ReactNode;
  chatOpen?: boolean;
}

export function VideoSection({ children, chatOpen = false }: VideoSectionProps) {
  return (
    <div className="w-full h-full">
      <div className="relative flex items-center justify-center bg-[#1a1d21] rounded-xl overflow-hidden shadow-2xl min-h-[400px] max-h-[75vh] transition-all duration-300">
        {/* Background overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1d21] to-[#23272e]" />
        
        {/* Video content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
          {children}
        </div>
        
        {/* Status indicators */}
        <div className="absolute top-4 left-4 flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">LIVE</span>
          </div>
          
          {/* Recording indicator (if needed) */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-white text-sm font-medium">REC</span>
          </div>
        </div>
        
        {/* Quality indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <span className="text-white text-sm font-medium">HD</span>
        </div>
        
        {/* Network quality indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
          <div className="flex items-center gap-1">
            <div className="w-1 h-2 bg-green-500 rounded-full" />
            <div className="w-1 h-3 bg-green-500 rounded-full" />
            <div className="w-1 h-4 bg-green-500 rounded-full" />
          </div>
          <span className="text-white text-sm font-medium">Good</span>
        </div>
        
        {/* Participants count */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <span className="text-white text-sm font-medium">2</span>
        </div>
      </div>
    </div>
  );
}