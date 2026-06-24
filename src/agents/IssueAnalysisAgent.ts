import { GeminiService } from '../services/geminiService';
import { IssueAnalysisPayload, IssueAnalysisResult } from '../types/gemini';

export const IssueAnalysisAgent = {
  name: 'Issue Triage Officer',
  description: 'Classifies issue categories, assesses public safety severity levels, and assigns city departments.',

  run: async (payload: IssueAnalysisPayload): Promise<IssueAnalysisResult> => {
    console.log(`[${IssueAnalysisAgent.name}] Triggered analysis for title: "${payload.title}"`);
    
    if (!payload.title || !payload.description) {
      throw new Error("Title and description are required for issue analysis.");
    }

    try {
      const result = await GeminiService.analyzeIssue(payload);
      console.log(`[${IssueAnalysisAgent.name}] Successfully classified issue under "${result.category}" with ${result.severity} severity.`);
      return result;
    } catch (error) {
      console.error(`[${IssueAnalysisAgent.name}] Agent failed:`, error);
      throw error;
    }
  }
};
