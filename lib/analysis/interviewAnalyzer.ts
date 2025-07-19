import OpenAI from 'openai';
import Sentiment from 'sentiment';
// @ts-ignore - compromise doesn't have proper TypeScript definitions
import nlp from 'compromise';

// Types for our analysis
export interface TranscriptSegment {
  participantIdentity: string;
  text: string;
  timestamp: number;
  isCandidate: boolean;
}

export interface QuestionAnalysis {
  id: number;
  question: string;
  candidateResponse: string;
  score: number;
  duration: string;
  strengths: string[];
  improvements: string[];
  transcript: string;
  confidence: number;
  clarity: number;
  relevance: number;
  depth: number;
}

export interface SkillAssessment {
  skill: string;
  score: number;
  max: number;
  reasoning: string;
}

export interface SpeakingPatterns {
  wordsPerMinute: number;
  fillerWords: number;
  averagePauseLength: number;
  interruptions: number;
  sentenceComplexity: number;
  vocabularyRichness: number;
}

export interface KeyInsight {
  type: 'strength' | 'improvement' | 'neutral';
  title: string;
  description: string;
  confidence: number;
}

export interface AnalysisResult {
  overallScore: number;
  skillsAssessment: SkillAssessment[];
  questionAnalysis: QuestionAnalysis[];
  speakingPatterns: SpeakingPatterns;
  keyInsights: KeyInsight[];
  confidenceOverTime: Array<{
    time: string;
    confidence: number;
    question: string;
  }>;
  summary: string;
  duration?: { minutes: number; seconds: number };
}

export class InterviewAnalyzer {
  private openai: OpenAI;
  private sentiment: any;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true // Note: In production, this should be done server-side
    });
    this.sentiment = new Sentiment();
  }

  async analyzeInterview(
    transcriptSegments: TranscriptSegment[],
    interviewQuestions: string[],
    positionRole: string = 'Software Engineer'
  ): Promise<AnalysisResult> {
    
    const candidateSegments = transcriptSegments.filter(seg => seg.isCandidate);
    const fullTranscript = candidateSegments.map(seg => seg.text).join(' ');
    
    // Parallel analysis for better performance
    const [
      questionAnalysis,
      skillsAssessment,
      speakingPatterns,
      keyInsights,
      overallAssessment
    ] = await Promise.all([
      this.analyzeQuestions(transcriptSegments, interviewQuestions),
      this.analyzeSkills(fullTranscript, positionRole),
      this.analyzeSpeakingPatterns(candidateSegments),
      this.generateKeyInsights(fullTranscript, positionRole),
      this.generateOverallAssessment(fullTranscript, positionRole)
    ]);

    const confidenceOverTime = this.calculateConfidenceOverTime(transcriptSegments, questionAnalysis);
    const overallScore = this.calculateOverallScore(skillsAssessment, questionAnalysis, speakingPatterns);
    const interviewDuration = this.calculateInterviewDuration(transcriptSegments);

    return {
      overallScore,
      skillsAssessment,
      questionAnalysis,
      speakingPatterns,
      keyInsights,
      confidenceOverTime,
      summary: overallAssessment.summary,
      duration: interviewDuration
    };
  }

  private calculateInterviewDuration(transcriptSegments: TranscriptSegment[]): { minutes: number; seconds: number } {
    if (transcriptSegments.length === 0) {
      return { minutes: 0, seconds: 0 };
    }

    // Calculate duration from first to last transcript timestamp
    const firstTimestamp = transcriptSegments[0].timestamp;
    const lastTimestamp = transcriptSegments[transcriptSegments.length - 1].timestamp;
    
    const durationMs = lastTimestamp - firstTimestamp;
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    console.log(`⏱️ Interview duration calculated: ${minutes}m ${seconds}s (${transcriptSegments.length} segments)`);
    
    return { minutes, seconds };
  }

  private async analyzeQuestions(
    transcriptSegments: TranscriptSegment[],
    questions: string[]
  ): Promise<QuestionAnalysis[]> {
    
    // First, extract questions and answers from the transcript
    const extractedQA = await this.extractQuestionsAndAnswersFromTranscript(transcriptSegments);
    
    // If we have extracted Q&A pairs, use those; otherwise fall back to provided questions
    const questionAnalyses: QuestionAnalysis[] = [];
    
    if (extractedQA.length > 0) {
      console.log(`🎯 Extracted ${extractedQA.length} Q&A pairs from transcript`);
      
      for (let i = 0; i < extractedQA.length; i++) {
        const qa = extractedQA[i];
        const analysis = await this.analyzeQuestionResponse(qa.question, qa.answer, i + 1);
        questionAnalyses.push(analysis);
      }
    } else if (questions.length > 0) {
      console.log(`📝 Using ${questions.length} provided questions`);
      
      // Fall back to original logic for provided questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        const segmentStartIndex = Math.floor((i / questions.length) * transcriptSegments.length);
        const segmentEndIndex = Math.floor(((i + 1) / questions.length) * transcriptSegments.length);
        
        const questionSegments = transcriptSegments.slice(segmentStartIndex, segmentEndIndex);
        const candidateResponse = questionSegments
          .filter(seg => seg.isCandidate)
          .map(seg => seg.text)
          .join(' ');

        if (candidateResponse.trim()) {
          const analysis = await this.analyzeQuestionResponse(question, candidateResponse, i + 1);
          questionAnalyses.push(analysis);
        }
      }
    } else {
      console.log('⚠️ No questions found in transcript or provided');
    }

    return questionAnalyses;
  }

  private async extractQuestionsAndAnswersFromTranscript(
    transcriptSegments: TranscriptSegment[]
  ): Promise<Array<{ question: string; answer: string; timestamp: number }>> {
    
    if (transcriptSegments.length === 0) {
      return [];
    }

    // Group segments by speaker turns
    const conversationTurns = this.groupSegmentsByTurns(transcriptSegments);
    
    // Extract Q&A pairs using AI
    const fullConversation = conversationTurns
      .map(turn => `${turn.isCandidate ? 'CANDIDATE' : 'INTERVIEWER'}: ${turn.text}`)
      .join('\n');

    const prompt = `
    Extract interview questions and candidate answers from this conversation transcript.
    
    Conversation:
    ${fullConversation}
    
    Please identify clear question-answer pairs where:
    1. The INTERVIEWER asks a question
    2. The CANDIDATE provides a substantial response (more than just "yes/no")
    
    IMPORTANT: Respond with ONLY a valid JSON array, no markdown formatting:
    [
      {
        "question": "exact question asked by interviewer",
        "answer": "candidate's complete response",
        "timestamp": estimated_timestamp_number
      }
    ]
    
    Only include meaningful interview questions, not small talk or confirmations.
    Do not wrap your response in \`\`\`json blocks - return raw JSON only.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      });

      // Clean the response content by removing markdown code blocks
      let content = completion.choices[0].message.content || '[]';
      console.log('🔍 Raw AI response content:', content.substring(0, 200) + '...');
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Trim whitespace
      content = content.trim();
      
      // Ensure it starts with [ and ends with ]
      if (!content.startsWith('[')) {
        const jsonStart = content.indexOf('[');
        if (jsonStart !== -1) {
          content = content.substring(jsonStart);
        }
      }
      
      if (!content.endsWith(']')) {
        const jsonEnd = content.lastIndexOf(']');
        if (jsonEnd !== -1) {
          content = content.substring(0, jsonEnd + 1);
        }
      }

      console.log('🧹 Cleaned content for parsing:', content.substring(0, 200) + '...');
      const result = JSON.parse(content);
      console.log(`🎯 AI extracted ${result.length} Q&A pairs from transcript`);
      return result;
      
    } catch (error) {
      console.error('Error extracting Q&A from transcript:', error);
      
      // Fallback: simple pattern matching
      return this.extractQAWithPatternMatching(conversationTurns);
    }
  }

  private groupSegmentsByTurns(segments: TranscriptSegment[]): Array<{
    isCandidate: boolean;
    text: string;
    timestamp: number;
  }> {
    const turns: Array<{ isCandidate: boolean; text: string; timestamp: number }> = [];
    let currentTurn: { isCandidate: boolean; text: string; timestamp: number } | null = null;

    for (const segment of segments) {
      if (!currentTurn || currentTurn.isCandidate !== segment.isCandidate) {
        // New speaker, start a new turn
        if (currentTurn) {
          turns.push(currentTurn);
        }
        currentTurn = {
          isCandidate: segment.isCandidate,
          text: segment.text,
          timestamp: segment.timestamp
        };
      } else {
        // Same speaker, append to current turn
        currentTurn.text += ' ' + segment.text;
      }
    }

    if (currentTurn) {
      turns.push(currentTurn);
    }

    return turns;
  }

  private extractQAWithPatternMatching(
    conversationTurns: Array<{ isCandidate: boolean; text: string; timestamp: number }>
  ): Array<{ question: string; answer: string; timestamp: number }> {
    const qaPairs: Array<{ question: string; answer: string; timestamp: number }> = [];

    for (let i = 0; i < conversationTurns.length - 1; i++) {
      const currentTurn = conversationTurns[i];
      const nextTurn = conversationTurns[i + 1];

      // Look for interviewer question followed by candidate answer
      if (!currentTurn.isCandidate && nextTurn.isCandidate) {
        // Check if current turn contains a question
        if (currentTurn.text.includes('?') || 
            currentTurn.text.match(/\b(tell|describe|explain|what|how|why|when|where)\b/i)) {
          
          // Ensure the answer is substantial (more than 20 words)
          const answerWords = nextTurn.text.split(' ').length;
          if (answerWords > 20) {
            qaPairs.push({
              question: currentTurn.text,
              answer: nextTurn.text,
              timestamp: currentTurn.timestamp
            });
          }
        }
      }
    }

    console.log(`🔍 Pattern matching found ${qaPairs.length} Q&A pairs`);
    return qaPairs;
  }

  private async analyzeQuestionResponse(
    question: string,
    response: string,
    id: number
  ): Promise<QuestionAnalysis> {
    const prompt = `
    Analyze this interview question and candidate response:
    
    Question: "${question}"
    Response: "${response}"
    
    Please provide a detailed analysis with scores (0-100) for:
    1. Overall score
    2. Confidence level
    3. Clarity of communication
    4. Relevance to the question
    5. Depth of knowledge demonstrated
    
    Also provide:
    - 3 key strengths demonstrated
    - 2-3 areas for improvement
    - Estimated response duration in "Xm Ys" format
    
    Format your response as JSON with these exact keys:
    {
      "score": number,
      "confidence": number,
      "clarity": number,
      "relevance": number,
      "depth": number,
      "strengths": ["strength1", "strength2", "strength3"],
      "improvements": ["improvement1", "improvement2"],
      "duration": "Xm Ys"
    }
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        id,
        question,
        candidateResponse: response,
        score: analysis.score || 70,
        duration: analysis.duration || "3m 30s",
        strengths: analysis.strengths || ["Clear communication"],
        improvements: analysis.improvements || ["More specific examples"],
        transcript: response,
        confidence: analysis.confidence || 70,
        clarity: analysis.clarity || 70,
        relevance: analysis.relevance || 70,
        depth: analysis.depth || 70
      };
    } catch (error) {
      console.error('Error analyzing question:', error);
      // Fallback analysis
      return this.generateFallbackQuestionAnalysis(question, response, id);
    }
  }

  private async analyzeSkills(
    transcript: string,
    position: string
  ): Promise<SkillAssessment[]> {
    const prompt = `
    Analyze this interview transcript for a ${position} position and assess the candidate's skills.
    
    Transcript: "${transcript}"
    
    Please score the candidate (0-100) on these key skills and provide reasoning:
    1. Technical Skills
    2. Communication
    3. Problem Solving
    4. Leadership
    5. Cultural Fit
    6. Experience
    
    Format as JSON array:
    [
      {
        "skill": "Technical Skills",
        "score": number,
        "reasoning": "brief explanation"
      },
      ...
    ]
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const skills = JSON.parse(completion.choices[0].message.content || '[]');
      return skills.map((skill: any) => ({
        skill: skill.skill,
        score: skill.score || 70,
        max: 100,
        reasoning: skill.reasoning || "Analysis in progress"
      }));
    } catch (error) {
      console.error('Error analyzing skills:', error);
      return this.generateFallbackSkillsAssessment();
    }
  }

  private analyzeSpeakingPatterns(segments: TranscriptSegment[]): SpeakingPatterns {
    if (segments.length === 0) {
      console.log('⚠️ No transcript segments available for speaking pattern analysis');
      return {
        wordsPerMinute: 0,
        fillerWords: 0,
        averagePauseLength: 0,
        interruptions: 0,
        sentenceComplexity: 0,
        vocabularyRichness: 0
      };
    }

    // Filter to candidate segments only
    const candidateSegments = segments.filter(seg => seg.isCandidate);
    const fullText = candidateSegments.map(seg => seg.text).join(' ');
    
    if (!fullText.trim()) {
      console.log('⚠️ No candidate speech found for speaking pattern analysis');
      return {
        wordsPerMinute: 0,
        fillerWords: 0,
        averagePauseLength: 0,
        interruptions: 0,
        sentenceComplexity: 0,
        vocabularyRichness: 0
      };
    }

    const words = fullText.split(' ').filter(word => word.length > 0);
    
    // Calculate total speaking duration (in minutes)
    const totalDuration = candidateSegments.length > 0 ? 
      (candidateSegments[candidateSegments.length - 1].timestamp - candidateSegments[0].timestamp) / 60000 : 1;

    // Use compromise for linguistic analysis
    const doc = nlp(fullText);
    
    // Calculate filler words with more comprehensive list
    const fillerWords = [
      'um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 
      'sort of', 'kind of', 'i mean', 'well', 'so', 'right', 'okay'
    ];
    const fillerCount = fillerWords.reduce((count, filler) => 
      count + (fullText.toLowerCase().match(new RegExp(`\\b${filler}\\b`, 'g'))?.length || 0), 0
    );

    // Estimate sentence complexity
    const sentences = doc.sentences();
    const sentenceCount = sentences.length || 1;
    const avgWordsPerSentence = words.length / Math.max(sentenceCount, 1);
    
    // Calculate vocabulary richness (unique words / total words)
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    const vocabularyRichness = Math.round((uniqueWords.size / words.length) * 100);

    // Calculate interruptions by counting speaker switches mid-segment
    const interruptions = this.calculateInterruptions(segments);

    // Calculate average pause length by analyzing gaps between segments
    const averagePauseLength = this.calculateAveragePauseLength(candidateSegments);

    const result = {
      wordsPerMinute: Math.round(words.length / Math.max(totalDuration, 0.1)),
      fillerWords: fillerCount,
      averagePauseLength: Math.round(averagePauseLength * 10) / 10, // Round to 1 decimal
      interruptions,
      sentenceComplexity: Math.round(avgWordsPerSentence),
      vocabularyRichness: Math.min(100, vocabularyRichness) // Cap at 100%
    };

    console.log('🎤 Speaking patterns analyzed:', result);
    return result;
  }

  private calculateInterruptions(segments: TranscriptSegment[]): number {
    let interruptions = 0;
    let currentSpeaker: boolean | null = null;
    let consecutiveCount = 0;

    for (const segment of segments) {
      if (currentSpeaker === segment.isCandidate) {
        consecutiveCount++;
      } else {
        // Speaker changed
        if (consecutiveCount === 1 && currentSpeaker !== null) {
          // Very short turn might indicate interruption
          interruptions++;
        }
        currentSpeaker = segment.isCandidate;
        consecutiveCount = 1;
      }
    }

    return interruptions;
  }

  private calculateAveragePauseLength(candidateSegments: TranscriptSegment[]): number {
    if (candidateSegments.length < 2) return 0;

    const pauses: number[] = [];
    
    for (let i = 1; i < candidateSegments.length; i++) {
      const pauseLength = (candidateSegments[i].timestamp - candidateSegments[i-1].timestamp) / 1000; // Convert to seconds
      
      // Only count pauses between 0.5 and 10 seconds as meaningful
      if (pauseLength >= 0.5 && pauseLength <= 10) {
        pauses.push(pauseLength);
      }
    }

    if (pauses.length === 0) return 2.0; // Default value
    
    return pauses.reduce((sum, pause) => sum + pause, 0) / pauses.length;
  }

  private async generateKeyInsights(
    transcript: string,
    position: string
  ): Promise<KeyInsight[]> {
    const prompt = `
    Based on this interview transcript for a ${position} position, identify 3-4 key insights:
    
    Transcript: "${transcript}"
    
    Provide insights as JSON array with format:
    [
      {
        "type": "strength" | "improvement" | "neutral",
        "title": "Brief insight title",
        "description": "Detailed description",
        "confidence": number (0-100)
      }
    ]
    
    Focus on the most important observations about the candidate's abilities, communication style, and fit for the role.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo", 
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      });

      return JSON.parse(completion.choices[0].message.content || '[]');
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.generateFallbackInsights();
    }
  }

  private async generateOverallAssessment(
    transcript: string,
    position: string
  ): Promise<{ summary: string }> {
    const prompt = `
    Provide a comprehensive 2-3 sentence summary of this candidate's interview performance for a ${position} role:
    
    Transcript: "${transcript}"
    
    Focus on their strongest qualities and main areas for development.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      return { summary: completion.choices[0].message.content || "Analysis in progress." };
    } catch (error) {
      console.error('Error generating assessment:', error);
      return { summary: "The candidate demonstrated good communication skills with room for technical growth." };
    }
  }

  private calculateConfidenceOverTime(
    transcriptSegments: TranscriptSegment[],
    questionAnalysis: QuestionAnalysis[]
  ): Array<{ time: string; confidence: number; question: string }> {
    const timeSlices = 9; // 9 time intervals
    const confidenceData = [];
    
    for (let i = 0; i < timeSlices; i++) {
      const timeLabel = `${i * 5}-${(i + 1) * 5}m`;
      const questionIndex = Math.floor((i / timeSlices) * questionAnalysis.length);
      const question = questionAnalysis[questionIndex]?.question || `Topic ${i + 1}`;
      
      // Get confidence from corresponding question analysis or calculate from sentiment
      let confidence = questionAnalysis[questionIndex]?.confidence || 70;
      
      // Add some variation based on actual transcript sentiment if available
      const segmentStartIndex = Math.floor((i / timeSlices) * transcriptSegments.length);
      const segmentEndIndex = Math.floor(((i + 1) / timeSlices) * transcriptSegments.length);
      const segmentText = transcriptSegments
        .slice(segmentStartIndex, segmentEndIndex)
        .filter(seg => seg.isCandidate)
        .map(seg => seg.text)
        .join(' ');
      
      if (segmentText) {
        const sentimentScore = this.sentiment.analyze(segmentText);
        confidence = Math.max(50, Math.min(95, confidence + sentimentScore.score * 5));
      }
      
      confidenceData.push({
        time: timeLabel,
        confidence: Math.round(confidence),
        question: question.length > 30 ? question.substring(0, 27) + '...' : question
      });
    }
    
    return confidenceData;
  }

  private calculateOverallScore(
    skills: SkillAssessment[],
    questions: QuestionAnalysis[],
    speaking: SpeakingPatterns
  ): number {
    const skillsAvg = skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length;
    const questionsAvg = questions.reduce((sum, q) => sum + q.score, 0) / Math.max(questions.length, 1);
    
    // Speaking patterns scoring (simple heuristic)
    const speakingScore = Math.min(100, Math.max(0, 
      85 - Math.abs(speaking.wordsPerMinute - 140) * 0.5 - speaking.fillerWords * 2
    ));
    
    return Math.round((skillsAvg * 0.4 + questionsAvg * 0.4 + speakingScore * 0.2));
  }

  // Fallback methods for when API calls fail
  private generateFallbackQuestionAnalysis(question: string, response: string, id: number): QuestionAnalysis {
    const sentimentScore = this.sentiment.analyze(response);
    const baseScore = Math.max(60, Math.min(85, 75 + sentimentScore.score * 3));
    
    return {
      id,
      question,
      candidateResponse: response,
      score: baseScore,
      duration: `${Math.floor(response.length / 20)}m ${Math.floor((response.length % 20) * 3)}s`,
      strengths: ["Clear communication", "Relevant examples"],
      improvements: ["More specific details", "Stronger conclusion"],
      transcript: response,
      confidence: baseScore - 5,
      clarity: baseScore,
      relevance: baseScore - 3,
      depth: baseScore - 8
    };
  }

  private generateFallbackSkillsAssessment(): SkillAssessment[] {
    return [
      { skill: 'Technical Skills', score: 75, max: 100, reasoning: 'Demonstrates solid foundation' },
      { skill: 'Communication', score: 70, max: 100, reasoning: 'Clear and articulate responses' },
      { skill: 'Problem Solving', score: 78, max: 100, reasoning: 'Good analytical approach' },
      { skill: 'Leadership', score: 65, max: 100, reasoning: 'Some leadership examples provided' },
      { skill: 'Cultural Fit', score: 80, max: 100, reasoning: 'Aligns well with team values' },
      { skill: 'Experience', score: 72, max: 100, reasoning: 'Relevant background demonstrated' }
    ];
  }

  private generateFallbackInsights(): KeyInsight[] {
    return [
      {
        type: 'strength',
        title: 'Strong Technical Foundation',
        description: 'Demonstrates solid understanding of core concepts and best practices.',
        confidence: 85
      },
      {
        type: 'improvement',
        title: 'Communication Clarity',
        description: 'Consider structuring answers with clear beginning, middle, and end.',
        confidence: 75
      },
      {
        type: 'strength',
        title: 'Problem-Solving Approach',
        description: 'Shows systematic thinking and considers multiple solutions.',
        confidence: 80
      }
    ];
  }
}
