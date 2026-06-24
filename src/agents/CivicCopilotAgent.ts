import { GeminiService } from '../services/geminiService';
import { RoutingAgent } from './RoutingAgent';
import { ChatMessage, ChatResponse } from '../types/gemini';
import { Issue } from '../mockData';

export const CivicCopilotAgent = {
  name: 'Civic Copilot Agent',
  description: 'Orchestrates user conversation, answers queries about city services, and looks up issues.',

  respond: async (
    userMessage: string,
    history: ChatMessage[],
    issues: Issue[]
  ): Promise<ChatResponse> => {
    console.log(`[${CivicCopilotAgent.name}] Received query: "${userMessage}"`);

    // 1. Check intent via RoutingAgent
    const route = await RoutingAgent.route(userMessage, issues);
    console.log(`[${CivicCopilotAgent.name}] Route intent determined: ${route.intent} (Confidence: ${route.confidence}%)`);

    // 2. Adjust message prompt context based on intent
    let enrichedQuery = userMessage;
    if (route.intent === 'status_query' && route.targetIssueId) {
      const issue = issues.find(i => i.id.toLowerCase() === route.targetIssueId?.toLowerCase());
      if (issue) {
        enrichedQuery += `\n[Context: The user is asking about Issue ${issue.id}. Here are the details of this issue: Title: "${issue.title}", Status: "${issue.status}", Category: "${issue.category}", Address: "${issue.address}", Reported By: "${issue.reportedBy}". Answer the user's specific status inquiry using this data.]`;
      } else {
        enrichedQuery += `\n[Context: The user asked about issue ID "${route.targetIssueId}" but it was not found in the active database. Inform them politely.]`;
      }
    } else if (route.intent === 'report_guide') {
      enrichedQuery += `\n[Context: Provide step-by-step guidance on how to report an issue. Mention clicking "Report Issue" in the navigation panel, placing a pin on the map, writing a clear description, uploading a photo, letting our AI classify it, and reviewing duplicates.]`;
    }

    // 3. Assemble chat payload
    const updatedHistory: ChatMessage[] = [
      ...history,
      { role: 'user', parts: [{ text: enrichedQuery }] }
    ];

    try {
      const response = await GeminiService.chatAssistant(updatedHistory, issues);
      console.log(`[${CivicCopilotAgent.name}] Generated response of length ${response.text.length} chars.`);
      return response;
    } catch (error) {
      console.error(`[${CivicCopilotAgent.name}] Failed to generate response:`, error);
      return {
        text: "I'm having trouble connecting to the civic copilot system. Please check your network connection or verify that VITE_GEMINI_API_KEY is configured correctly.",
        suggestedFollowUps: ["How do I file a report?", "Tell me about my citizen level"]
      };
    }
  }
};
