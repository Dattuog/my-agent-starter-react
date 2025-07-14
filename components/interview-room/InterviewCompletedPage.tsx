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
  Volume2, Eye, Zap, Award, BookOpen, Home, Activity
} from 'lucide-react';
import { AudioAnalysisDisplay } from '../audio/AudioAnalysisDisplay';

const InterviewCompletedPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [audioAnalysisData, setAudioAnalysisData] = useState<any[]>([]);

  const handleReturnHome = () => {
    router.push('/');
  };

  // Load audio analysis data from localStorage or URL params
  useEffect(() => {
    // Check if audio analysis data was passed via sessionStorage
    const storedAnalysisData = sessionStorage.getItem('audioAnalysisData');
    if (storedAnalysisData) {
      try {
        const parsedData = JSON.parse(storedAnalysisData);
        setAudioAnalysisData(parsedData);
        // Clear the data after loading
        sessionStorage.removeItem('audioAnalysisData');
      } catch (error) {
        console.error('Error parsing audio analysis data:', error);
      }
    }
  }, []);

  // Mock data - replace with actual API data
  const overallScore = 78;
  const interviewData = {
    candidate: "Alex Johnson",
    position: "Senior Software Engineer",
    date: "July 13, 2025",
    duration: "45 minutes",
    interviewer: "AI Assistant"
  };

  const skillsData = [
    { skill: 'Technical', score: 85, max: 100 },
    { skill: 'Communication', score: 72, max: 100 },
    { skill: 'Problem Solving', score: 78, max: 100 },
    { skill: 'Leadership', score: 65, max: 100 },
    { skill: 'Cultural Fit', score: 88, max: 100 },
    { skill: 'Experience', score: 90, max: 100 }
  ];

  const confidenceData = [
    { time: '0-5m', confidence: 65, question: 'Introduction' },
    { time: '5-10m', confidence: 78, question: 'Technical Background' },
    { time: '10-15m', confidence: 82, question: 'Problem Solving' },
    { time: '15-20m', confidence: 71, question: 'System Design' },
    { time: '20-25m', confidence: 85, question: 'Past Projects' },
    { time: '25-30m', confidence: 79, question: 'Team Collaboration' },
    { time: '30-35m', confidence: 88, question: 'Technical Deep Dive' },
    { time: '35-40m', confidence: 83, question: 'Future Goals' },
    { time: '40-45m', confidence: 90, question: 'Questions for Us' }
  ];

  const questionAnalysis = [
    {
      id: 1,
      question: "Tell me about your most challenging project",
      score: 85,
      duration: "4m 32s",
      strengths: ["Detailed explanation", "Clear structure", "Good examples"],
      improvements: ["Could be more concise", "Add more metrics"],
      transcript: "I worked on a microservices architecture project where we had to migrate from a monolithic system..."
    },
    {
      id: 2,
      question: "How do you handle technical debt?",
      score: 72,
      duration: "3m 18s",
      strengths: ["Practical approach", "Real examples"],
      improvements: ["More strategic thinking", "Consider business impact"],
      transcript: "Technical debt is something every team faces. In my experience, the key is to..."
    },
    {
      id: 3,
      question: "Describe a time you had to work with a difficult team member",
      score: 78,
      duration: "5m 02s",
      strengths: ["Emotional intelligence", "Diplomatic approach"],
      improvements: ["More specific outcomes", "Leadership skills"],
      transcript: "I once worked with a colleague who was very resistant to code reviews..."
    }
  ];

  const speakingPatterns = [
    { metric: 'Words per minute', value: 145, ideal: '120-160', status: 'good' },
    { metric: 'Filler words', value: 12, ideal: '<20', status: 'good' },
    { metric: 'Average pause length', value: 2.1, ideal: '1-3s', status: 'good' },
    { metric: 'Interruptions', value: 3, ideal: '<5', status: 'good' }
  ];

  const keyInsights = [
    {
      type: 'strength',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: 'Strong Technical Foundation',
      description: 'Demonstrated deep understanding of software architecture and best practices.'
    },
    {
      type: 'improvement',
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      title: 'Communication Clarity',
      description: 'Consider structuring answers with clear beginning, middle, and end.'
    },
    {
      type: 'strength',
      icon: <Star className="w-5 h-5 text-blue-500" />,
      title: 'Problem-Solving Approach',
      description: 'Shows systematic thinking and considers multiple solutions.'
    }
  ];

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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Insights</h1>
              <p className="text-gray-600 mt-1">
                {interviewData.candidate} • {interviewData.position} • {interviewData.date}
              </p>
            </div>
            <div className="flex space-x-3">
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
              <h2 className="text-3xl font-bold mb-2">Overall Score: {overallScore}/100</h2>
              <p className="text-blue-100 text-lg">Strong performance with room for growth</p>
            </div>
            <div className="text-right">
              <div className="text-blue-100">Interview Duration</div>
              <div className="text-2xl font-semibold">{interviewData.duration}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ScoreCard 
            title="Technical Skills" 
            score="85/100" 
            icon={<Brain className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <ScoreCard 
            title="Communication" 
            score="72/100" 
            icon={<MessageCircle className="w-6 h-6 text-green-600" />}
            color="green"
          />
          <ScoreCard 
            title="Problem Solving" 
            score="78/100" 
            icon={<Target className="w-6 h-6 text-purple-600" />}
            color="purple"
          />
          <ScoreCard 
            title="Cultural Fit" 
            score="88/100" 
            icon={<Award className="w-6 h-6 text-yellow-600" />}
            color="yellow"
          />
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
                {skillsData.map((skill, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{skill.skill}</span>
                      <span className="text-sm font-semibold text-blue-600">{skill.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            {questionAnalysis.map((qa, index) => (
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
            ))}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Speaking Patterns Analysis</h3>
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

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Recommendations
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your speaking pace is well-balanced and natural</li>
                <li>• Minimal use of filler words shows good preparation</li>
                <li>• Consider slightly longer pauses for emphasis on key points</li>
              </ul>
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
    </div>
  );
};

export default InterviewCompletedPage;