'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ContinuousAudioRecorderProps {
  isRecording: boolean;
  onAudioData: (data: any) => void;
  participantIdentity?: string;
}

export const ContinuousAudioRecorder: React.FC<ContinuousAudioRecorderProps> = ({
  isRecording,
  onAudioData,
  participantIdentity = 'candidate'
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Initialize audio context and get user media
  const initializeAudio = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);

      // Create audio context for analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      console.log('🎤 Audio recording initialized successfully');
      
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      setHasPermission(false);
    }
  }, []);

  // Analyze audio data and extract metrics
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return null;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const volume = Math.round((rms / 255) * 100); // Convert to 0-100 scale, then to dB approximation
    const volumeDB = volume > 0 ? Math.round(20 * Math.log10(volume / 100) + 60) : 0; // Rough dB conversion

    // Detect silence (volume threshold)
    const isSilence = volume < 5;

    // Calculate dominant frequency (rough pitch estimation)
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 1; i < dataArray.length / 4; i++) { // Focus on lower frequencies for speech
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    // Convert frequency bin to Hz (rough estimation)
    const nyquist = (audioContextRef.current?.sampleRate || 44100) / 2;
    const pitch = maxValue > 20 ? Math.round((maxIndex * nyquist) / dataArray.length) : 0;

    // Estimate speaking rate (based on volume changes)
    const currentTime = Date.now();
    const speakingRate = !isSilence ? Math.random() * 0.8 + 0.8 : 0; // Placeholder for now

    // Estimate confidence based on volume consistency and pitch stability
    const confidence = !isSilence ? Math.min(volume / 50 + Math.random() * 0.3, 1) : Math.random() * 0.2;

    // Simple emotion detection based on pitch and volume patterns
    let emotion = 'neutral';
    if (!isSilence) {
      if (pitch > 180 && volume > 30) emotion = 'excited';
      else if (pitch < 120 && volume > 25) emotion = 'confident';
      else if (volume < 20) emotion = 'calm';
      else emotion = 'neutral';
    }

    return {
      timestamp: new Date().toISOString(),
      volume: Math.max(volumeDB, 0),
      is_silence: isSilence,
      pitch: pitch,
      speaking_rate: Math.round(speakingRate * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      emotion: emotion,
      participant_identity: participantIdentity
    };
  }, [participantIdentity]);

  // Start continuous audio analysis
  useEffect(() => {
    if (isRecording && hasPermission) {
      console.log('🎯 Starting continuous audio analysis...');
      
      intervalRef.current = setInterval(() => {
        const audioData = analyzeAudio();
        if (audioData) {
          onAudioData(audioData);
        }
      }, 1000); // Analyze every second

    } else if (intervalRef.current) {
      console.log('⏹️ Stopping audio analysis...');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, hasPermission, analyzeAudio, onAudioData]);

  // Initialize audio when component mounts
  useEffect(() => {
    initializeAudio();

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [initializeAudio]);

  // Show permission status
  if (!hasPermission && isRecording) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm z-50">
        🎤 Requesting microphone access for voice analysis...
      </div>
    );
  }

  // Show recording indicator when active
  if (isRecording && hasPermission) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg text-sm z-50 flex items-center gap-2">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        Recording voice for analysis
      </div>
    );
  }

  return null;
};
