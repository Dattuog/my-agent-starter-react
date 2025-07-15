import { useState, useEffect, useCallback } from 'react';
import { 
  generateInterviewAnalysis, 
  InterviewData, 
  InterviewConfiguration 
} from '@/lib/analysis/interviewAnalysisService';
import { AnalysisResult } from '@/lib/analysis/interviewAnalyzer';
import { useInterviewDataCapture } from '@/lib/interviewDataCapture';

interface UseInterviewAnalysisOptions {
  autoAnalyze?: boolean;
  interviewData?: InterviewData;
  config?: Partial<InterviewConfiguration>;
  enableRealTimeAnalysis?: boolean;
}

interface UseInterviewAnalysisReturn {
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  analyzeInterview: () => Promise<void>;
  resetAnalysis: () => void;
  hasRealData: boolean;
}

export function useInterviewAnalysis(
  options: UseInterviewAnalysisOptions = {}
): UseInterviewAnalysisReturn {
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
  const { getStoredData } = useInterviewDataCapture();

  const analyzeInterview = useCallback(async () => {
    console.log('🔍 Starting interview analysis...');
    setIsAnalyzing(true);
    setError(null);

    try {
      // First, try to get real captured data
      const capturedData = getStoredData();
      console.log('📊 Captured data from hook:', capturedData);
      
      const interviewData = options.interviewData || capturedData || checkForStoredInterviewData();
      console.log('📋 Final interview data for analysis:', interviewData);
      
      // Check if we have real data
      const hasData = interviewData && (
        (interviewData.transcripts && interviewData.transcripts.length > 0) || 
        (interviewData.chatMessages && interviewData.chatMessages.length > 0) || 
        (interviewData.audioAnalysisData && interviewData.audioAnalysisData.length > 0)
      );
      
      setHasRealData(!!hasData);
      console.log('✅ Has real data:', hasData);

      if (hasData) {
        console.log('🎯 Using real interview data for analysis:', {
          transcripts: interviewData.transcripts?.length || 0,
          chatMessages: interviewData.chatMessages?.length || 0,
          audioData: interviewData.audioAnalysisData?.length || 0
        });
      } else {
        console.log('⚠️ No real data found, analysis will use fallback methods');
      }

      // Generate analysis
      const result = await generateInterviewAnalysis(
        interviewData,
        {
          positionRole: options.config?.positionRole || 'Senior Software Engineer',
          candidateIdentity: options.config?.candidateIdentity || 'candidate',
          expectedQuestions: options.config?.expectedQuestions || [],
          ...options.config
        }
      );

      console.log('✅ Analysis complete:', result);
      setAnalysisResult(result);
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [options.interviewData, options.config, getStoredData]);

  const resetAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setHasRealData(false);
  }, []);

  // Auto-analyze on mount if enabled
  useEffect(() => {
    if (options.autoAnalyze && !analysisResult && !isAnalyzing) {
      analyzeInterview();
    }
  }, [options.autoAnalyze, analysisResult, isAnalyzing, analyzeInterview]);

  return {
    analysisResult,
    isAnalyzing,
    error,
    analyzeInterview,
    resetAnalysis,
    hasRealData
  };
}

// Utility function to check for stored interview data
function checkForStoredInterviewData(): InterviewData | null {
  try {
    const audioData = sessionStorage.getItem('audioAnalysisData');
    const transcripts = sessionStorage.getItem('interviewTranscripts');
    const chats = sessionStorage.getItem('interviewChats');

    if (audioData || transcripts || chats) {
      return {
        audioAnalysisData: audioData ? JSON.parse(audioData) : [],
        transcripts: transcripts ? JSON.parse(transcripts) : [],
        chatMessages: chats ? JSON.parse(chats) : []
      };
    }
  } catch (error) {
    console.error('Error checking stored interview data:', error);
  }
  
  return null;
}

// Hook for real-time analysis updates during interview
export function useRealTimeAnalysis() {
  const [currentAnalysis, setCurrentAnalysis] = useState<Partial<AnalysisResult> | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  const updateAnalysis = useCallback((newData: any) => {
    setAnalysisHistory(prev => [...prev, newData]);
    
    // Perform lightweight real-time analysis
    // This could include sentiment analysis, speaking rate, etc.
    const realtimeMetrics = {
      currentConfidence: newData.confidence || 70,
      currentEmotion: newData.emotion || 'neutral',
      speakingRate: newData.speaking_rate || 140,
      volume: newData.volume || 50
    };

    setCurrentAnalysis(prev => ({
      ...prev,
      currentMetrics: realtimeMetrics,
      lastUpdate: Date.now()
    }));
  }, []);

  const resetRealTimeAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setAnalysisHistory([]);
  }, []);

  return {
    currentAnalysis,
    analysisHistory,
    updateAnalysis,
    resetRealTimeAnalysis
  };
}
