import { useMemo, useEffect } from 'react';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';
import { transcriptionToChatMessage } from '@/lib/utils';
import { useInterviewDataCapture } from '@/lib/interviewDataCapture';

export default function useChatAndTranscription() {
  const transcriptions: TextStreamData[] = useTranscriptions();
  const chat = useChat();
  const room = useRoomContext();
  const { addTranscript, addChatMessage } = useInterviewDataCapture();

  // Capture transcriptions as they arrive
  useEffect(() => {
    if (transcriptions.length > 0) {
      const latestTranscription = transcriptions[transcriptions.length - 1];
      
      // Capture transcript data for analysis
      addTranscript(
        latestTranscription.participantInfo.identity || 'unknown',
        latestTranscription.text,
        latestTranscription.streamInfo.timestamp
      );
      
      console.log('📝 Captured transcription:', {
        participant: latestTranscription.participantInfo.identity,
        text: latestTranscription.text.substring(0, 50) + '...'
      });
    }
  }, [transcriptions, addTranscript]);

  // Capture chat messages as they arrive
  useEffect(() => {
    if (chat.chatMessages.length > 0) {
      const latestMessage = chat.chatMessages[chat.chatMessages.length - 1];
      
      // Capture chat message for analysis
      addChatMessage(
        latestMessage.message,
        latestMessage.from?.identity || 'unknown',
        latestMessage.timestamp
      );
      
      console.log('💬 Captured chat message:', {
        from: latestMessage.from?.identity,
        message: latestMessage.message.substring(0, 50) + '...'
      });
    }
  }, [chat.chatMessages, addChatMessage]);

  const mergedTranscriptions = useMemo(() => {
    const merged: Array<ReceivedChatMessage> = [
      ...transcriptions.map((transcription) => transcriptionToChatMessage(transcription, room)),
      ...chat.chatMessages,
    ];
    return merged.sort((a, b) => a.timestamp - b.timestamp);
  }, [transcriptions, chat.chatMessages, room]);

  return { messages: mergedTranscriptions, send: chat.send };
}
