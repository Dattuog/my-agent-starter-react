'use client';

import { useEffect, useRef } from 'react';

interface MockAudioStreamProps {
  isActive: boolean;
  onAudioData: (data: any) => void;
}

export const MockAudioStream: React.FC<MockAudioStreamProps> = ({ isActive, onAudioData }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      
      // Generate mock audio data every 2 seconds
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        
        // Simulate realistic voice patterns
        const isActive = Math.random() > 0.3; // 70% speech activity
        const volume = isActive ? Math.random() * 30 + 35 : Math.random() * 15 + 10; // 35-65dB when speaking
        const pitch = isActive ? Math.random() * 80 + 120 : 0; // 120-200Hz when speaking
        const speakingRate = isActive ? Math.random() * 0.8 + 0.8 : 0; // 0.8-1.6 rate
        const confidence = isActive ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3; // 0.6-1.0 when speaking
        
        const emotions = ['neutral', 'confident', 'calm', 'excited'];
        const emotion = isActive ? emotions[Math.floor(Math.random() * emotions.length)] : 'neutral';

        const audioData = {
          timestamp: new Date(now).toISOString(),
          volume: Math.round(volume),
          is_silence: !isActive,
          pitch: Math.round(pitch),
          speaking_rate: Math.round(speakingRate * 10) / 10,
          confidence: Math.round(confidence * 100) / 100,
          emotion,
          participant_identity: 'candidate'
        };

        onAudioData(audioData);
      }, 2000); // Every 2 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onAudioData]);

  return null; // This component doesn't render anything
};
