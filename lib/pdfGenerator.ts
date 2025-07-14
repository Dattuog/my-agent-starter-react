import jsPDF from 'jspdf';
import type { ReceivedChatMessage } from '@livekit/components-react';

interface TranscriptOptions {
  roomName?: string;
  participantName?: string;
  date?: Date;
}

export function generateTranscriptPDF(
  messages: ReceivedChatMessage[],
  options: TranscriptOptions = {}
) {
  const {
    roomName = 'Interview Room',
    participantName = 'Candidate',
    date = new Date()
  } = options;

  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set up document properties
  doc.setProperties({
    title: 'Interview Transcript',
    subject: `Interview transcript for ${participantName}`,
    author: 'InterviewAI',
    creator: 'InterviewAI Platform'
  });

  // Document styling
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let currentY = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number) => {
    return doc.splitTextToSize(text, maxWidth);
  };

  // Add header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Interview Transcript', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Add interview details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Room: ${roomName}`, margin, currentY);
  currentY += lineHeight;
  doc.text(`Participant: ${participantName}`, margin, currentY);
  currentY += lineHeight;
  doc.text(`Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, margin, currentY);
  currentY += lineHeight * 2;

  // Add separator line
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight * 2;

  // Process messages
  if (messages.length === 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.text('No messages in this conversation.', pageWidth / 2, currentY, { align: 'center' });
  } else {
    messages.forEach((message, index) => {
      const isFromUser = message.from?.name === participantName || message.from?.identity === participantName;
      const isFromAI = message.from?.name === 'Assistant' || message.from?.name === 'AI Interviewer';
      
      // Determine speaker name
      let speakerName = 'Unknown';
      if (isFromAI) {
        speakerName = 'AI Interviewer';
      } else if (isFromUser) {
        speakerName = participantName;
      } else {
        speakerName = message.from?.name || message.from?.identity || 'Unknown';
      }

      // Format timestamp
      const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      // Check if we need a new page for this message
      checkPageBreak(lineHeight * 4);

      // Add speaker and timestamp
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const speakerColor = isFromAI ? [0, 123, 255] : isFromUser ? [40, 167, 69] : [108, 117, 125];
      doc.setTextColor(speakerColor[0], speakerColor[1], speakerColor[2]);
      doc.text(`${speakerName} [${timestamp}]`, margin, currentY);
      currentY += lineHeight;

      // Add message content
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0); // Black color for message text
      const wrappedText = wrapText(message.message, pageWidth - (margin * 2));
      
      wrappedText.forEach((line: string) => {
        checkPageBreak(lineHeight);
        doc.text(line, margin + 5, currentY);
        currentY += lineHeight;
      });

      currentY += lineHeight / 2; // Add small space between messages

      // Add separator between messages (except for the last one)
      if (index < messages.length - 1) {
        checkPageBreak(lineHeight);
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(8);
        doc.text('─'.repeat(50), margin, currentY);
        currentY += lineHeight;
        doc.setTextColor(0, 0, 0);
      }
    });
  }

  // Add footer to each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    
    // Page number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Generated timestamp
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 
      margin, pageHeight - 10);
  }

  // Generate filename
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
  const filename = `Interview_Transcript_${participantName}_${dateStr}_${timeStr}.pdf`;

  // Download the PDF
  doc.save(filename);
}
