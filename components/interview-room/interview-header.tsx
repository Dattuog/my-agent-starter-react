// components/interview-room/interview-header.tsx
'use client';

import Link from 'next/link';

interface InterviewHeaderProps {
  participantName: string;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export function InterviewHeader({ participantName, onMenuToggle, isMobileMenuOpen }: InterviewHeaderProps) {
  // REMOVE HEADER: Remove InterviewAI logo, avatar, and mobile menu button for a full-window meeting experience
  // The header is intentionally removed for a full-window meeting experience. This component returns null.
  return null;
}