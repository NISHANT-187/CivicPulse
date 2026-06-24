import { Issue } from '../mockData';

export interface RouteResult {
  intent: 'report_guide' | 'status_query' | 'general_chat';
  targetIssueId?: string;
  extractedKeywords?: string;
  confidence: number;
}

export const RoutingAgent = {
  name: 'Intent Router Agent',
  description: 'Analyzes incoming chat inquiries and routes to specialized handling sub-modules.',

  route: async (userInput: string, issues: Issue[]): Promise<RouteResult> => {
    console.log(`[${RoutingAgent.name}] Routing input: "${userInput}"`);

    const systemPrompt = `You are a triage routing agent for a municipal assistance system. Analyze the user's text and categorize their intent into one of:
1. "report_guide": user wants to know how to file a ticket, complains about an active issue they want to file, or asks how reporting works.
2. "status_query": user is asking about the status of a specific issue, referencing an ID (like "iss-001" or similar) or looking up a specific problem they reported.
3. "general_chat": general questions about city ordinances, civic points, leaderboard, department details, greetings, or other chit-chat.

Also, try to extract any ticket ID mentioned (e.g. "iss-001", "DOT-99827", etc.) and matching search terms.
Return a JSON object with:
- intent: exactly "report_guide", "status_query", or "general_chat"
- targetIssueId: string (or null if none found)
- extractedKeywords: string representing subject of inquiry (or null)
- confidence: integer from 0 to 100`;

    const userPrompt = `Inquiry: "${userInput}"
Existing local issue IDs in system: ${issues.map(i => i.id).join(', ')}`;

    try {
      // Use Vite env check to call Gemini or fallback
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback for offline mode or missing keys
        const textLower = userInput.toLowerCase();
        if (textLower.includes("report") || textLower.includes("file") || textLower.includes("how do i")) {
          return { intent: 'report_guide', confidence: 90 };
        }
        const match = textLower.match(/iss-\d+/);
        if (match) {
          return { intent: 'status_query', targetIssueId: match[0], confidence: 95 };
        }
        return { intent: 'general_chat', confidence: 80 };
      }

      // Wait, we need to make sure the JSON parsing handles the route.
      // Let's do a direct call to callGemini for routing. Let's make an internal helper or just query:
      const rawRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `System Instructions: ${systemPrompt}\nUser Query: ${userPrompt}` }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (!rawRes.ok) {
        throw new Error("Routing API error");
      }

      const resJson = await rawRes.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("No response");

      const parsed: RouteResult = JSON.parse(text);
      return parsed;
    } catch (error) {
      console.warn(`[${RoutingAgent.name}] Routing failed, falling back to heuristic:`, error);
      const textLower = userInput.toLowerCase();
      if (textLower.includes("report") || textLower.includes("file") || textLower.includes("how do i")) {
        return { intent: 'report_guide', confidence: 80 };
      }
      const match = textLower.match(/iss-\d+/);
      if (match) {
        return { intent: 'status_query', targetIssueId: match[0], confidence: 90 };
      }
      return { intent: 'general_chat', confidence: 70 };
    }
  }
};
