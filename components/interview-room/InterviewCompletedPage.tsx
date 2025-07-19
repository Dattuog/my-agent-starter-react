'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Trophy, Clock, Target, TrendingUp, MessageCircle, Brain, 
  CheckCircle, AlertCircle, Star, Download, Share2, ChevronRight,
  Volume2, Eye, Zap, Award, BookOpen, Home, Activity, Loader2,
  RefreshCw, Sparkles
} from 'lucide-react';
import { AudioAnalysisDisplay } from '../audio/AudioAnalysisDisplay';
import { VoiceMetricsSummary } from '../audio/VoiceMetricsSummary';
import { useInterviewAnalysis } from '@/hooks/useInterviewAnalysis';
import { AnalysisResult } from '@/lib/analysis/interviewAnalyzer';
import { TestDataGenerator } from '../debug/TestDataGenerator';

const InterviewCompletedPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [audioAnalysisData, setAudioAnalysisData] = useState<any[]>([]);

  // Use the new AI-powered analysis hook
  const { 
    analysisResult, 
    isAnalyzing, 
    error, 
    analyzeInterview, 
    hasRealData 
  } = useInterviewAnalysis({ 
    autoAnalyze: true,
    config: {
      positionRole: 'Senior Software Engineer'
      // Note: OpenAI API key is handled server-side for security
    }
  });

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleRegenerateAnalysis = () => {
    analyzeInterview();
  };

  // Load audio analysis data from localStorage or URL params (keeping backward compatibility)
  useEffect(() => {
    const storedAnalysisData = sessionStorage.getItem('audioAnalysisData');
    if (storedAnalysisData) {
      try {
        const parsedData = JSON.parse(storedAnalysisData);
        setAudioAnalysisData(parsedData);
        sessionStorage.removeItem('audioAnalysisData');
      } catch (error) {
        console.error('Error parsing audio analysis data:', error);
      }
    }
  }, []);

  // Use AI analysis if available, otherwise fall back to mock data
  const interviewData = {
    candidate: "Alex Johnson",
    position: "Senior Software Engineer", 
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    duration: analysisResult?.duration 
      ? `${analysisResult.duration.minutes} minutes${analysisResult.duration.seconds > 0 ? ` ${analysisResult.duration.seconds} seconds` : ''}`
      : "Duration not available",
    interviewer: "AI Assistant"
  };

  const overallScore = analysisResult?.overallScore || 0;
  const skillsData =
    analysisResult?.skillsAssessment && analysisResult.skillsAssessment.length > 0
      ? analysisResult.skillsAssessment.map((skill) => ({
          skill: skill.skill,
          score: skill.score,
          max: skill.max,
        }))
      : [];

  const confidenceData =
    analysisResult?.confidenceOverTime && analysisResult.confidenceOverTime.length > 0
      ? analysisResult.confidenceOverTime
      : [];

  const questionAnalysis =
    analysisResult?.questionAnalysis && analysisResult.questionAnalysis.length > 0
      ? analysisResult.questionAnalysis
      : [];

  const speakingPatternsData = analysisResult?.speakingPatterns;
  const speakingPatterns = speakingPatternsData ? [
    { 
      metric: 'Words per minute', 
      value: speakingPatternsData.wordsPerMinute || 'N/A', 
      ideal: '120-160', 
      status: speakingPatternsData.wordsPerMinute ? 
        (speakingPatternsData.wordsPerMinute >= 120 && speakingPatternsData.wordsPerMinute <= 160 ? 'good' : 'warning') : 
        'unavailable'
    },
    { 
      metric: 'Filler words', 
      value: speakingPatternsData.fillerWords !== undefined ? speakingPatternsData.fillerWords : 'N/A', 
      ideal: '<20', 
      status: speakingPatternsData.fillerWords !== undefined ? 
        (speakingPatternsData.fillerWords < 20 ? 'good' : 'warning') : 
        'unavailable'
    },
    { 
      metric: 'Average pause length', 
      value: speakingPatternsData.averagePauseLength || 'N/A', 
      ideal: '1-3s', 
      status: speakingPatternsData.averagePauseLength ? 'good' : 'unavailable'
    },
    { 
      metric: 'Interruptions', 
      value: speakingPatternsData.interruptions !== undefined ? speakingPatternsData.interruptions : 'N/A', 
      ideal: '<5', 
      status: speakingPatternsData.interruptions !== undefined ? 
        (speakingPatternsData.interruptions < 5 ? 'good' : 'warning') : 'unavailable'
    }
  ] : [];

  const keyInsights = analysisResult?.keyInsights?.map(insight => ({
    type: insight.type,
    icon: insight.type === 'strength' ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> :
      insight.type === 'improvement' ?
      <AlertCircle className="w-5 h-5 text-yellow-500" /> :
      <Star className="w-5 h-5 text-blue-500" />,
    title: insight.title,
    description: insight.description
  })) || [];

  const ScoreCard = ({ title, score, icon, color = "blue" }: {
    title: string;
    score: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          {icon}
        </div>
        <div className={`text-2xl font-bold text-${color}-600`}>{score}</div>
      </div>
      <h3 className="text-gray-900 font-medium">{title}</h3>
    </div>
  );

  const TabButton = ({ id, label, active, onClick }: {
    id: string;
    label: string;
    active: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Interview Insights</h1>
                {isAnalyzing && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                {hasRealData && !isAnalyzing && (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">AI-Powered Analysis</span>
                  </div>
                )}
                {!hasRealData && !isAnalyzing && (
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600 font-medium">Demo Mode</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {interviewData.candidate} • {interviewData.position} • {interviewData.date}
              </p>
              {error && (
                <p className="text-red-600 text-sm mt-1">
                  Analysis error: {error}
                </p>
              )}
              {analysisResult?.summary && (
                <p className="text-gray-700 text-sm mt-2 max-w-2xl">
                  <strong>Summary:</strong> {analysisResult.summary}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              {!isAnalyzing && (
                <button 
                  onClick={handleRegenerateAnalysis}
                  className="flex items-center px-4 py-2 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Analysis
                </button>
              )}
              <button 
                onClick={handleReturnHome}
                className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </button>
              <button className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Overall Score: {overallScore > 0 ? `${overallScore}/100` : 'Not Available'}
              </h2>
              <p className="text-blue-100 text-lg">
                {analysisResult?.overallScore ? 'Strong performance with room for growth' : 'Analysis in progress...'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-blue-100">Interview Duration</div>
              <div className="text-2xl font-semibold">{interviewData.duration}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {skillsData.slice(0, 4).map((skill, index) => (
            <ScoreCard
              key={index}
              title={skill.skill}
              score={skill.score > 0 ? `${skill.score}/${skill.max}` : 'N/A'}
              icon={
                index === 0 ? <Brain className="w-6 h-6 text-blue-600" /> :
                index === 1 ? <MessageCircle className="w-6 h-6 text-green-600" /> :
                index === 2 ? <Target className="w-6 h-6 text-purple-600" /> :
                <Award className="w-6 h-6 text-yellow-600" />
              }
              color={
                index === 0 ? "blue" :
                index === 1 ? "green" :
                index === 2 ? "purple" :
                "yellow"
              }
            />
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <TabButton id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="skills" label="Skills Analysis" active={activeTab === 'skills'} onClick={setActiveTab} />
          <TabButton id="questions" label="Question Breakdown" active={activeTab === 'questions'} onClick={setActiveTab} />
          <TabButton id="patterns" label="Speaking Patterns" active={activeTab === 'patterns'} onClick={setActiveTab} />
          {audioAnalysisData.length > 0 && (
            <TabButton id="voice" label="Voice Analysis" active={activeTab === 'voice'} onClick={setActiveTab} />
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Confidence Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Over Time</h3>
              {confidenceData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm">No confidence data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, 'Confidence']}
                      labelFormatter={(label) => confidenceData.find(d => d.time === label)?.question || label}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
              <div className="space-y-4">
                {keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    {insight.icon}
                    <div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills Assessment</h3>
            
            {skillsData.length === 0 || skillsData.every(skill => skill.score === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Skills Analysis Available</h4>
                <p className="text-gray-600 mb-4">
                  Skills assessment requires conversation data to analyze technical and soft skills.
                </p>
                <p className="text-sm text-gray-500">
                  Start an interview session and have a conversation to generate skills analysis.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={skillsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis domain={[0, 100]} tickCount={6} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-4">
                  {skillsData.map((skill, index) => {
                    const skillDetails = analysisResult?.skillsAssessment?.find(s => s.skill === skill.skill);
                  const progressWidth = Math.min(skill.score, 100);
                  return (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{skill.skill}</span>
                        <span className="text-sm font-semibold text-blue-600">{skill.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ inlineSize: `${progressWidth}%` }}
                        />
                      </div>
                      {skillDetails?.reasoning && (
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>AI Analysis:</strong> {skillDetails.reasoning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            {questionAnalysis.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Questions Analyzed</h4>
                <p className="text-gray-600 mb-4">
                  Question analysis requires conversation data between the interviewer and candidate.
                </p>
                <p className="text-sm text-gray-500">
                  Start an interview session and answer questions to generate detailed question analysis.
                </p>
              </div>
            ) : (
              questionAnalysis.map((qa, index) => (
              <div key={qa.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Q{index + 1}: {qa.question}</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{qa.duration}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      qa.score >= 80 ? 'bg-green-100 text-green-700' :
                      qa.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {qa.score}/100
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {qa.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-gray-600">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {qa.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm text-gray-600">• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => setSelectedQuestion(selectedQuestion === qa.id ? null : qa.id)}
                    className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {selectedQuestion === qa.id ? 'Hide' : 'View'} Response Transcript
                    <ChevronRight className={`w-4 h-4 ml-1 transform transition-transform ${
                      selectedQuestion === qa.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                  {selectedQuestion === qa.id && (
                    <div className="mt-3 p-3 bg-white rounded border text-sm text-gray-700">
                      "{qa.transcript}"
                    </div>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {/* Voice Metrics Summary */}
            {audioAnalysisData.length > 0 ? (
              <VoiceMetricsSummary 
                analysisHistory={audioAnalysisData}
                currentAnalysis={audioAnalysisData[audioAnalysisData.length - 1]}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time Voice Metrics</h3>
                </div>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Activity className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Voice Analysis Data</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Voice analysis requires audio recording during the interview session.
                  </p>
                  <p className="text-sm text-gray-500">
                    Start an interview and enable microphone to capture voice metrics like volume, pitch, and speaking patterns.
                  </p>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Speaking Patterns Analysis</h3>
              
              {!speakingPatternsData || (speakingPatternsData.wordsPerMinute === 0 && speakingPatternsData.fillerWords === 0) ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Volume2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Speaking Pattern Data</h4>
                  <p className="text-gray-600 mb-4">
                    Speaking pattern analysis requires audio transcription data from the interview.
                  </p>
                  <p className="text-sm text-gray-500">
                    Enable microphone and have a conversation to analyze speaking patterns.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {speakingPatterns.map((pattern, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Volume2 className="w-5 h-5 text-gray-400" />
                          <div className={`w-3 h-3 rounded-full ${
                            pattern.status === 'good' ? 'bg-green-500' : 
                            pattern.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">{pattern.value}</div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{pattern.metric}</div>
                        <div className="text-xs text-gray-500">Ideal: {pattern.ideal}</div>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced recommendations based on AI analysis */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      AI-Generated Recommendations
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {analysisResult?.speakingPatterns ? (
                        <>
                          <li>• Speaking rate of {analysisResult.speakingPatterns.wordsPerMinute} WPM is {
                            analysisResult.speakingPatterns.wordsPerMinute >= 120 && analysisResult.speakingPatterns.wordsPerMinute <= 160 
                              ? 'well-balanced and natural' 
                              : analysisResult.speakingPatterns.wordsPerMinute < 120 
                                ? 'on the slower side - consider increasing pace slightly' 
                                : 'quite fast - try to slow down for better clarity'
                          }</li>
                          <li>• {analysisResult.speakingPatterns.fillerWords} filler words detected - {
                            analysisResult.speakingPatterns.fillerWords < 10 
                              ? 'excellent control showing good preparation' 
                              : analysisResult.speakingPatterns.fillerWords < 20 
                                ? 'good control with minimal distractions'
                                : 'consider practicing to reduce filler words'
                          }</li>
                          {analysisResult.speakingPatterns.vocabularyRichness && (
                            <li>• Vocabulary richness of {analysisResult.speakingPatterns.vocabularyRichness}% shows{' '}
                              {analysisResult.speakingPatterns.vocabularyRichness > 70 
                                ? 'excellent word variety and articulation'
                                : 'good communication with room to expand vocabulary'}
                            </li>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          No detailed speaking patterns data available yet.
                        </p>
                      )}
                    </ul>
                  </div>
                </>
              )}

              {/* Additional audio metrics if available */}
              {analysisResult?.speakingPatterns?.vocabularyRichness && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Vocabulary Richness</h5>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.speakingPatterns.vocabularyRichness}%
                    </div>
                    <p className="text-sm text-gray-600">Unique words / Total words</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Sentence Complexity</h5>
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.speakingPatterns.sentenceComplexity || 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600">Average words per sentence</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voice' && audioAnalysisData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <AudioAnalysisDisplay 
              analysisHistory={audioAnalysisData}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Test Data Generator for debugging */}
      <TestDataGenerator />
    </div>
  );
};

export default InterviewCompletedPage;