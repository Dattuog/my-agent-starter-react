// components/interview-room/interview-room-layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { VideoSection } from './video-section';
import { ControlBar } from './control-bar';
import { ChatPanel } from './chat-panel';
import { MediaTiles } from '../livekit/media-tiles';
import { AudioRecordingManager } from '../audio/AudioRecordingManager';
import useChatAndTranscription from '../../hooks/useChatAndTranscription';
import { usePublishPermissions } from '../livekit/agent-control-bar/hooks/use-publish-permissions';

interface InterviewRoomLayoutProps {
  roomName?: string;
  participantName?: string;
}

export function InterviewRoomLayout({ roomName = "Software Engineer", participantName = "Candidate" }: InterviewRoomLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'transcript'>('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [showAudioRecording, setShowAudioRecording] = useState(false);
  const [audioAnalysisHistory, setAudioAnalysisHistory] = useState<any[]>([]);
  
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { messages, send } = useChatAndTranscription();
  const permissions = usePublishPermissions();

  const handleAudioAnalysisUpdate = (analysis: any) => {
    setAudioAnalysisHistory(prev => [...prev.slice(-200), analysis]); // Keep last 200 frames
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Close chat on mobile when resizing to desktop
      if (!mobile && isChatOpen) {
        // Keep chat open on desktop
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isChatOpen]);

  const handleEndCall = () => {
    if (room) {
      room.disconnect();
    }
  };

  const handleChatToggle = () => {
    setIsChatOpen((prev) => !prev);
    setActiveTab('chat');
  };

  const handleChatClose = () => {
    console.log('Closing chat panel');
    setIsChatOpen(false);
    setActiveTab('chat');
  };

  // Calculate main content width based on chat state
  const getMainContentStyle = () => {
    if (!isChatOpen) return {};
    
    if (isMobile) {
      return {}; // Mobile uses overlay, no width adjustment needed
    }
    
    return {
      marginRight: '360px', // Width of chat panel
      transition: 'margin-right 0.3s ease-in-out'
    };
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#101a23] font-sans">
      {/* Main content area - adjusts width when chat is open on desktop */}
      <div 
        className="flex-1 flex flex-col overflow-hidden pb-20"
        style={getMainContentStyle()}
      >
        {/* Video Section - centered and contained */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <VideoSection>
              <MediaTiles chatOpen={isChatOpen && activeTab === 'chat'} />
            </VideoSection>
          </div>
        </div>

        {/* Audio Recording Panel - Top Right Corner */}
        {showAudioRecording && (
          <div className="absolute top-4 right-4 w-80 z-30">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
              <div className="p-3 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Audio Analysis</h3>
                  <button
                    onClick={() => setShowAudioRecording(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <AudioRecordingManager 
                  room={room} 
                  onAnalysisUpdate={handleAudioAnalysisUpdate}
                  className="!p-0 !bg-transparent !shadow-none !border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar - fixed at bottom with proper spacing */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#101a23] border-t border-[#314d68]/30 py-4 z-30">
        <div className="flex justify-center">
          <ControlBar
            permissions={{
              canPublishMicrophone: permissions.microphone,
              canPublishCamera: permissions.camera,
              canPublishScreenShare: permissions.screenShare,
              canPublishData: permissions.data,
            }}
            onEndCall={handleEndCall}
            onChatToggle={handleChatToggle}
            isChatOpen={isChatOpen}
            onToggleAudioRecording={() => setShowAudioRecording(!showAudioRecording)}
            showAudioRecording={showAudioRecording}
            audioAnalysisData={audioAnalysisHistory}
          />
        </div>
      </div>

      {/* Chat/Transcript Panel - Desktop (Side Panel) */}
      {isChatOpen && !isMobile && (
        <div className="fixed right-0 top-0 h-full w-[360px] bg-[#101a23] shadow-2xl z-40 border-l border-[#314d68] transition-transform duration-300">
          <ChatPanel
            messages={messages}
            onSendMessage={send}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            participantName={participantName}
            onClose={handleChatClose}
          />
        </div>
      )}

      {/* Mobile Chat/Transcript Panel - Modal Overlay */}
      {isChatOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center"
          onClick={handleChatClose} // Close when clicking the backdrop
        >
          <div 
            className="w-full h-full sm:w-[90%] sm:max-w-md sm:h-[80%] bg-[#101a23] shadow-xl sm:rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the chat panel
          >
            <ChatPanel
              messages={messages}
              onSendMessage={send}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              participantName={participantName}
              isMobile={true}
              onClose={handleChatClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}