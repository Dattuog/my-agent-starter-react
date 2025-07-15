// Utility functions for capturing and storing interview data
export interface InterviewDataCapture {
  startCapture(participantIdentity: string): void;
  stopCapture(): void;
  addTranscript(participantIdentity: string, text: string, timestamp?: number): void;
  addChatMessage(message: string, fromIdentity: string, timestamp?: number): void;
  addAudioAnalysis(analysisData: any): void;
  getStoredData(): any;
  clearData(): void;
}

class InterviewDataCaptureImpl implements InterviewDataCapture {
  private isCapturing: boolean = false;
  private candidateIdentity: string = '';
  private transcripts: Array<{
    participantIdentity: string;
    text: string;
    timestamp: number;
  }> = [];
  private chatMessages: Array<{
    message: string;
    from: { identity: string };
    timestamp: number;
  }> = [];
  private audioAnalysisData: any[] = [];

  startCapture(participantIdentity: string): void {
    this.isCapturing = true;
    this.candidateIdentity = participantIdentity;
    console.log(`Started capturing interview data for: ${participantIdentity}`);
  }

  stopCapture(): void {
    this.isCapturing = false;
    this.saveToStorage();
    console.log('Stopped capturing interview data');
  }

  addTranscript(participantIdentity: string, text: string, timestamp?: number): void {
    if (!this.isCapturing) return;

    const transcriptEntry = {
      participantIdentity,
      text: text.trim(),
      timestamp: timestamp || Date.now()
    };

    this.transcripts.push(transcriptEntry);
    this.saveToStorage();
  }

  addChatMessage(message: string, fromIdentity: string, timestamp?: number): void {
    if (!this.isCapturing && !message.trim()) return;

    const chatEntry = {
      message: message.trim(),
      from: { identity: fromIdentity },
      timestamp: timestamp || Date.now()
    };

    this.chatMessages.push(chatEntry);
    console.log(`💬 Captured chat message from ${fromIdentity}: ${message.substring(0, 50)}...`);
    this.saveToStorage();
  }

  addAudioAnalysis(analysisData: any): void {
    if (!this.isCapturing) return;

    this.audioAnalysisData.push({
      ...analysisData,
      timestamp: analysisData.timestamp || new Date().toISOString()
    });

    // Only store recent audio data to avoid storage overflow
    if (this.audioAnalysisData.length > 1000) {
      this.audioAnalysisData = this.audioAnalysisData.slice(-800);
    }

    this.saveToStorage();
  }

  getStoredData(): any {
    return {
      transcripts: this.transcripts,
      chatMessages: this.chatMessages,
      audioAnalysisData: this.audioAnalysisData,
      candidateIdentity: this.candidateIdentity
    };
  }

  clearData(): void {
    this.transcripts = [];
    this.chatMessages = [];
    this.audioAnalysisData = [];
    this.candidateIdentity = '';
    
    // Clear from storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('interviewCaptureData'); // New unified format
      sessionStorage.removeItem('interviewTranscripts');
      sessionStorage.removeItem('interviewChats');
      sessionStorage.removeItem('audioAnalysisData');
      sessionStorage.removeItem('candidateIdentity');
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Save data in unified format for the analysis service
      const unifiedData = {
        transcripts: this.transcripts,
        chatMessages: this.chatMessages,
        audioAnalysisData: this.audioAnalysisData,
        candidateIdentity: this.candidateIdentity,
        lastUpdated: Date.now()
      };

      // Store in unified format
      sessionStorage.setItem('interviewCaptureData', JSON.stringify(unifiedData));
      
      // Also store in old format for backward compatibility
      sessionStorage.setItem('interviewTranscripts', JSON.stringify(this.transcripts));
      sessionStorage.setItem('interviewChats', JSON.stringify(this.chatMessages));
      sessionStorage.setItem('audioAnalysisData', JSON.stringify(this.audioAnalysisData));
      sessionStorage.setItem('candidateIdentity', this.candidateIdentity);
      
      console.log('💾 Saved interview data:', {
        transcripts: this.transcripts.length,
        chatMessages: this.chatMessages.length,
        audioData: this.audioAnalysisData.length
      });
    } catch (error) {
      console.error('Error saving interview data to storage:', error);
    }
  }

  // Load existing data from storage on initialization
  loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Try unified format first
      const unifiedData = sessionStorage.getItem('interviewCaptureData');
      if (unifiedData) {
        const parsed = JSON.parse(unifiedData);
        this.transcripts = parsed.transcripts || [];
        this.chatMessages = parsed.chatMessages || [];
        this.audioAnalysisData = parsed.audioAnalysisData || [];
        this.candidateIdentity = parsed.candidateIdentity || '';
        console.log('📂 Loaded unified interview data:', {
          transcripts: this.transcripts.length,
          chatMessages: this.chatMessages.length,
          audioData: this.audioAnalysisData.length
        });
        return;
      }

      // Fallback to old format
      const storedTranscripts = sessionStorage.getItem('interviewTranscripts');
      const storedChats = sessionStorage.getItem('interviewChats');
      const storedAudio = sessionStorage.getItem('audioAnalysisData');
      const storedIdentity = sessionStorage.getItem('candidateIdentity');

      if (storedTranscripts) {
        this.transcripts = JSON.parse(storedTranscripts);
      }
      if (storedChats) {
        this.chatMessages = JSON.parse(storedChats);
      }
      if (storedAudio) {
        this.audioAnalysisData = JSON.parse(storedAudio);
      }
      if (storedIdentity) {
        this.candidateIdentity = storedIdentity;
      }
    } catch (error) {
      console.error('Error loading interview data from storage:', error);
    }
  }
}

// Singleton instance
const interviewDataCapture = new InterviewDataCaptureImpl();
interviewDataCapture.loadFromStorage();

export { interviewDataCapture };

// React hook for using the data capture
import { useCallback, useEffect, useState } from 'react';

export function useInterviewDataCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [dataCount, setDataCount] = useState({
    transcripts: 0,
    chats: 0,
    audioSamples: 0
  });

  const startCapture = useCallback((participantIdentity: string) => {
    interviewDataCapture.startCapture(participantIdentity);
    setIsCapturing(true);
  }, []);

  const stopCapture = useCallback(() => {
    interviewDataCapture.stopCapture();
    setIsCapturing(false);
  }, []);

  const addTranscript = useCallback((participantIdentity: string, text: string, timestamp?: number) => {
    interviewDataCapture.addTranscript(participantIdentity, text, timestamp);
    updateDataCount();
  }, []);

  const addChatMessage = useCallback((message: string, fromIdentity: string, timestamp?: number) => {
    interviewDataCapture.addChatMessage(message, fromIdentity, timestamp);
    updateDataCount();
  }, []);

  const addAudioAnalysis = useCallback((analysisData: any) => {
    interviewDataCapture.addAudioAnalysis(analysisData);
    updateDataCount();
  }, []);

  const getStoredData = useCallback(() => {
    return interviewDataCapture.getStoredData();
  }, []);

  const clearData = useCallback(() => {
    interviewDataCapture.clearData();
    setDataCount({ transcripts: 0, chats: 0, audioSamples: 0 });
  }, []);

  const updateDataCount = useCallback(() => {
    const data = interviewDataCapture.getStoredData();
    setDataCount({
      transcripts: data.transcripts.length,
      chats: data.chatMessages.length,
      audioSamples: data.audioAnalysisData.length
    });
  }, []);

  // Update count on mount
  useEffect(() => {
    updateDataCount();
  }, [updateDataCount]);

  return {
    isCapturing,
    dataCount,
    startCapture,
    stopCapture,
    addTranscript,
    addChatMessage,
    addAudioAnalysis,
    getStoredData,
    clearData
  };
}

// Helper function to integrate with existing LiveKit components
export function integrateWithLiveKit(room: any, participantIdentity: string) {
  // Start capturing when room is ready
  interviewDataCapture.startCapture(participantIdentity);

  // Listen for transcriptions
  const handleTranscription = (transcription: any) => {
    interviewDataCapture.addTranscript(
      transcription.participantInfo.identity,
      transcription.text,
      transcription.streamInfo.timestamp
    );
  };

  // Listen for chat messages
  const handleChatMessage = (message: any) => {
    interviewDataCapture.addChatMessage(
      message.message,
      message.from?.identity || 'unknown',
      message.timestamp
    );
  };

  // Return cleanup function
  return () => {
    interviewDataCapture.stopCapture();
  };
}
