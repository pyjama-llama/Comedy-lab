
export interface LaughterEvent {
  timestamp: string;
  setup: string;
  intensity: number; // 1 to 10
  reactionType: string; // e.g., "Chuckle", "Guffaw", "Roar", "Applause"
}

export interface AnalysisResult {
  summary: string;
  laughterEvents: LaughterEvent[];
  deliveryInsights: string[];
  overallEngagementScore: number;
  topPerformingJoke: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
