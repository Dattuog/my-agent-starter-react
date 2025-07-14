# Audio Recording & Analysis Integration Guide

This guide explains how to set up and use the real-time audio recording and analysis features integrated into your InterviewAI application.

## Overview

The audio analysis system provides real-time insights into participant speech patterns including:
- **Pitch Detection**: Fundamental frequency analysis
- **Volume Monitoring**: RMS volume calculation and silence detection  
- **Confidence Scoring**: Voice stability and clarity assessment
- **Emotion Detection**: Basic emotional state classification
- **Speaking Rate**: Words-per-minute estimation
- **Voice Quality Metrics**: Comprehensive analysis dashboard

## Architecture

```
Frontend (NextJS)           Backend (Python)
├── AudioRecordingManager   ├── Audio Analysis Server (Port 8000)
├── AudioAnalysisDisplay    ├── LiveKit Egress Management
├── Interview Room          ├── WebSocket Audio Streaming
└── Insights Dashboard      └── Real-time ML Processing
```

## Prerequisites

### Backend Setup
Your Python backend should be running with these components:
```bash
# Install required packages
pip install livekit-api fastapi uvicorn websockets numpy

# Start the audio analysis server
python audio_analysis_server_simple.py
```

### Environment Variables
Ensure your `.env.local` includes:
```bash
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

## Features Integrated

### 1. Audio Recording Manager
**Location**: `components/audio/AudioRecordingManager.tsx`

**Features**:
- Detects available audio tracks from participants
- Starts/stops recording sessions via Python backend
- Real-time WebSocket connection for analysis updates
- Visual feedback for recording status
- Graceful degradation when backend is unavailable

### 2. Real-time Analysis Display
**Location**: `components/audio/AudioAnalysisDisplay.tsx`

**Features**:
- Live voice metrics visualization
- Confidence, pitch, volume, and speaking rate charts
- Voice quality indicators
- Speaking pattern analysis
- Emotion detection display

### 3. Interview Room Integration
**Location**: `components/interview-room/interview-room-layout.tsx`

**Features**:
- Audio recording toggle button in control bar
- Floating audio analysis panel
- Session data collection for insights dashboard
- Non-intrusive overlay design

### 4. Enhanced Insights Dashboard
**Location**: `components/interview-room/InterviewCompletedPage.tsx`

**Features**:
- New "Voice Analysis" tab when audio data available
- Comprehensive voice metrics dashboard
- Integration with existing interview insights
- Data persistence via sessionStorage

## How to Use

### For Interviewers

1. **Start Interview Session**
   - Join the interview room as normal
   - Look for the audio analysis toggle button (Activity icon) in the control bar

2. **Enable Audio Recording**
   - Click the Activity button to show the audio recording panel
   - The panel appears in the top-right corner
   - Green indicator shows when analysis server is connected

3. **Start Recording**
   - Available audio tracks are automatically detected
   - Click "Start Recording" for candidate's audio track
   - Real-time analysis begins immediately

4. **Monitor Analysis**
   - View live metrics: volume, pitch, confidence, emotion
   - Watch for speaking patterns and voice quality
   - Data is collected throughout the session

5. **Complete Interview**
   - Click "End Call" to finish the interview
   - Audio analysis data is automatically saved
   - Redirected to enhanced insights dashboard

### For Candidates

The audio recording is completely transparent:
- No additional setup required
- Interview experience remains unchanged
- Audio analysis happens in background
- Can see insights in final dashboard (if enabled)

## Backend API Endpoints

The frontend communicates with these backend endpoints:

### Health Check
```
GET http://localhost:8000/health
```

### Start Recording
```
POST http://localhost:8000/start-audio-recording
{
  "room_name": "interview-room",
  "track_id": "TR_123...",
  "participant_identity": "candidate-456"
}
```

### Stop Recording
```
POST http://localhost:8000/stop-audio-recording
{
  "egress_id": "EG_789..."
}
```

### WebSocket Analysis Stream
```
WS http://localhost:8000/ws/audio-analysis/{session_id}
```

## Data Flow

1. **Recording Initiation**
   ```
   Frontend → POST /start-audio-recording → Backend
   Backend → LiveKit Egress API → Start Track Egress
   Backend → WebSocket Connection → Real-time Audio Stream
   ```

2. **Real-time Analysis**
   ```
   LiveKit → WebSocket → Python Analysis Server
   Analysis Server → ML Processing → Voice Metrics
   WebSocket → Frontend → Live Dashboard Updates
   ```

3. **Session Completion**
   ```
   Frontend → End Call Button → Store Analysis Data
   Frontend → Navigation → Insights Dashboard
   Dashboard → Load Analysis Data → Voice Analysis Tab
   ```

## Technical Implementation

### LiveKit Token Generation
Enhanced with recording permissions:
```typescript
// api/livekit-token/route.ts
token.addGrant({
  room,
  roomJoin: true,
  canPublish: true,
  canSubscribe: true,
  roomRecord: true,  // Required for egress
  roomAdmin: true,   // Required for managing egress
});
```

### Session Data Management
```typescript
// Store analysis data when ending call
sessionStorage.setItem('audioAnalysisData', JSON.stringify(analysisData));

// Load in insights dashboard
useEffect(() => {
  const storedData = sessionStorage.getItem('audioAnalysisData');
  if (storedData) {
    setAudioAnalysisData(JSON.parse(storedData));
  }
}, []);
```

### Error Handling
- Graceful degradation when backend unavailable
- Visual indicators for connection status
- Fallback to regular interview flow if recording fails
- Clear error messages for troubleshooting

## Troubleshooting

### Backend Connection Issues
1. Verify Python server is running on port 8000
2. Check firewall settings
3. Ensure LiveKit credentials are correct
4. Look for CORS issues in browser console

### Recording Not Starting
1. Verify participant has audio track published
2. Check LiveKit token has recording permissions
3. Ensure egress is enabled on LiveKit server
4. Review backend logs for errors

### Analysis Data Missing
1. Confirm WebSocket connection is established
2. Check sessionStorage for data persistence
3. Verify audio analysis server is processing correctly
4. Review browser console for errors

## Performance Considerations

- Audio analysis runs at ~10 FPS to balance accuracy and performance
- WebSocket connections are automatically managed
- Analysis data is limited to last 200 frames to prevent memory issues
- Background processing doesn't impact interview video quality

## Security & Privacy

- Audio data is streamed in real-time, not permanently stored
- Analysis results can be optionally saved or discarded
- All communication uses secure WebSocket connections
- Complies with existing LiveKit security model

## Future Enhancements

Planned improvements:
1. **Advanced ML Models**: Integration with emotion recognition APIs
2. **Batch Analysis**: Post-interview processing for detailed reports  
3. **Custom Metrics**: Configurable analysis parameters
4. **Export Features**: PDF reports with voice analysis
5. **Comparative Analysis**: Benchmarking against interview standards

## Support

For issues with the audio recording integration:
1. Check backend server logs for detailed error messages
2. Verify LiveKit egress configuration
3. Test with minimal audio recording setup
4. Review browser network tab for API call failures

The audio recording system is designed to enhance the interview experience without disrupting the core functionality. If any issues occur, the interview can continue normally without the audio analysis features.
