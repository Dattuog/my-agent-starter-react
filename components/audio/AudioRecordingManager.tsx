'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Room, Track, TrackPublication, RemoteTrack } from 'livekit-client';
import { Mic, MicOff, Square, Play, Activity, Volume2, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';

interface AudioRecordingManagerProps {
  room: Room;
  onAnalysisUpdate?: (analysis: AudioAnalysis) => void;
  className?: string;
}

interface AudioAnalysis {
  timestamp: string;
  volume: number;
  is_silence: boolean;
  pitch: number;
  speaking_rate: number;
  confidence: number;
  emotion: string;
  participant_identity?: string;
}

interface EgressSession {
  egressId: string;
  trackId: string;
  participantIdentity: string;
  status: 'active' | 'stopped';
  startTime: Date;
}

export const AudioRecordingManager: React.FC<AudioRecordingManagerProps> = ({ 
  room, 
  onAnalysisUpdate,
  className = ""
}) => {
  const [activeSessions, setActiveSessions] = useState<EgressSession[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<{
    trackId: string;
    participantIdentity: string;
    trackType: string;
    isLocal: boolean;
  }[]>([]);
  const [analysisData, setAnalysisData] = useState<AudioAnalysis | null>(null);
  const [isAnalysisServerConnected, setIsAnalysisServerConnected] = useState(false);

  // Check if analysis server is available
  useEffect(() => {
    const checkAnalysisServer = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        setIsAnalysisServerConnected(response.ok);
      } catch (error) {
        console.log('Audio analysis server not available:', error);
        setIsAnalysisServerConnected(false);
      }
    };

    checkAnalysisServer();
    const interval = setInterval(checkAnalysisServer, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Monitor track publications
  useEffect(() => {
    const updateTracks = () => {
      const tracks: any[] = [];
      
      // Add local participant tracks
      if (room.localParticipant) {
        room.localParticipant.audioTrackPublications.forEach((publication) => {
          if (publication.track) {
            tracks.push({
              trackId: publication.trackSid,
              participantIdentity: room.localParticipant.identity,
              trackType: 'audio',
              isLocal: true
            });
          }
        });
      }

      // Add remote participant tracks
      room.remoteParticipants.forEach((participant) => {
        participant.audioTrackPublications.forEach((publication) => {
          if (publication.isSubscribed && publication.track) {
            tracks.push({
              trackId: publication.trackSid,
              participantIdentity: participant.identity,
              trackType: 'audio',
              isLocal: false
            });
          }
        });
      });
      
      setAvailableTracks(tracks);
    };

    // Initial update
    updateTracks();

    // Listen for track events
    room.on('trackPublished', updateTracks);
    room.on('trackUnpublished', updateTracks);
    room.on('trackSubscribed', updateTracks);
    room.on('trackUnsubscribed', updateTracks);
    room.on('participantConnected', updateTracks);
    room.on('participantDisconnected', updateTracks);

    return () => {
      room.off('trackPublished', updateTracks);
      room.off('trackUnpublished', updateTracks);
      room.off('trackSubscribed', updateTracks);
      room.off('trackUnsubscribed', updateTracks);
      room.off('participantConnected', updateTracks);
      room.off('participantDisconnected', updateTracks);
    };
  }, [room]);

  const startRecording = useCallback(async (trackId: string, participantIdentity: string) => {
    if (!isAnalysisServerConnected) {
      console.warn('Audio analysis server not available');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/start-audio-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: room.name,
          track_id: trackId,
          participant_identity: participantIdentity
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const newSession: EgressSession = {
          egressId: result.egress_id,
          trackId,
          participantIdentity,
          status: 'active',
          startTime: new Date()
        };
        
        setActiveSessions(prev => [...prev, newSession]);
        setIsRecording(true);
        
        console.log('Audio recording started:', result.egress_id);

        // Start listening for analysis updates
        listenForAnalysisUpdates(result.session_id, participantIdentity);
      } else {
        console.error('Failed to start recording:', result.error);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [room.name, isAnalysisServerConnected]);

  const listenForAnalysisUpdates = useCallback((sessionId: string, participantIdentity: string) => {
    // Connect to WebSocket for real-time analysis updates
    const wsUrl = `ws://localhost:8000/ws/audio-analysis/${sessionId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const analysis: AudioAnalysis = JSON.parse(event.data);
        analysis.participant_identity = participantIdentity;
        setAnalysisData(analysis);
        onAnalysisUpdate?.(analysis);
      } catch (error) {
        console.error('Error parsing analysis data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Analysis WebSocket closed');
    };

    return ws;
  }, [onAnalysisUpdate]);

  const stopRecording = useCallback(async (egressId: string) => {
    try {
      const response = await fetch('http://localhost:8000/stop-audio-recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          egress_id: egressId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setActiveSessions(prev => 
          prev.map(session => 
            session.egressId === egressId 
              ? { ...session, status: 'stopped' }
              : session
          )
        );
        
        console.log('Audio recording stopped:', egressId);
      } else {
        console.error('Failed to stop recording:', result.error);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, []);

  const stopAllRecordings = useCallback(async () => {
    const activeEgressIds = activeSessions
      .filter(session => session.status === 'active')
      .map(session => session.egressId);
    
    await Promise.all(activeEgressIds.map(egressId => stopRecording(egressId)));
    setIsRecording(false);
    setAnalysisData(null);
  }, [activeSessions, stopRecording]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-green-500 animate-pulse" />;
      case 'stopped':
        return <Square className="w-4 h-4 text-gray-500" />;
      default:
        return <Mic className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Connection Status */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isAnalysisServerConnected ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              isAnalysisServerConnected ? 'bg-green-500' : 'bg-red-500'
            } ${isAnalysisServerConnected ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">
              {isAnalysisServerConnected ? 'Analysis Ready' : 'Analysis Offline'}
            </div>
            <div className="text-xs text-gray-600">
              {isAnalysisServerConnected ? 'AI voice analysis system online' : 'Voice analysis system unavailable'}
            </div>
          </div>
          {isRecording && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">ANALYZING</span>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Voice Detection */}
      {availableTracks.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mic className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Candidate Voice Analysis</h4>
          </div>
          
          <div className="space-y-3">
            {availableTracks.map((track) => {
              const isActive = activeSessions.some(session => 
                session.trackId === track.trackId && session.status === 'active'
              );
              
              // Only show non-local tracks (candidates) for AI to analyze
              if (track.isLocal) return null;
              
              return (
                <div key={track.trackId} className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isActive 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <Mic className={`w-5 h-5 ${
                          isActive ? 'text-green-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {track.participantIdentity}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                            Candidate
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Voice stream detected</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => startRecording(track.trackId, track.participantIdentity)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : isAnalysisServerConnected
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={isActive || !isAnalysisServerConnected}
                    >
                      {isActive ? 'Analyzing Voice...' : 'Start AI Analysis'}
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Show message if only local user is present */}
            {availableTracks.length > 0 && availableTracks.every(track => track.isLocal) && (
              <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Mic className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-gray-600">Waiting for candidate</div>
                  <div className="text-xs text-gray-500">AI will analyze candidate's voice once they join</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Analysis Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-red-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">AI Voice Analysis</h4>
          </div>
          
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.egressId} className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(session.status)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{session.participantIdentity}</div>
                      <div className="text-xs text-gray-600">
                        {session.status === 'active' ? (
                          <span>Analyzing for {formatDuration(session.startTime)}</span>
                        ) : (
                          <span>Analysis completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {session.status === 'active' && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-700 font-semibold">ANALYZING</span>
                      </div>
                      <button
                        onClick={() => stopRecording(session.egressId)}
                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-md"
                      >
                        Stop Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Voice Metrics */}
      {analysisData && (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900">Real-time Voice Metrics</h4>
          </div>
          
          <div className="space-y-4">
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-semibold text-blue-700 mb-2">Voice Volume</div>
                <div className="text-lg font-bold text-blue-900 mb-2">{Math.round(analysisData.volume)}dB</div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, (analysisData.volume + 60) / 60 * 100))}%` }}
                  />
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs font-semibold text-green-700 mb-2">Speech Confidence</div>
                <div className="text-lg font-bold text-green-900 mb-2">{(analysisData.confidence * 100).toFixed(0)}%</div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisData.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Secondary Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="text-xs font-medium text-gray-600 mb-1">Voice Pitch</div>
                <div className="text-sm font-bold text-gray-900">{Math.round(analysisData.pitch)}</div>
                <div className="text-xs text-gray-500">Hz</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="text-xs font-medium text-gray-600 mb-1">Speaking Rate</div>
                <div className="text-sm font-bold text-gray-900">{analysisData.speaking_rate.toFixed(1)}</div>
                <div className="text-xs text-gray-500">rate</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <div className="text-xs font-medium text-gray-600 mb-1">Emotion</div>
                <div className="text-sm font-bold text-gray-900 capitalize">{analysisData.emotion}</div>
                <div className="text-xs text-gray-500">detected</div>
              </div>
            </div>
            
            {/* Speech Activity Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Speech Activity</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  analysisData.is_silence ? 'bg-gray-400' : 'bg-green-500 animate-pulse'
                }`} />
                <span className={`text-sm font-semibold ${
                  analysisData.is_silence ? 'text-gray-500' : 'text-green-600'
                }`}>
                  {analysisData.is_silence ? 'Silent' : 'Speaking'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Controls */}
      {isRecording && (
        <div>
          <button
            onClick={stopAllRecordings}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop AI Voice Analysis
          </button>
        </div>
      )}

      {/* System Status Warning */}
      {!isAnalysisServerConnected && (
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-800">AI Analysis System Offline</div>
              <div className="text-xs text-amber-700 mt-1">
                The voice analysis system is currently unavailable. Please ensure the AI backend server is running on port 8000.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
