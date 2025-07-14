'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const TestAudioRecordingPage = () => {
  const router = useRouter();

  const handleTestWithAudioData = () => {
    // Create mock audio analysis data
    const mockAudioData = [
      { timestamp: '2025-07-13T16:59:19.578022', volume: 1245.6, is_silence: false, pitch: 156.7, speaking_rate: 1.25, confidence: 0.78, emotion: 'neutral' },
      { timestamp: '2025-07-13T16:59:19.678022', volume: 1356.2, is_silence: false, pitch: 162.3, speaking_rate: 1.30, confidence: 0.82, emotion: 'confident' },
      { timestamp: '2025-07-13T16:59:19.778022', volume: 890.4, is_silence: false, pitch: 145.8, speaking_rate: 1.15, confidence: 0.75, emotion: 'calm' },
      { timestamp: '2025-07-13T16:59:19.878022', volume: 45.2, is_silence: true, pitch: 0, speaking_rate: 0, confidence: 0, emotion: 'neutral' },
      { timestamp: '2025-07-13T16:59:19.978022', volume: 1523.7, is_silence: false, pitch: 178.4, speaking_rate: 1.45, confidence: 0.85, emotion: 'excited' }
    ];

    // Store in sessionStorage
    sessionStorage.setItem('audioAnalysisData', JSON.stringify(mockAudioData));
    
    // Navigate to interview completed page
    router.push('/interview-completed');
  };

  const handleTestWithoutAudioData = () => {
    // Clear any existing audio data
    sessionStorage.removeItem('audioAnalysisData');
    
    // Navigate to interview completed page
    router.push('/interview-completed');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🎯 Audio Recording Feature Demo
          </h1>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-8">
                Test the audio recording integration by simulating different scenarios:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Test with Audio Data */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a5 5 0 1110 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    With Audio Analysis
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    See the Interview Insights page with voice analysis data and the new "Voice Analysis" tab.
                  </p>
                </div>
                
                <button
                  onClick={handleTestWithAudioData}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Test with Mock Audio Data
                </button>
              </div>

              {/* Test without Audio Data */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Without Audio Analysis
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    See the standard Interview Insights page without voice analysis tab.
                  </p>
                </div>
                
                <button
                  onClick={handleTestWithoutAudioData}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Test without Audio Data
                </button>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📍 To see the actual recording interface:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Go to <code className="bg-blue-100 px-1 rounded">http://localhost:3002</code></li>
                <li>2. Join an interview room (not this test page)</li>
                <li>3. Look for the Activity button (📊) in the control bar at bottom</li>
                <li>4. Click it to see the audio recording panel</li>
                <li>5. The panel appears in the top-right corner</li>
              </ol>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAudioRecordingPage;
