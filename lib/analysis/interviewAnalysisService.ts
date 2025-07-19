import { InterviewAnalyzer, TranscriptSegment, AnalysisResult } from './interviewAnalyzer';

export interface InterviewData {
  transcripts: Array<{
    participantIdentity: string;
    text: string;
    timestamp: number;
  }>;
  audioAnalysisData: Array<{
    timestamp: string;
    volume: number;
    is_silence: boolean;
    pitch: number;
    speaking_rate: number;
    confidence: number;
    emotion: string;
    participant_identity?: string;
  }>;
  chatMessages: Array<{
    message: string;
    from: { identity: string };
    timestamp: number;
  }>;
}

export interface InterviewConfiguration {
  positionRole: string;
  expectedQuestions: string[];
  candidateIdentity: string;
  openaiApiKey?: string;
}

export class InterviewAnalysisService {
  private analyzer: InterviewAnalyzer;

  constructor(openaiApiKey?: string) {
    this.analyzer = new InterviewAnalyzer(openaiApiKey);
  }

  /**
   * Process interview data and generate comprehensive analysis
   */
  async analyzeCompleteInterview(
    interviewData: InterviewData,
    config: InterviewConfiguration
  ): Promise<AnalysisResult> {
    
    // Extract and process transcript segments
    const transcriptSegments = this.extractTranscriptSegments(
      interviewData,
      config.candidateIdentity
    );

    // Extract questions from chat or use predefined ones
    const questions = this.extractQuestions(
      interviewData.chatMessages,
      config.expectedQuestions
    );

    // Perform the analysis
    const analysisResult = await this.analyzer.analyzeInterview(
      transcriptSegments,
      questions,
      config.positionRole
    );

    // Enhance with audio analysis data if available
    if (interviewData.audioAnalysisData.length > 0) {
      analysisResult.speakingPatterns = this.enhanceSpeakingPatternsWithAudioData(
        analysisResult.speakingPatterns,
        interviewData.audioAnalysisData
      );
    }

    return analysisResult;
  }

  /**
   * Convert raw interview data into standardized transcript segments
   */
  private extractTranscriptSegments(
    interviewData: InterviewData,
    candidateIdentity: string
  ): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];

    // Process transcripts
    interviewData.transcripts.forEach(transcript => {
      segments.push({
        participantIdentity: transcript.participantIdentity,
        text: transcript.text,
        timestamp: transcript.timestamp,
        isCandidate: transcript.participantIdentity === candidateIdentity
      });
    });

    // Also include chat messages as they might contain questions or important context
    interviewData.chatMessages.forEach(chat => {
      segments.push({
        participantIdentity: chat.from.identity,
        text: chat.message,
        timestamp: chat.timestamp,
        isCandidate: chat.from.identity === candidateIdentity
      });
    });

    // Sort by timestamp
    return segments.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Extract interview questions from chat messages or use fallback questions
   * Enhanced to better detect questions and extract Q&A pairs
   */
  private extractQuestions(
    chatMessages: Array<{
      message: string;
      from: { identity: string };
      timestamp: number;
    }>,
    fallbackQuestions: string[]
  ): string[] {
    console.log('🔍 Extracting questions from chat messages...');
    
    // Look for messages that are questions and aren't from the candidate
    const questionMessages = chatMessages
      .filter(msg => {
        const message = msg.message.toLowerCase();
        const identity = msg.from.identity.toLowerCase();
        
        // Not from candidate/user
        if (identity.includes('candidate') || identity.includes('user')) {
          return false;
        }
        
        // Contains question indicators
        return message.includes('?') || 
               message.includes('tell me') ||
               message.includes('describe') ||
               message.includes('explain') ||
               message.includes('what') ||
               message.includes('how') ||
               message.includes('why') ||
               message.includes('when') ||
               message.includes('where') ||
               message.includes('can you');
      })
      .map(msg => msg.message.trim())
      .filter(msg => msg.length > 10); // Filter out very short messages

    console.log(`📝 Found ${questionMessages.length} questions in chat messages`);

    // If we found questions in chat, use those; otherwise use fallback
    if (questionMessages.length > 0) {
      return questionMessages;
    }

    if (fallbackQuestions.length > 0) {
      console.log(`📋 Using ${fallbackQuestions.length} fallback questions`);
      return fallbackQuestions;
    }

    console.log('⚠️ No questions found - will extract from transcript');
    return this.getDefaultQuestions();
  }

  /**
   * Enhance speaking patterns analysis with audio data
   */
  private enhanceSpeakingPatternsWithAudioData(
    baseSpeakingPatterns: any,
    audioData: Array<{
      timestamp: string;
      volume: number;
      is_silence: boolean;
      pitch: number;
      speaking_rate: number;
      confidence: number;
      emotion: string;
      participant_identity?: string;
    }>
  ) {
    if (audioData.length === 0) return baseSpeakingPatterns;

    // Calculate enhanced metrics from audio data
    const validAudioSamples = audioData.filter(sample => !sample.is_silence);
    
    if (validAudioSamples.length === 0) return baseSpeakingPatterns;

    const avgSpeakingRate = validAudioSamples.reduce((sum, sample) => 
      sum + (sample.speaking_rate || 0), 0) / validAudioSamples.length;

    const avgVolume = validAudioSamples.reduce((sum, sample) => 
      sum + sample.volume, 0) / validAudioSamples.length;

    const avgPitch = validAudioSamples.reduce((sum, sample) => 
      sum + sample.pitch, 0) / validAudioSamples.length;

    // Count silence periods for pause analysis
    const silencePeriods = audioData.filter(sample => sample.is_silence);
    const avgPauseLength = silencePeriods.length > 0 ? 
      silencePeriods.length / validAudioSamples.length * 2 : baseSpeakingPatterns.averagePauseLength;

    return {
      ...baseSpeakingPatterns,
      wordsPerMinute: avgSpeakingRate > 0 ? Math.round(avgSpeakingRate) : baseSpeakingPatterns.wordsPerMinute,
      averagePauseLength: Math.round(avgPauseLength * 10) / 10,
      averageVolume: Math.round(avgVolume),
      averagePitch: Math.round(avgPitch),
      confidenceFromAudio: Math.round(
        validAudioSamples.reduce((sum, sample) => sum + sample.confidence, 0) / validAudioSamples.length
      )
    };
  }

  /**
   * Generate analysis result with mock data for testing
   */
  generateMockAnalysis(): AnalysisResult {
    return {
      overallScore: 0,
      skillsAssessment: [],
      questionAnalysis: [],
      speakingPatterns: {
        wordsPerMinute: 0,
        fillerWords: 0,
        averagePauseLength: 0,
        interruptions: 0,
        sentenceComplexity: 0,
        vocabularyRichness: 0
      },
      keyInsights: [
        {
          type: 'neutral',
          title: 'No Analysis Data Available',
          description: 'No interview transcript or conversation data was found to analyze.',
          confidence: 0
        }
      ],
      confidenceOverTime: [],
      summary: 'No interview data available for analysis. Please ensure the interview was properly recorded and try again.',
      duration: { minutes: 0, seconds: 0 }
    };
  }

  /**
   * Extract interview data from browser storage and LiveKit room state
   * Updated to use the new data capture system
   */
  static extractInterviewDataFromBrowser(): InterviewData {
    const interviewData: InterviewData = {
      transcripts: [],
      audioAnalysisData: [],
      chatMessages: []
    };

    try {
      // Try to get data from the new data capture system first
      const capturedData = sessionStorage.getItem('interviewCaptureData');
      if (capturedData) {
        const parsed = JSON.parse(capturedData);
        console.log('📊 Found captured interview data:', {
          transcripts: parsed.transcripts?.length || 0,
          chatMessages: parsed.chatMessages?.length || 0,
          audioAnalysisData: parsed.audioAnalysisData?.length || 0
        });
        
        return {
          transcripts: parsed.transcripts || [],
          chatMessages: parsed.chatMessages || [],
          audioAnalysisData: parsed.audioAnalysisData || []
        };
      }

      // Fallback to old storage keys for backward compatibility
      const storedAnalysisData = sessionStorage.getItem('audioAnalysisData');
      if (storedAnalysisData) {
        interviewData.audioAnalysisData = JSON.parse(storedAnalysisData);
      }

      const storedTranscripts = sessionStorage.getItem('interviewTranscripts');
      if (storedTranscripts) {
        interviewData.transcripts = JSON.parse(storedTranscripts);
      }

      const storedChats = sessionStorage.getItem('interviewChats');
      if (storedChats) {
        interviewData.chatMessages = JSON.parse(storedChats);
      }

      console.log('📊 Using fallback storage data:', {
        transcripts: interviewData.transcripts.length,
        chatMessages: interviewData.chatMessages.length,
        audioAnalysisData: interviewData.audioAnalysisData.length
      });

    } catch (error) {
      console.error('Error extracting interview data:', error);
    }

    return interviewData;
  }

  /**
   * Default questions for software engineering interviews
   */
  private getDefaultQuestions(): string[] {
    return [
      "Tell me about yourself and your background",
      "What interests you about this role and our company?",
      "Describe your most challenging technical project",
      "How do you approach debugging a complex issue?",
      "Tell me about a time you had to learn a new technology quickly",
      "How do you handle disagreements with team members?",
      "What's your experience with our tech stack?",
      "How do you ensure code quality in your projects?",
      "Describe a time you had to make a difficult technical decision",
      "What questions do you have for us?"
    ];
  }
}

// Export utility function for easy integration
export async function generateInterviewAnalysis(
  interviewData?: InterviewData,
  config?: Partial<InterviewConfiguration>
): Promise<AnalysisResult> {
  
  // Use provided data or extract from browser
  const data = interviewData || InterviewAnalysisService.extractInterviewDataFromBrowser();
  
  // Default configuration
  const analysisConfig: InterviewConfiguration = {
    positionRole: config?.positionRole || 'Software Engineer',
    expectedQuestions: config?.expectedQuestions || [],
    candidateIdentity: config?.candidateIdentity || 'candidate',
    openaiApiKey: config?.openaiApiKey
  };

  // Log what data we have
  console.log('🔍 Interview data analysis:', {
    transcripts: data.transcripts?.length || 0,
    chatMessages: data.chatMessages?.length || 0,
    audioData: data.audioAnalysisData?.length || 0
  });

  // Only use mock data if absolutely no data exists
  const hasAnyData = (data.transcripts && data.transcripts.length > 0) || 
                     (data.chatMessages && data.chatMessages.length > 0) ||
                     (data.audioAnalysisData && data.audioAnalysisData.length > 0);

  if (!hasAnyData) {
    console.log('⚠️ No real interview data found, using mock analysis as fallback');
    const analysisService = new InterviewAnalysisService();
    return analysisService.generateMockAnalysis();
  }

  console.log('✅ Processing real interview data for analysis');

  // Try to use the API first (server-side analysis)
  try {
    const response = await fetch('/api/analyze-interview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interviewData: data,
        config: analysisConfig
      })
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      console.warn('API analysis failed, falling back to client-side analysis');
    }
  } catch (error) {
    console.warn('API call failed, falling back to client-side analysis:', error);
  }

  // Fallback to client-side analysis
  const analysisService = new InterviewAnalysisService(analysisConfig.openaiApiKey);
  return analysisService.analyzeCompleteInterview(data, analysisConfig);
}
