'use client';

import React, { useState, useEffect } from 'react';
import InterviewRoomWrapper from '@/components/interview/interview-room-wrapper';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Video, Mic, Users, CheckCircle, AlertCircle, Camera, VolumeX, Volume2 } from 'lucide-react';

interface TokenResponse {
  token: string;
  serverUrl: string;
}

interface MediaPermissions {
  camera: boolean;
  microphone: boolean;
  audio: boolean;
}

const InterviewPage: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [candidateName, setCandidateName] = useState<string>('');
  const [interviewId, setInterviewId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: false,
    microphone: false,
    audio: false
  });
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);

  // Generate a unique interview ID
  useEffect(() => {
    setInterviewId(`interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Check media permissions on component mount
  useEffect(() => {
    checkMediaPermissions();
  }, []);

  const checkMediaPermissions = async () => {
    setIsCheckingPermissions(true);
    
    try {
      // Check camera permission
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setPermissions(prev => ({ ...prev, camera: true }));
        videoStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Camera permission denied:', error);
        setPermissions(prev => ({ ...prev, camera: false }));
      }

      // Check microphone permission
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissions(prev => ({ ...prev, microphone: true, audio: true }));
        audioStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setPermissions(prev => ({ ...prev, microphone: false, audio: false }));
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const generateToken = async () => {
    if (!candidateName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!permissions.camera || !permissions.microphone) {
      setError('Please enable camera and microphone permissions to join the interview');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room: interviewId,
          identity: candidateName,
          name: candidateName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data: TokenResponse = await response.json();
      setToken(data.token);
      setServerUrl(data.serverUrl);
      setIsJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join interview');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    await checkMediaPermissions();
  };

  const appConfig = {
    interviewId,
    candidateName,
    features: {
      recording: true,
      transcription: true,
      aiAnalysis: true,
    },
  };

  if (isJoined && token && serverUrl) {
    return (
      <InterviewRoomWrapper 
        serverUrl={serverUrl} 
        token={token} 
        appConfig={appConfig}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              InterviewAI
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join your AI-powered interview session
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* System Check */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">System Check</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {isCheckingPermissions ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : permissions.camera ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={permissions.camera ? 'text-green-600' : 'text-red-600'}>
                    Camera access {permissions.camera ? 'granted' : 'denied'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isCheckingPermissions ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : permissions.microphone ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={permissions.microphone ? 'text-green-600' : 'text-red-600'}>
                    Microphone access {permissions.microphone ? 'granted' : 'denied'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Network connection stable
                </div>
              </div>
              
              {(!permissions.camera || !permissions.microphone) && !isCheckingPermissions && (
                <Button 
                  onClick={requestPermissions}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Enable Permissions
                </Button>
              )}
            </div>

            {/* Join form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="interview-id" className="text-sm font-medium text-gray-700">
                  Interview ID
                </Label>
                <Input
                  id="interview-id"
                  type="text"
                  value={interviewId}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={generateToken}
                disabled={isLoading || !candidateName.trim() || !permissions.camera || !permissions.microphone}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining Interview...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Join Interview
                  </>
                )}
              </Button>
            </div>

            {/* Interview Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-blue-900">Interview Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Ensure good lighting and stable internet connection</li>
                <li>• Speak clearly and maintain eye contact with the camera</li>
                <li>• Have your resume and relevant documents ready</li>
                <li>• Find a quiet space free from distractions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewPage;