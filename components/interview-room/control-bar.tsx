// components/interview-room/control-bar.tsx
'use client';

import { Track } from 'livekit-client';
import { TrackToggle } from '../livekit/track-toggle';
import { useAgentControlBar } from '../livekit/agent-control-bar/hooks/use-agent-control-bar';
import { useTrackToggle } from '@livekit/components-react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';

interface ControlBarProps {
  permissions: {
    canPublishMicrophone: boolean;
    canPublishCamera: boolean;
    canPublishScreenShare: boolean;
    canPublishData: boolean;
  };
  onEndCall: () => void;
  onChatToggle?: () => void;
  isChatOpen?: boolean;
  onToggleAudioRecording?: () => void;
  showAudioRecording?: boolean;
  audioAnalysisData?: any[];
}

export function ControlBar({ 
  permissions, 
  onEndCall, 
  onChatToggle, 
  isChatOpen = false, 
  onToggleAudioRecording, 
  showAudioRecording = false,
  audioAnalysisData = []
}: ControlBarProps) {
  const router = useRouter();
  const {
    microphoneToggle,
    cameraToggle,
    screenShareToggle,
  } = useAgentControlBar();

  const handleEndCall = () => {
    // Store audio analysis data before navigating
    if (audioAnalysisData && audioAnalysisData.length > 0) {
      sessionStorage.setItem('audioAnalysisData', JSON.stringify(audioAnalysisData));
    }
    router.push('/interview-completed');
  };

  return (
    <div className="flex items-center gap-3 bg-[#232b33] px-6 py-3 rounded-2xl shadow-xl">
      {/* Microphone */}
      <button
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
          microphoneToggle.enabled 
            ? 'bg-[#3c4043] text-white hover:bg-[#5f6368]' 
            : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
        }`}
        title="Toggle microphone"
        aria-label="Toggle microphone"
        onClick={() => microphoneToggle.toggle()}
      >
        {microphoneToggle.enabled ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 11c0 2.76-2.24 5-5 5-1.09 0-2.09-.35-2.91-.93l7.84-7.84C18.6 7.7 19 8.81 19 11zM4.41 4.86L3 6.27l4.99 4.99C8 11.13 8 11.56 8 12c0 2.76 2.24 5 5 5 .44 0 .87-.05 1.28-.14l2.11 2.11c-.97.63-2.13 1.03-3.39 1.03-3.87 0-7-3.13-7-7 0-1.26.4-2.42 1.03-3.39l1.28 1.28z"/>
          </svg>
        )}
      </button>

      {/* Camera */}
      <button
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
          cameraToggle.enabled 
            ? 'bg-[#3c4043] text-white hover:bg-[#5f6368]' 
            : 'bg-[#ea4335] text-white hover:bg-[#d93025]'
        }`}
        title="Toggle camera"
        aria-label="Toggle camera"
        onClick={() => cameraToggle.toggle()}
      >
        {cameraToggle.enabled ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2zM15 16H5V8h1.73L15 16.27V16z"/>
          </svg>
        )}
      </button>

      {/* Screen Share */}
      <button
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
          screenShareToggle.enabled 
            ? 'bg-[#4285f4] text-white hover:bg-[#3367d6]' 
            : 'bg-[#3c4043] text-white hover:bg-[#5f6368]'
        }`}
        title="Present screen"
        aria-label="Present screen"
        onClick={() => screenShareToggle.toggle()}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
        </svg>
      </button>

      {/* Reactions */}
      <button
        className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 bg-[#3c4043] text-white hover:bg-[#5f6368]"
        title="Reactions"
        aria-label="Reactions"
        disabled
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
      </button>

      {/* Audio Analysis */}
      {onToggleAudioRecording && (
        <button
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
            showAudioRecording 
              ? 'bg-[#16a34a] text-white hover:bg-[#15803d]' 
              : 'bg-[#3c4043] text-white hover:bg-[#5f6368]'
          }`}
          title={showAudioRecording ? 'Hide Audio Analysis' : 'Show Audio Analysis'}
          aria-label={showAudioRecording ? 'Hide Audio Analysis' : 'Show Audio Analysis'}
          onClick={onToggleAudioRecording}
        >
          <Activity width="20" height="20" />
        </button>
      )}

      {/* Chat */}
      <button
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 ${
          isChatOpen 
            ? 'bg-[#0c7ff2] text-white hover:bg-[#0a6ad6]' 
            : 'bg-[#3c4043] text-white hover:bg-[#5f6368]'
        }`}
        title={isChatOpen ? 'Close Chat' : 'Open Chat'}
        aria-label={isChatOpen ? 'Close Chat' : 'Open Chat'}
        onClick={onChatToggle}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </button>

      {/* Participants */}
      <button
        className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 bg-[#3c4043] text-white hover:bg-[#5f6368]"
        title="Participants"
        aria-label="Participants"
        disabled
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.31-1.73-2.46-1.73s-2.12.71-2.46 1.73L13.5 16H16v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6.5l1.43-4.28c.29-.87 1.08-1.48 2.07-1.48s1.78.61 2.07 1.48L13.5 15H12v7H8z"/>
        </svg>
      </button>

      {/* More options */}
      <button
        className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 bg-[#3c4043] text-white hover:bg-[#5f6368]"
        title="More options"
        aria-label="More options"
        disabled
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>

      {/* End Call Button */}
      <button
        onClick={handleEndCall}
        className="w-14 h-14 flex items-center justify-center text-white bg-[#ea4335] hover:bg-[#d93025] rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ml-2"
        title="End call"
        aria-label="End call"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
        </svg>
      </button>
    </div>
  );
}