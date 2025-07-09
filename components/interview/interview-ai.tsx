import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, MicOff, Video, VideoOff, MessageCircle, Users, Settings, HelpCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const InterviewAI = () => {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState('waiting'); // waiting, active, completed
  const [aiResponse, setAiResponse] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const questions = [
    "Tell me about yourself and your background.",
    "What interests you most about this role?",
    "Describe a challenging project you've worked on recently.",
    "Tell me about a time you had to work under pressure. How did you handle it?",
    "Where do you see yourself in five years?",
    "Do you have any questions for us?"
  ];

  const mockTranscript = [
    { timestamp: "00:30", speaker: "AI", text: "Hello! I'm your AI interviewer. Let's begin with the first question." },
    { timestamp: "00:35", speaker: "Candidate", text: "Thank you, I'm excited to get started." },
    { timestamp: "01:15", speaker: "AI", text: "Tell me about yourself and your background." },
    { timestamp: "01:20", speaker: "Candidate", text: "I'm a software engineer with 5 years of experience..." }
  ];

  // Timer effect
  useEffect(() => {
    if (isInterviewActive && interviewStatus === 'active') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev: number) => prev + 1);
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
  }, [isInterviewActive, interviewStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = () => {
    setIsInterviewActive(true);
    setInterviewStatus('active');
    setIsRecording(true);
    setAiResponse("Welcome, Sarah! I'm your AI interviewer. Let's begin with a few questions to understand your background and experience. Please take your time and answer thoughtfully.");
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setInterviewStatus('completed');
    setIsRecording(false);
    setAiResponse("Thank you for completing the interview. We appreciate your time and effort. Your responses have been recorded and will be reviewed by our team.");
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev: number) => prev + 1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  if (interviewStatus === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
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
              <nav className="flex items-center gap-6">
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Interviews</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Candidates</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Resources</a>
              </nav>
              <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <HelpCircle className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
            </div>
          </header>

          {/* Completion Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Interview Completed</h2>
                <p className="text-lg text-gray-600 max-w-lg mx-auto">
                  Thank you for completing the interview. We appreciate your time and effort. Your responses have been recorded and will be reviewed by our team. We will reach out to you soon with the next steps.
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
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInterviewStatus('waiting')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
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
            <nav className="flex items-center gap-6">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Interviews</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Candidates</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Templates</a>
            </nav>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
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
                {!isInterviewActive ? (
                  <button
                    onClick={startInterview}
                    className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
                  >
                    <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                ) : (
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Status Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-white text-sm font-medium">
                    {isRecording ? 'Recording' : 'Standby'}
                  </span>
                </div>

                {/* Timer */}
                {isInterviewActive && (
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
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isMuted 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      !isVideoOn 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="p-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>

                  <button
                    onClick={endInterview}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    End Interview
                  </button>
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
                {aiResponse}
              </p>
              {isInterviewActive && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Listening...
                </div>
              )}
            </div>

            {/* Current Question */}
            {isInterviewActive && (
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
                    <button
                      onClick={nextQuestion}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Next →
                    </button>
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
                  {mockTranscript.map((entry, index) => (
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

export default InterviewAI;