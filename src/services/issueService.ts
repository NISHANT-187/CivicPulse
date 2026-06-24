import { Issue } from '../mockData';

const BASE_URL = 'http://localhost:8080/api/issues';

export const IssueService = {
  /**
   * Fetch all issues from Spring Boot MySQL database
   */
  getIssues: async (fallbackIssues: Issue[]): Promise<Issue[]> => {
    try {
      const response = await fetch(BASE_URL);
      if (!response.ok) {
        throw new Error(`Failed to load issues: ${response.status}`);
      }
      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        // Make sure date formats are correct
        reportedAt: item.reportedAt || new Date().toISOString(),
        upvotedUsers: item.upvotedUsers || [],
        comments: item.comments || [],
        timeline: item.timeline || []
      }));
    } catch (error) {
      console.warn("Spring Boot backend offline. Using fallback issues:", error);
      return fallbackIssues;
    }
  },

  /**
   * Post new issue report to Spring Boot MySQL database & push to Firestore
   */
  createIssue: async (issuePayload: any): Promise<Issue> => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(issuePayload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save issue: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Backend error creating issue. Saving in local fallback mode:", error);
      // Fallback local issue generation
      const mockId = `iss-${Math.floor(Math.random() * 900) + 100}`;
      return {
        ...issuePayload,
        id: mockId,
        status: 'reported',
        reportedAt: new Date().toISOString(),
        upvotes: 1,
        upvotedUsers: [issuePayload.reportedBy || 'citizen'],
        comments: [],
        timeline: [
          {
            id: `t-rep-${Date.now()}`,
            status: 'reported',
            message: `Ticket opened by citizen ${issuePayload.reportedBy}. Local fallback triaged.`,
            timestamp: new Date().toISOString(),
            actor: issuePayload.reportedBy
          }
        ],
        impactScore: 20
      };
    }
  },

  /**
   * Patch issue status in Spring Boot MySQL database & trigger FCM notifications
   */
  updateIssueStatus: async (id: string, newStatus: string, _officerName: string): Promise<Issue> => {
    try {
      // If mock ID, don't ping backend
      if (id.startsWith('iss-') && parseInt(id.split('-')[1]) > 99) {
        // Mock fallback update
        return {
          id,
          status: newStatus as any
        } as any;
      }

      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Patch status failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Backend error patching status:", error);
      throw error;
    }
  },

  /**
   * Increment community verification count on Spring Boot backend
   */
  verifyIssue: async (id: string): Promise<Issue> => {
    try {
      const response = await fetch(`${BASE_URL}/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Verification post failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Backend error during verify post:", error);
      throw error;
    }
  }
};
