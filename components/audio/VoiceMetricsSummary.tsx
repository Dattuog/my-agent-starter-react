'use client';

import React from 'react';
import { Volume2, Mic, Activity, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

interface VoiceMetricsSummaryProps {
  analysisHistory: AudioAnalysisData[];
  currentAnalysis?: AudioAnalysisData | null;
  className?: string;
}

export const VoiceMetricsSummary: React.FC<VoiceMetricsSummaryProps> = ({
  analysisHistory,
  currentAnalysis,
  className = ""
}) => {
  // Calculate averages from analysis history
  const calculateAverages = () => {
    if (!analysisHistory || analysisHistory.length === 0) {
      return {
        avgVolume: 0,
        avgConfidence: 0,
        avgPitch: 0,
        avgSpeakingRate: 0,
        dominantEmotion: 'neutral',
        speechActivity: 'inactive'
      };
    }

    const nonSilentData = analysisHistory.filter(data => !data.is_silence);
    
    if (nonSilentData.length === 0) {
      return {
        avgVolume: 0,
        avgConfidence: 0,
        avgPitch: 0,
        avgSpeakingRate: 0,
        dominantEmotion: 'neutral',
        speechActivity: 'inactive'
      };
    }

    const avgVolume = Math.round(nonSilentData.reduce((sum, data) => sum + data.volume, 0) / nonSilentData.length);
    const avgConfidence = Math.round((nonSilentData.reduce((sum, data) => sum + data.confidence, 0) / nonSilentData.length) * 100);
    const avgPitch = Math.round(nonSilentData.reduce((sum, data) => sum + data.pitch, 0) / nonSilentData.length);
    const avgSpeakingRate = Math.round((nonSilentData.reduce((sum, data) => sum + data.speaking_rate, 0) / nonSilentData.length) * 10) / 10;

    // Find dominant emotion
    const emotionCounts: { [key: string]: number } = {};
    nonSilentData.forEach(data => {
      emotionCounts[data.emotion] = (emotionCounts[data.emotion] || 0) + 1;
    });
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral'
    );

    // Determine current speech activity
    const recentData = analysisHistory.slice(-5); // Last 5 data points
    const isCurrentlySpeaking = recentData.some(data => !data.is_silence);
    const speechActivity = isCurrentlySpeaking ? 'speaking' : 'inactive';

    return {
      avgVolume,
      avgConfidence,
      avgPitch,
      avgSpeakingRate,
      dominantEmotion,
      speechActivity
    };
  };

  // Helper function to get Tailwind width class
  const getWidthClass = (percentage: number) => {
    if (percentage >= 90) return 'w-full';
    if (percentage >= 75) return 'w-3/4';
    if (percentage >= 50) return 'w-1/2';
    if (percentage >= 25) return 'w-1/4';
    return 'w-1/12';
  };

  const metrics = calculateAverages();
  
  // Calculate percentage widths for progress bars
  const volumeWidth = Math.min((metrics.avgVolume / 80) * 100, 100);
  const confidenceWidth = metrics.avgConfidence;

  // Prepare chart data for trends
  const chartData = analysisHistory.slice(-20).map((data, index) => ({
    time: index,
    confidence: Math.round(data.confidence * 100),
    pitch: data.pitch,
    volume: data.volume
  }));

  // Helper function to get emotion color
  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'confident': return 'text-green-600';
      case 'nervous': return 'text-yellow-600';
      case 'excited': return 'text-blue-600';
      case 'calm': return 'text-blue-400';
      default: return 'text-gray-600';
    }
  };

  // Helper function to capitalize emotion
  const capitalizeEmotion = (emotion: string) => {
    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Voice Metrics</h3>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Voice Volume */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Voice Volume</span>
            </div>
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">{metrics.avgVolume}dB</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${getWidthClass(volumeWidth)}`}
            />
          </div>
        </div>

        {/* Speech Confidence */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Speech Confidence</span>
            </div>
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">{metrics.avgConfidence}%</span>
          </div>
          <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
            <div 
              className={`bg-green-600 h-2 rounded-full transition-all duration-300 ${getWidthClass(confidenceWidth)}`}
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Voice Pitch */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <BarChart3 className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Voice Pitch</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{metrics.avgPitch}</div>
          <div className="text-xs text-gray-500">Hz</div>
        </div>

        {/* Speaking Rate */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Speaking Rate</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{metrics.avgSpeakingRate}</div>
          <div className="text-xs text-gray-500">rate</div>
        </div>

        {/* Emotion */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <Activity className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Emotion</div>
          <div className={`text-lg font-bold ${getEmotionColor(metrics.dominantEmotion)}`}>
            {capitalizeEmotion(metrics.dominantEmotion)}
          </div>
          <div className="text-xs text-gray-500">detected</div>
        </div>

        {/* Speech Activity */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
            metrics.speechActivity === 'speaking' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Speech Activity</div>
          <div className={`text-lg font-bold ${
            metrics.speechActivity === 'speaking' ? 'text-green-600' : 'text-gray-500'
          }`}>
            {capitalizeEmotion(metrics.speechActivity)}
          </div>
          <div className="text-xs text-gray-500">status</div>
        </div>
      </div>

      {/* Voice Analysis Trends */}
      {chartData.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Voice Analysis Trends</h4>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Confidence</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Pitch</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                <div className="w-3 h-3 bg-blue-600 rounded" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">Volume</span>
              </div>
            </div>
          </div>
          
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
