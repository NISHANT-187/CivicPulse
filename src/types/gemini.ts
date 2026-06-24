import { Issue } from '../mockData';

export interface IssueAnalysisPayload {
  title: string;
  description: string;
  imageB64?: string; // base64 string
  imageMimeType?: string; // e.g. image/jpeg, image/png
}

export interface IssueAnalysisResult {
  category: 'Infrastructure' | 'Sanitation' | 'Utilities' | 'Public Safety' | 'Environment' | 'Mobility';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  department: string;
  summary: string;
  suggestedTitle: string;
  resolutionPriority: 'Low' | 'Medium' | 'High' | 'Immediate';
  confidence: number; // 0 to 100
  aiClassificationNotes: string;
  isEmergency?: boolean;
  priorityScore?: number;
  complexity?: 'Low' | 'Medium' | 'High';
  resolutionWindow?: string;
  requiredResources?: string[];
}

export interface DuplicateDetectionPayload {
  newTitle: string;
  newDescription: string;
  newLatitude: number;
  newLongitude: number;
  newCategory: string;
  existingIssues: Issue[];
}

export interface DuplicateDetectionResult {
  duplicate: boolean;
  confidence: number; // 0 to 100
  matchedIssueId?: string;
  reason?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatResponse {
  text: string;
  suggestedFollowUps?: string[];
}

export interface GeminiError {
  message: string;
  code?: number;
}
