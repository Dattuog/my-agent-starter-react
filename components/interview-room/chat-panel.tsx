// components/interview-room/chat-panel.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatInput } from '../livekit/chat/chat-input';
import { ChatMessageView } from '../livekit/chat/chat-message-view';
import { ChatEntry } from '../livekit/chat/chat-entry';
import type { ReceivedChatMessage } from '@livekit/components-react';

interface ChatPanelProps {
  messages: ReceivedChatMessage[];
  onSendMessage: (message: string) => void;
  activeTab: 'chat' | 'transcript';
  onTabChange: (tab: 'chat' | 'transcript') => void;
  participantName: string;
  isMobile?: boolean;
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  activeTab, 
  onTabChange, 
  participantName,
  isMobile = false 
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // For this example, treat all messages as chat (no transcript filtering)
  const chatMessages = messages;
  const transcriptMessages: ReceivedChatMessage[] = [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      onSendMessage(message);
      setInputValue('');
    }
  };

  const renderMessage = (message: ReceivedChatMessage, index: number) => {
    const isFromUser = message.from?.name === participantName || message.from?.identity === participantName;
    const isFromAI = message.from?.name === 'Assistant' || message.from?.name === 'AI Interviewer';
    return (
      <div 
        key={`${message.timestamp}-${index}`}
        className={`flex items-end gap-3 p-4 ${isFromUser ? 'justify-end' : ''}`}
      >
        {!isFromUser && (
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format')`
            }}
          />
        )}
        <div className={`flex flex-1 flex-col gap-1 ${isFromUser ? 'items-end' : 'items-start'}`}>
          <p className={`text-[#90adcb] text-[13px] font-normal leading-normal max-w-[360px] ${isFromUser ? 'text-right' : ''}`}>
            {isFromAI ? 'AI Interviewer' : isFromUser ? 'You' : message.from?.name || message.from?.identity}
          </p>
          <div className={`flex max-w-[300px] lg:max-w-[360px] rounded-lg px-4 py-3 ${
            isFromUser 
              ? 'bg-[#0c7ff2] text-white' 
              : 'bg-[#223649] text-white'
          }`}>
            <p className="text-base font-normal leading-normal break-words">
              {message.message}
            </p>
          </div>
        </div>
        {isFromUser && (
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format')`
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col ${isMobile ? 'h-full' : 'w-[360px] h-full'} bg-[#101a23] border-l border-[#223649]`}>
      {/* Tab Navigation */}
      <div className="pb-3">
        <div className="flex border-b border-[#314d68] px-4 gap-8">
          <button
            onClick={() => onTabChange('chat')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
              activeTab === 'chat' 
                ? 'border-b-[#0c7ff2] text-white' 
                : 'border-b-transparent text-[#90adcb] hover:text-white'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Chat</p>
          </button>
          <button
            onClick={() => onTabChange('transcript')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
              activeTab === 'transcript' 
                ? 'border-b-[#0c7ff2] text-white' 
                : 'border-b-transparent text-[#90adcb] hover:text-white'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Transcript</p>
          </button>
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#314d68] scrollbar-track-transparent"
        >
          {activeTab === 'chat' ? (
            chatMessages.length > 0 ? (
              chatMessages.map(renderMessage)
            ) : (
              <div className="flex items-center justify-center h-full text-[#90adcb] text-sm">
                No messages yet. Start the conversation!
              </div>
            )
          ) : (
            transcriptMessages.length > 0 ? (
              transcriptMessages.map(renderMessage)
            ) : (
              <div className="flex items-center justify-center h-full text-[#90adcb] text-sm">
                Transcript will appear here during the conversation.
              </div>
            )
          )}
        </div>
        {/* Chat Input - Only show for chat tab */}
        {activeTab === 'chat' && (
          <div className="border-t border-[#314d68] p-4">
            <ChatInput
              onSend={handleSendMessage}
              disabled={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}