'use client';
import { useEffect, useState } from 'react';
import { useRoomContext, useConnectionState } from '@livekit/components-react';
import { ConnectionState, RoomEvent, DisconnectReason } from 'livekit-client';
import { InterviewRoomLayout } from './interview-room/interview-room-layout';
import useConnectionDetails from '../hooks/useConnectionDetails';

interface SessionViewProps {
  roomName?: string;
  participantName?: string;
}

export function SessionView({ roomName, participantName }: SessionViewProps) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connectionDetails } = useConnectionDetails();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(connectionState === ConnectionState.Connected);
    
    // Clear error when connecting
    if (connectionState === ConnectionState.Connecting) {
      setConnectionError(null);
    }
  }, [connectionState]);

  // Listen for connection errors
  useEffect(() => {
    if (!room) return;

    const handleDisconnected = (reason?: DisconnectReason) => {
      if (reason) {
        setConnectionError(`Connection lost: ${reason}`);
      } else {
        setConnectionError('Connection lost');
      }
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);

  // Show loading state while connecting
  if (connectionState === ConnectionState.Connecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101a23]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c7ff2] mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Connecting to interview room...</p>
          {roomName && (
            <p className="text-[#90adcb] text-sm mt-2">Room: {roomName}</p>
          )}
        </div>
      </div>
    );
  }

  // Show error state if connection failed
  if (connectionState === ConnectionState.Disconnected && (connectionError || room?.state === 'disconnected')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101a23]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Connection Failed</h2>
            <p className="text-[#90adcb] text-sm mb-6">
              {connectionError || 'Unable to connect to the interview room. Please try again.'}
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#0c7ff2] hover:bg-[#0c7ff2]/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-[#223649] hover:bg-[#223649]/90 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show reconnecting state
  if (connectionState === ConnectionState.Reconnecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101a23]">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-[#0c7ff2] rounded-full mx-auto mb-4 animate-ping"></div>
          </div>
          <p className="text-white text-lg font-medium">Reconnecting to interview room...</p>
          <p className="text-[#90adcb] text-sm mt-2">Please wait while we restore your connection</p>
        </div>
      </div>
    );
  }

  // Show main interface when connected
  if (isConnected && connectionState === ConnectionState.Connected) {
    return (
      <InterviewRoomLayout 
        roomName={roomName} 
        participantName={participantName}
      />
    );
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#101a23]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c7ff2] mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Initializing interview room...</p>
      </div>
    </div>
  );
}

// No logo or branding for LiveKit is present in this file. No changes needed.