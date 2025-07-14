'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Volume2, Activity, Mic, TrendingUp, Clock, BarChart3, MicOff, Square, Play, Wifi, WifiOff, AlertCircle, X } from 'lucide-react';

interface AudioAnalysisData {
  timestamp: string;
  volume: number;
  is_silence: boolean;
  pitch: number;
  speaking_rate: number;
  confidence: number;
  emotion: string;
  participant_identity?: string;
}

interface AudioAnalysisDisplayProps {
  analysisHistory: AudioAnalysisData[];
  currentAnalysis?: AudioAnalysisData | null;
  isAnalysisServerConnected?: boolean;
  isRecording?: boolean;
  onStartAnalysis?: () => void;
  onStopAnalysis?: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
}

// Mock data for demonstration when no real data is available
const mockAnalysisHistory = [
  { timestamp: '2024-01-01T10:00:00Z', volume: 45, is_silence: false, pitch: 150, speaking_rate: 1.2, confidence: 0.85, emotion: 'neutral' },
  { timestamp: '2024-01-01T10:00:01Z', volume: 52, is_silence: false, pitch: 165, speaking_rate: 1.1, confidence: 0.92, emotion: 'confident' },
  { timestamp: '2024-01-01T10:00:02Z', volume: 12, is_silence: true, pitch: 0, speaking_rate: 0, confidence: 0.1, emotion: 'neutral' },
  { timestamp: '2024-01-01T10:00:03Z', volume: 48, is_silence: false, pitch: 155, speaking_rate: 1.3, confidence: 0.78, emotion: 'neutral' },
  { timestamp: '2024-01-01T10:00:04Z', volume: 55, is_silence: false, pitch: 170, speaking_rate: 1.4, confidence: 0.88, emotion: 'confident' },
];

export const AudioAnalysisDisplay: React.FC<AudioAnalysisDisplayProps> = ({
  analysisHistory,
  currentAnalysis,
  isAnalysisServerConnected = false,
  isRecording = false,
  onStartAnalysis,
  onStopAnalysis,
  onClose,
  onMinimize,
  className = ""
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'confidence' | 'pitch' | 'volume' | 'speaking_rate'>('confidence');
  const [isMinimized, setIsMinimized] = useState(false);

  // Use provided data or fall back to mock data
  const displayHistory = analysisHistory.length > 0 ? analysisHistory : mockAnalysisHistory;
  const displayCurrentAnalysis = currentAnalysis || (isRecording ? {
    timestamp: new Date().toISOString(),
    volume: 48,
    is_silence: false,
    pitch: 160,
    speaking_rate: 1.25,
    confidence: 0.82,
    emotion: 'neutral',
    participant_identity: 'agent-AJ_ZJNziiW4rtyV'
  } : null);

  const handleStartAnalysis = () => {
    onStartAnalysis?.();
  };

  const handleStopAnalysis = () => {
    onStopAnalysis?.();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isAnalysisServerConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-900">Audio Analysis</span>
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-600 font-medium">LIVE</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Audio Analysis</h2>
                <p className="text-blue-100 text-xs">AI-powered voice analysis system</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleMinimize}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {/* Connection Status */}
          <div className="mb-4">
            <div className={`p-3 rounded-lg border transition-all duration-300 ${
              isAnalysisServerConnected 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isAnalysisServerConnected ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {isAnalysisServerConnected ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${
                    isAnalysisServerConnected ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {isAnalysisServerConnected ? 'Analysis System Online' : 'Analysis System Offline'}
                  </div>
                  <div className={`text-xs ${
                    isAnalysisServerConnected ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isAnalysisServerConnected 
                      ? 'AI voice analysis system is ready' 
                      : 'Voice analysis system unavailable'
                    }
                  </div>
                </div>
                {isRecording && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold">ANALYZING</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Candidate Voice Analysis */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mic className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Candidate Voice Analysis</h3>
            </div>
            
            <div className={`p-4 rounded-lg border transition-all duration-300 ${
              isRecording 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isRecording ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Mic className={`w-4 h-4 ${
                      isRecording ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {displayCurrentAnalysis?.participant_identity || 'agent-AJ_ZJNziiW4rtyV'}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full flex-shrink-0">
                        Candidate
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">
                      {isRecording ? 'Currently analyzing voice patterns...' : 'Voice stream detected and ready'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={isRecording ? handleStopAnalysis : handleStartAnalysis}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                      : isAnalysisServerConnected
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAnalysisServerConnected && !isRecording}
                >
                  {isRecording ? 'Stop Analysis' : 'Start AI Analysis'}
                </button>
              </div>
            </div>
          </div>

          {/* Live Voice Metrics */}
          {displayCurrentAnalysis && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-3 h-3 text-purple-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Real-time Voice Metrics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Volume Meter */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <Volume2 className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-900">Voice Volume</span>
                    </div>
                    <span className="text-lg font-bold text-blue-900">{Math.round(displayCurrentAnalysis.volume)}dB</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, (displayCurrentAnalysis.volume + 60) / 60 * 100))}%` }}
                    />
                  </div>
                </div>
                
                {/* Confidence Meter */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-900">Speech Confidence</span>
                    </div>
                    <span className="text-lg font-bold text-green-900">{(displayCurrentAnalysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${displayCurrentAnalysis.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mx-auto mb-1">
                    <BarChart3 className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Voice Pitch</div>
                  <div className="text-sm font-bold text-gray-900">{Math.round(displayCurrentAnalysis.pitch)}</div>
                  <div className="text-xs text-gray-500">Hz</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center mx-auto mb-1">
                    <Clock className="w-3 h-3 text-orange-600" />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Speaking Rate</div>
                  <div className="text-sm font-bold text-gray-900">{displayCurrentAnalysis.speaking_rate.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">rate</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <div className="w-6 h-6 bg-pink-100 rounded-md flex items-center justify-center mx-auto mb-1">
                    <Activity className="w-3 h-3 text-pink-600" />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Emotion</div>
                  <div className="text-sm font-bold text-gray-900 capitalize">{displayCurrentAnalysis.emotion}</div>
                  <div className="text-xs text-gray-500">detected</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center mx-auto mb-1">
                    <div className={`w-2 h-2 rounded-full ${displayCurrentAnalysis.is_silence ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mb-0.5">Speech Activity</div>
                  <div className={`text-sm font-bold ${displayCurrentAnalysis.is_silence ? 'text-gray-500' : 'text-green-600'}`}>
                    {displayCurrentAnalysis.is_silence ? 'Silent' : 'Speaking'}
                  </div>
                  <div className="text-xs text-gray-500">status</div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Charts */}
          {displayHistory.length > 0 && (
            <div className="mb-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Voice Analysis Trends</h4>
                  <div className="flex space-x-1">
                    {(['confidence', 'pitch', 'volume', 'speaking_rate'] as const).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                          selectedMetric === metric
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        {metric.charAt(0).toUpperCase() + metric.slice(1).replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={displayHistory.slice(-50).map((item, index) => ({
                    time: index,
                    confidence: item.confidence * 100,
                    pitch: item.pitch,
                    volume: Math.max(0, item.volume + 60),
                    speaking_rate: item.speaking_rate * 100
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#3b82f6"
                      fill="url(#colorGradient)"
                      strokeWidth={1.5}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* System Status Warning */}
          {!isAnalysisServerConnected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-amber-900">AI Analysis System Offline</div>
                  <div className="text-xs text-amber-800 mt-0.5">
                    The voice analysis system is currently unavailable. Please ensure the AI backend server is running on port 8000.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
