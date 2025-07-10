import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'InterviewAI',
  pageTitle: 'Voice Assistant',
  pageDescription: 'A voice assistant for interviews',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,

  logo: '', // Removed LiveKit logo
  accent: '#002cf2',
  logoDark: '', // Removed LiveKit logo
  accentDark: '#1fd5f9',
  startButtonText: 'Start call',
};
