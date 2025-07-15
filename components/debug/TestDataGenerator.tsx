'use client';

import React from 'react';
import { useInterviewDataCapture } from '@/lib/interviewDataCapture';

export function TestDataGenerator() {
  const { addTranscript, addChatMessage, getStoredData, clearData } = useInterviewDataCapture();

  const generateTestData = () => {
    console.log('🧪 Generating test interview data...');
    
    // Clear existing data
    clearData();
    
    // Add some sample chat messages (questions)
    addChatMessage(
      "Hello! Let's start with an introduction. Can you tell me about your background and experience?",
      "ai-agent",
      Date.now() - 300000 // 5 minutes ago
    );
    
    addChatMessage(
      "That's great! Can you describe a challenging technical project you've worked on recently?",
      "ai-agent", 
      Date.now() - 240000 // 4 minutes ago
    );
    
    addChatMessage(
      "What programming languages and technologies are you most comfortable with?",
      "ai-agent",
      Date.now() - 180000 // 3 minutes ago
    );

    // Add some sample transcripts (answers)
    addTranscript(
      "candidate",
      "Hi! I'm a software engineer with 5 years of experience in full-stack development. I've worked extensively with React, Node.js, and Python. I'm passionate about building scalable web applications and have experience leading small teams.",
      Date.now() - 280000
    );

    addTranscript(
      "candidate", 
      "Recently I worked on a microservices migration project where we moved from a monolithic architecture to a distributed system using Docker and Kubernetes. The biggest challenge was maintaining data consistency across services, which we solved using event sourcing and CQRS patterns.",
      Date.now() - 220000
    );

    addTranscript(
      "candidate",
      "I'm most comfortable with JavaScript and TypeScript for frontend development using React and Next.js. On the backend, I prefer Node.js with Express or Python with FastAPI. I also have experience with PostgreSQL, Redis, and AWS services like Lambda and RDS.",
      Date.now() - 160000
    );

    const data = getStoredData();
    console.log('✅ Generated test data:', data);
    
    alert('Test data generated! Check the console for details.');
  };

  const clearTestData = () => {
    clearData();
    console.log('🧹 Cleared all test data');
    alert('Test data cleared!');
  };

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-3 rounded-lg text-sm z-50">
      <div className="font-bold mb-2">🧪 Test Data</div>
      <div className="space-y-2">
        <button 
          onClick={generateTestData}
          className="w-full bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs"
        >
          Generate Test Data
        </button>
        <button 
          onClick={clearTestData}
          className="w-full bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs"
        >
          Clear Data
        </button>
      </div>
    </div>
  );
}
