// components/interview-room/interview-room-layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { InterviewHeader } from './interview-header';
import { VideoSection } from './video-section';
import { ControlBar } from './control-bar';
import { ChatPanel } from './chat-panel';
import { MediaTiles } from '../livekit/media-tiles';
import useChatAndTranscription from '../../hooks/useChatAndTranscription';
import { usePublishPermissions } from '../livekit/agent-control-bar/hooks/use-publish-permissions';

interface InterviewRoomLayoutProps {
  roomName?: string;
  participantName?: string;
}

export function InterviewRoomLayout({ roomName = "Software Engineer", participantName = "Candidate" }: InterviewRoomLayoutProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'transcript'>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { messages, send } = useChatAndTranscription();
  const permissions = usePublishPermissions();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEndCall = () => {
    if (room) {
      room.disconnect();
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101a23] dark group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <InterviewHeader 
          participantName={participantName}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="gap-1 px-4 lg:px-6 flex flex-1 justify-center py-5">
              <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
                <h2 className="text-white tracking-light text-2xl lg:text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
                  Interview Room: {roomName}
                </h2>
                
                <VideoSection>
                  <MediaTiles chatOpen={activeTab === 'chat'} />
                </VideoSection>
                
                <ControlBar 
                  permissions={{
                    canPublishMicrophone: permissions.microphone,
                    canPublishCamera: permissions.camera,
                    canPublishScreenShare: permissions.screenShare,
                    canPublishData: permissions.data,
                  }}
                  onEndCall={handleEndCall}
                  onChatToggle={() => setActiveTab('chat')} // Open chat when icon clicked
                />
              </div>
            </div>
          </div>
          
          {/* Chat Panel - Desktop */}
          <div className="hidden lg:block">
            <ChatPanel 
              messages={messages}
              onSendMessage={send}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              participantName={participantName}
            />
          </div>
        </div>
        
        {/* Mobile Chat Panel Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#101a23] shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-[#314d68]">
                <h3 className="text-white font-semibold">Chat</h3>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-gray-300 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ChatPanel 
                messages={messages}
                onSendMessage={send}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                participantName={participantName}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}