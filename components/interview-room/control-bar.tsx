// components/interview-room/control-bar.tsx
'use client';

import { Track } from 'livekit-client';
import { TrackToggle } from '../livekit/track-toggle';
import { useAgentControlBar } from '../livekit/agent-control-bar/hooks/use-agent-control-bar';
import { useTrackToggle } from '@livekit/components-react';

interface ControlBarProps {
  permissions: {
    canPublishMicrophone: boolean;
    canPublishCamera: boolean;
    canPublishScreenShare: boolean;
    canPublishData: boolean;
  };
  onEndCall: () => void;
  onChatToggle?: () => void; // Add prop for chat toggle
}

export function ControlBar({ permissions, onEndCall, onChatToggle }: ControlBarProps) {
  const {
    microphoneToggle,
    cameraToggle,
    screenShareToggle,
  } = useAgentControlBar();

  const controls = [
    {
      id: 'microphone',
      source: Track.Source.Microphone,
      enabled: microphoneToggle.enabled,
      onClick: () => microphoneToggle.toggle(),
      visible: permissions.canPublishMicrophone,
      icon: microphoneToggle.enabled ? 'Microphone' : 'MicrophoneSlash',
    },
    {
      id: 'camera',
      source: Track.Source.Camera,
      enabled: cameraToggle.enabled,
      onClick: () => cameraToggle.toggle(),
      visible: permissions.canPublishCamera,
      icon: cameraToggle.enabled ? 'Video' : 'VideoSlash',
    },
    {
      id: 'screen-share',
      source: Track.Source.ScreenShare,
      enabled: screenShareToggle.enabled,
      onClick: () => screenShareToggle.toggle(),
      visible: permissions.canPublishScreenShare,
      icon: 'Presentation',
    },
  ];

  return (
    <div className="flex justify-between items-center gap-2 px-4 py-3 border-t border-[#223649] bg-[#101a23]/95 backdrop-blur-sm">
      <div className="flex gap-2">
        {controls.map((control) => (
          control.visible && (
            <div key={control.id} className="relative">
              <TrackToggle
                source={control.source as Parameters<typeof useTrackToggle>[0]['source']}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                pressed={control.enabled}
                onClick={control.onClick}
              />
            </div>
          )
        ))}
        
        {/* Chat Toggle */}
        <button
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={onChatToggle} // Attach handler
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z" />
          </svg>
        </button>
        
        {/* Phone Toggle */}
        <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80A40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z" />
          </svg>
        </button>
      </div>
      
      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
          <path d="M231.88,175.08A56.26,56.26,0,0,1,176,224C96.6,224,32,159.4,32,80A56.26,56.26,0,0,1,80.92,24.12a16,16,0,0,1,16.62,9.52l21.12,47.15,0,.12A16,16,0,0,1,117.39,96c-.18.27-.37.52-.57.77L96,121.45c7.49,15.22,23.41,31,38.83,38.51l24.34-20.71a8.12,8.12,0,0,1,.75-.56,16,16,0,0,1,15.17-1.4l.13.06,47.11,21.11A16,16,0,0,1,231.88,175.08Z" />
        </svg>
        <span className="hidden sm:inline">End Call</span>
      </button>
    </div>
  );
}