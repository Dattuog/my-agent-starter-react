import { NextRequest, NextResponse } from 'next/server';
import { InterviewAnalysisService } from '@/lib/analysis/interviewAnalysisService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewData, config } = body;

    // Validate the request
    if (!interviewData) {
      return NextResponse.json(
        { error: 'Interview data is required' },
        { status: 400 }
      );
    }

    // Initialize the analysis service with server-side API key
    const analysisService = new InterviewAnalysisService(
      process.env.OPENAI_API_KEY
    );

    // Set default configuration
    const analysisConfig = {
      positionRole: 'Software Engineer',
      candidateIdentity: 'candidate',
      expectedQuestions: [],
      ...config
    };

    // Generate analysis
    const result = await analysisService.analyzeCompleteInterview(
      interviewData,
      analysisConfig
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Analysis API error:', error);
    
    // Return mock data if analysis fails
    const analysisService = new InterviewAnalysisService();
    const mockResult = analysisService.generateMockAnalysis();
    
    return NextResponse.json({
      ...mockResult,
      isMockData: true,
      error: 'Analysis service unavailable, showing sample data'
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Interview Analysis API is running',
    endpoints: {
      POST: '/api/analyze-interview - Analyze interview data'
    }
  });
}
