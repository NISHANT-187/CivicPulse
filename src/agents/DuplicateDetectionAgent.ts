import { GeminiService } from '../services/geminiService';
import { DuplicateDetectionPayload, DuplicateDetectionResult } from '../types/gemini';

export const DuplicateDetectionAgent = {
  name: 'Proximity Match Inspector',
  description: 'Compares new incidents with active local reports to identify duplicate citizen filings.',

  run: async (payload: DuplicateDetectionPayload): Promise<DuplicateDetectionResult> => {
    console.log(`[${DuplicateDetectionAgent.name}] Scanning for duplicate of "${payload.newTitle}" near Lat: ${payload.newLatitude}, Lng: ${payload.newLongitude}`);

    try {
      const result = await GeminiService.detectDuplicate(payload);
      if (result.duplicate) {
        console.log(`[${DuplicateDetectionAgent.name}] Flagged DUPLICATE matching ticket ID ${result.matchedIssueId} with ${result.confidence}% confidence.`);
      } else {
        console.log(`[${DuplicateDetectionAgent.name}] No duplicate detected.`);
      }
      return result;
    } catch (error) {
      console.error(`[${DuplicateDetectionAgent.name}] Agent failed:`, error);
      return { duplicate: false, confidence: 0 };
    }
  }
};
