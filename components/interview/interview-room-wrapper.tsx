'use client';

import React, { useState, useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { Room } from 'livekit-client';
import InterviewLiveKit from './interview-livekit';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface InterviewRoomWrapperProps {
  serverUrl: string;
  token: string;
  appConfig?: any;
}

const InterviewRoomWrapper: React.FC<InterviewRoomWrapperProps> = ({ 
  serverUrl, 
  token, 
  appConfig = {} 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = () => {
    setIsConnecting(true);
    setConnectionError(null);
  };

  const handleDisconnected = () => {
    setIsConnecting(false);
  };

  const handleError = (error: Error) => {
    console.error('LiveKit connection error:', error);
    setConnectionError(error.message);
    setIsConnecting(false);
  };

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to connect to the interview room: {connectionError}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => {
              setConnectionError(null);
              handleConnect();
            }}
            className="w-full"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No authentication token provided. Please check your configuration.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      onConnected={handleConnect}
      onDisconnected={handleDisconnected}
      onError={handleError}
      connect={true}
      audio={true}
      video={true}
      screen={false}
      className="min-h-screen"
    >
      <InterviewLiveKit appConfig={appConfig} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

export default InterviewRoomWrapper;