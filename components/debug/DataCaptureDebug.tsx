'use client';

import React from 'react';
import { useInterviewDataCapture } from '@/lib/interviewDataCapture';

export function DataCaptureDebug() {
  const { getStoredData, isCapturing, dataCount } = useInterviewDataCapture();
  const data = getStoredData();

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md max-h-32 overflow-y-auto">
      <div className="font-bold mb-2">
        📊 Data Capture Debug {isCapturing ? '🟢' : '🔴'}
      </div>
      
      <div className="space-y-1">
        <div>Transcripts: {data?.transcripts?.length || 0}</div>
        <div>Chat Messages: {data?.chatMessages?.length || 0}</div>
        <div>Audio Data: {data?.audioAnalysisData?.length || 0}</div>
        
        {data?.chatMessages?.length > 0 && (
          <div className="mt-2 text-green-400">
            Latest: {data.chatMessages[data.chatMessages.length - 1]?.message?.substring(0, 30)}...
          </div>
        )}
      </div>
    </div>
  );
}
