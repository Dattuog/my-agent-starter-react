import React, { useMemo } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'motion/react';
import {
  type TrackReference,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { AgentTile } from './agent-tile';
import { AvatarTile } from './avatar-tile';
import { VideoTile } from './video-tile';

const MotionVideoTile = motion.create(VideoTile);
const MotionAgentTile = motion.create(AgentTile);
const MotionAvatarTile = motion.create(AvatarTile);

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface MediaTilesProps {
  chatOpen: boolean;
}

export function MediaTiles({ chatOpen }: MediaTilesProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
    agent: { isActive: isAgentActive = false } = {},
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  // Google Meet-like grid: AI Interviewer (main speaker, left), Candidate (right)
  return (
    <div className="w-full h-full flex flex-col bg-[#202124]">
      <div className="flex-1 flex flex-col justify-center items-center px-6 pt-6 pb-2">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-2 gap-6 h-[60vh] min-h-[340px]">
          {/* AI Interviewer (main speaker, left) */}
          <div className="video-tile bg-[#3c4043] rounded-xl relative flex flex-col items-center justify-center overflow-hidden shadow-lg transition-all duration-200 hover:shadow-2xl hover:ring-2 hover:ring-[#0c7ff2] hover:bg-[#353a40] cursor-pointer">
            {isAgentActive ? (
              agentVideoTrack ? (
                <MotionAvatarTile
                  key="avatar"
                  layoutId="avatar"
                  videoTrack={agentVideoTrack}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full shadow-lg bg-black/30 flex items-center justify-center"
                />
              ) : (
                <MotionAgentTile
                  key="agent"
                  layoutId="agent"
                  state={agentState}
                  audioTrack={agentAudioTrack}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full shadow-lg bg-black/30 flex items-center justify-center"
                />
              )
            ) : (
              <div className="video-placeholder w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl font-semibold bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                A
              </div>
            )}
            <div className="participant-name absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-xs font-medium text-white">
              AI Interviewer
            </div>
          </div>
          {/* Candidate (right) */}
          <div className="video-tile bg-[#3c4043] rounded-xl relative flex flex-col items-center justify-center overflow-hidden shadow-lg transition-all duration-200 hover:shadow-2xl hover:ring-2 hover:ring-[#0c7ff2] hover:bg-[#353a40] cursor-pointer">
            {cameraTrack && !cameraTrack.publication.isMuted ? (
              <MotionVideoTile
                key="camera"
                layout="position"
                layoutId="camera"
                trackRef={cameraTrack}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="video-placeholder w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl font-semibold bg-gradient-to-br from-[#f093fb] to-[#f5576c]">
                C
              </div>
            )}
            <div className="participant-name absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-xs font-medium text-white">
              Candidate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
