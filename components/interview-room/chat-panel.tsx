// components/interview-room/chat-panel.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatInput } from '../livekit/chat/chat-input';
import { ChatMessageView } from '../livekit/chat/chat-message-view';
import { ChatEntry } from '../livekit/chat/chat-entry';
import type { ReceivedChatMessage } from '@livekit/components-react';
import { generateTranscriptPDF } from '../../lib/pdfGenerator';

interface ChatPanelProps {
  messages: ReceivedChatMessage[];
  onSendMessage: (message: string) => void;
  activeTab: 'chat' | 'transcript';
  onTabChange: (tab: 'chat' | 'transcript') => void;
  participantName: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function ChatPanel({ 
  messages, 
  onSendMessage, 
  activeTab, 
  onTabChange, 
  participantName,
  isMobile = false,
  onClose
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // For this example, treat all messages as both chat and transcript
  const chatMessages = messages;
  const transcriptMessages = messages; // Show all messages in transcript view too

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

  const handleTabChange = (tab: 'chat' | 'transcript') => {
    console.log('Tab change requested:', tab);
    onTabChange(tab);
  };

  const handleClose = () => {
    console.log('Close button clicked');
    if (onClose) {
      onClose();
    }
  };

  const handleDownloadTranscript = () => {
    try {
      if (messages.length === 0) {
        alert('No messages to download. Start a conversation first.');
        return;
      }
      
      generateTranscriptPDF(messages, {
        participantName,
        date: new Date()
      });
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      successMessage.textContent = 'Transcript downloaded successfully!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      errorMessage.textContent = 'Failed to generate PDF. Please try again.';
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        errorMessage.remove();
      }, 3000);
    }
  };

  const renderMessage = (message: ReceivedChatMessage, index: number) => {
    const isFromUser = message.from?.name === participantName || message.from?.identity === participantName;
    const isFromAI = message.from?.name === 'Assistant' || message.from?.name === 'AI Interviewer';
    
    return (
      <div 
        key={`${message.timestamp}-${index}`}
        className={`flex items-start gap-3 p-3 ${isFromUser ? 'justify-end' : ''}`}
      >
        {!isFromUser && (
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 mt-1"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format')`
            }}
          />
        )}
        <div className={`flex flex-1 flex-col gap-1 ${isFromUser ? 'items-end' : 'items-start'}`}>
          <p className={`text-[#90adcb] text-xs font-medium ${isFromUser ? 'text-right' : ''}`}>
            {isFromAI ? 'AI Interviewer' : isFromUser ? 'You' : message.from?.name || message.from?.identity}
            <span className="ml-2 text-[#667085]">
              {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </p>
          <div className={`max-w-[280px] rounded-lg px-3 py-2 ${
            isFromUser 
              ? 'bg-[#0c7ff2] text-white' 
              : 'bg-[#2a3441] text-white border border-[#3d4852]'
          }`}>
            <p className="text-sm font-normal leading-relaxed break-words">
              {message.message}
            </p>
          </div>
        </div>
        {isFromUser && (
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 shrink-0 mt-1"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format')`
            }}
          />
        )}
      </div>
    );
  };

  const EmptyState = ({ type }: { type: 'chat' | 'transcript' }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-[#2a3441] rounded-full flex items-center justify-center mb-4">
        {type === 'chat' ? (
          <svg className="w-8 h-8 text-[#90adcb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-[#90adcb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <p className="text-[#90adcb] text-sm font-medium mb-2">
        {type === 'chat' ? 'No messages yet' : 'No transcript available'}
      </p>
      <p className="text-[#667085] text-xs max-w-[250px] mb-4">
        {type === 'chat' 
          ? 'Start the conversation by sending a message below'
          : 'Start a conversation to generate a downloadable transcript. All messages will be recorded here.'
        }
      </p>
      {type === 'transcript' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#2a3441] rounded-lg border border-[#3d4852]">
            <svg className="w-4 h-4 text-[#90adcb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-[#90adcb]">
              PDF download will be available once you start chatting
            </span>
          </div>
          <button
            onClick={() => handleTabChange('chat')}
            className="flex items-center gap-2 px-4 py-2 bg-[#0c7ff2] hover:bg-[#0a6ad6] text-white text-sm rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chatting
          </button>
        </div>
      )}
    </div>
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-[#101a23]">
      {/* Header with tabs and close button */}
      <div className="flex-shrink-0 border-b border-[#314d68]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex space-x-8">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabChange('chat');
              }}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === 'chat' 
                  ? 'border-[#0c7ff2] text-white' 
                  : 'border-transparent text-[#90adcb] hover:text-white hover:border-[#4a90e2]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">Chat</span>
              {chatMessages.length > 0 && (
                <span className="bg-[#0c7ff2] text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center font-medium">
                  {chatMessages.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabChange('transcript');
              }}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
                activeTab === 'transcript' 
                  ? 'border-[#0c7ff2] text-white' 
                  : 'border-transparent text-[#90adcb] hover:text-white hover:border-[#4a90e2]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Transcript</span>
              {messages.length > 0 && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            {/* Download button - only show when on transcript tab and messages exist */}
            {activeTab === 'transcript' && messages.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownloadTranscript();
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0c7ff2] text-white rounded-md hover:bg-[#0a6ad6] transition-all duration-200 text-xs font-medium cursor-pointer"
                title="Download Transcript as PDF"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            )}
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              className="p-1.5 text-[#90adcb] hover:text-white hover:bg-[#314d68] rounded-md transition-all duration-200 cursor-pointer"
              aria-label="Close chat panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#314d68] scrollbar-track-transparent"
        >
          {activeTab === 'chat' ? (
            chatMessages.length > 0 ? (
              <div className="py-2">
                {chatMessages.map(renderMessage)}
              </div>
            ) : (
              <EmptyState type="chat" />
            )
          ) : (
            transcriptMessages.length > 0 ? (
              <div className="py-2">
                {transcriptMessages.map(renderMessage)}
              </div>
            ) : (
              <EmptyState type="transcript" />
            )
          )}
          
          {/* Floating Download Button for Transcript */}
          {activeTab === 'transcript' && messages.length > 0 && (
            <div className="absolute bottom-4 right-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDownloadTranscript();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0c7ff2] hover:bg-[#0c7ff2]/90 text-white text-sm rounded-lg shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                title="Download Transcript as PDF"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          )}
        </div>

        {/* Chat Input - Only show for chat tab */}
        {activeTab === 'chat' && (
          <div className="flex-shrink-0 border-t border-[#314d68] p-4">
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