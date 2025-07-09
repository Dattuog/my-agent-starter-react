'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, Track } from 'livekit-client';
import { useRoomContext, useParticipants, useLocalParticipant } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import { TrackToggle } from '@/components/livekit/track-toggle';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Container } from '@/components/Container';
import { 
  Play, 
  Pause, 
  Clock, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  HelpCircle,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Settings,
  AlertCircle
} from 'lucide-react';

interface InterviewLiveKitProps {
  appConfig: any;
}

const InterviewLiveKit: React.FC<InterviewLiveKitProps> = ({ appConfig }) => {
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  
  const [interviewStatus, setInterviewStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [notes, setNotes] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<Array<{timestamp: string, speaker: string, text: string}>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const questions = [
    "Tell me about yourself and your background.",
    "What interests you most about this role?",
    "Describe a challenging project you've worked on recently.",
    "Tell me about a time you had to work under pressure. How did you handle it?",
    "Where do you see yourself in five years?",
    "Do you have any questions for us?"
  ];

  // Timer effect
  useEffect(() => {
    if (interviewStatus === 'active') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewStatus]);

  // Listen for AI agent messages
  useEffect(() => {
    if (room) {
      const handleDataReceived = (payload: Uint8Array, participant: any) => {
        const message = new TextDecoder().decode(payload);
        try {
          const data = JSON.parse(message);
          if (data.type === 'ai_response') {
            setAiResponse(data.content);
          } else if (data.type === 'transcript') {
            setTranscript(prev => [...prev, {
              timestamp: formatTime(timeElapsed),
              speaker: data.speaker,
              text: data.text
            }]);
          }
        } catch (error) {
          console.error('Error parsing AI message:', error);
        }
      };

      room.on('dataReceived', handleDataReceived);
      return () => {
        room.off('dataReceived', handleDataReceived);
      };
    }
  }, [room, timeElapsed]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    setInterviewStatus('active');
    setIsRecording(true);
    setAiResponse("Welcome! I'm your AI interviewer. Let's begin with a few questions to understand your background and experience.");
    
    // Add initial transcript entry
    setTranscript([{
      timestamp: formatTime(timeElapsed),
      speaker: 'AI',
      text: "Welcome! I'm your AI interviewer. Let's begin with a few questions to understand your background and experience."
    }]);
    
    // Send start signal to AI agent
    if (room && localParticipant) {
      const startMessage = JSON.stringify({
        type: 'start_interview',
        questions: questions
      });
      await localParticipant.publishData(new TextEncoder().encode(startMessage), {
        reliable: true
      });
    }
  };

  const endInterview = async () => {
    setInterviewStatus('completed');
    setIsRecording(false);
    
    // Send end signal to AI agent
    if (room && localParticipant) {
      const endMessage = JSON.stringify({
        type: 'end_interview',
        duration: timeElapsed,
        notes: notes
      });
      await localParticipant.publishData(new TextEncoder().encode(endMessage), {
        reliable: true
      });
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      
      // Send next question to AI agent
      if (room && localParticipant) {
        const questionMessage = JSON.stringify({
          type: 'next_question',
          question: questions[nextQ],
          questionIndex: nextQ
        });
        await localParticipant.publishData(new TextEncoder().encode(questionMessage), {
          reliable: true
        });
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(isMuted);
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    if (localParticipant) {
      localParticipant.setCameraEnabled(!isVideoOn);
    }
  };

  if (interviewStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">InterviewAI</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full ${room?.state === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {room?.state === 'connected' ? 'Connected' : 'Disconnected'}
              </div>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
          </header>

          {/* Completion Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <Container className="max-w-4xl mx-auto">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Interview Completed</h2>
                  <p className="text-lg text-gray-600 max-w-lg mx-auto">
                    Thank you for completing the interview. Your responses have been recorded and will be reviewed by our team.
                  </p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{questions.length}</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{participants.length}</div>
                      <div className="text-sm text-gray-600">Participants</div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setInterviewStatus('waiting');
                    setCurrentQuestion(0);
                    setTimeElapsed(0);
                    setNotes('');
                    setTranscript([]);
                    setAiResponse('');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start New Interview
                </Button>
              </div>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">InterviewAI</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${room?.state === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {room?.state === 'connected' ? 'Connected' : 'Disconnected'}
            </div>
            <Button variant="outline" size="sm">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 p-6">
          {/* Left Panel - Video & Controls */}
          <div className="flex-1 max-w-4xl space-y-6">
            {/* Video Area */}
            <div className="relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {interviewStatus === 'waiting' ? (
                  <Button
                    onClick={startInterview}
                    className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
                    disabled={room?.state !== 'connected'}
                  >
                    <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </Button>
                ) : (
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-white text-sm font-medium">
                    {isRecording ? 'Recording' : 'Standby'}
                  </span>
                </div>

                {/* Timer */}
                {interviewStatus === 'active' && (
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                    <div className="flex items-center gap-1 text-white text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      {formatTime(timeElapsed)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleMute}
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
                    className="p-3"
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    onClick={toggleVideo}
                    variant={!isVideoOn ? "destructive" : "outline"}
                    size="sm"
                    className="p-3"
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={() => setShowTranscript(!showTranscript)}
                    variant="outline"
                    size="sm"
                    className="p-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Button>

                  <Button
                    onClick={endInterview}
                    variant="destructive"
                    className="px-6 py-3"
                    disabled={interviewStatus !== 'active'}
                  >
                    End Interview
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - AI Assistant & Notes */}
          <div className="w-96 space-y-6">
            {/* AI Assistant */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI Interviewer</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {aiResponse || "Ready to begin your interview. Click the play button to start."}
              </p>
              {interviewStatus === 'active' && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Listening...
                </div>
              )}
            </div>

            {/* Current Question */}
            {interviewStatus === 'active' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Question</h3>
                  <div className="text-sm text-gray-500">
                    {currentQuestion + 1} of {questions.length}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{questions[currentQuestion]}</p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    {questions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentQuestion ? 'bg-blue-500' : 
                          index < currentQuestion ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {currentQuestion < questions.length - 1 && (
                    <Button
                      onClick={nextQuestion}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Next →
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes here..."
                className="w-full h-32 resize-none border border-gray-200 rounded-xl p-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Transcript */}
            {showTranscript && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {transcript.map((entry, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-mono text-xs">{entry.timestamp}</span>
                        <span className={`font-semibold ${entry.speaker === 'AI' ? 'text-blue-600' : 'text-purple-600'}`}>
                          {entry.speaker}:
                        </span>
                      </div>
                      <p className="text-gray-700 ml-12">{entry.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewLiveKit;