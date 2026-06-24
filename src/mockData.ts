export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  role?: 'citizen' | 'official' | 'moderator';
}

export interface ActivityLog {
  id: string;
  status: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved';
  message: string;
  timestamp: string;
  actor: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  originalDescription: string;
  category: 'Infrastructure' | 'Sanitation' | 'Utilities' | 'Public Safety' | 'Environment' | 'Mobility';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved';
  latitude: number;
  longitude: number;
  address: string;
  reportedBy: string;
  reportedAt: string;
  upvotes: number;
  upvotedUsers: string[]; // List of usernames who upvoted
  comments: Comment[];
  timeline: ActivityLog[];
  imageUrl?: string;
  aiClassificationNotes?: string;
  assignedDepartment?: string;
  impactScore?: number;
  isEmergency?: boolean;
  priorityScore?: number;
  priorityReasonsJson?: string;
  resolutionPlanJson?: string;
  verificationsCount?: number;
  verificationConfidence?: number;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  points: number;
  reportsCount: number;
  resolutionsVerified: number;
  avatar: string;
  badges: string[];
}

// Initial seed data centered around San Francisco
export const INITIAL_ISSUES: Issue[] = [
  {
    id: "iss-001",
    title: "Hazardous Pedestrian Crosswalk Signal Damaged",
    originalDescription: "the walking man light is broken at 8th and market and people are almost getting run over. it's completely dead.",
    description: "The pedestrian crossing signal interface at the intersection of 8th St and Market St is non-operational (completely dark). This failure creates a severe public safety hazard for pedestrians crossing Market St, as vehicles are unaware of pedestrian crossing phases. Immediate technician dispatch is recommended.",
    category: "Public Safety",
    severity: "Critical",
    status: "in_progress",
    latitude: 37.7786,
    longitude: -122.4136,
    address: "8th St & Market St, San Francisco, CA 94103",
    reportedBy: "Alex Chen",
    reportedAt: "2026-06-22T09:30:00Z",
    upvotes: 42,
    upvotedUsers: ["user1", "user2"],
    comments: [
      {
        id: "c-101",
        author: "Sarah Jenkins",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
        content: "Nearly got hit crossing here yesterday morning. Extremely dangerous!",
        timestamp: "2026-06-22T10:15:00Z",
        role: "citizen"
      },
      {
        id: "c-102",
        author: "SF Dept of Transportation",
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=SFDOT",
        content: "Under review. Dispatch ticket #DOT-99827 has been assigned to our emergency signal repairs crew.",
        timestamp: "2026-06-22T14:05:00Z",
        role: "official"
      }
    ],
    timeline: [
      {
        id: "t-1",
        status: "reported",
        message: "Issue filed by citizen Alex Chen.",
        timestamp: "2026-06-22T09:30:00Z",
        actor: "Alex Chen"
      },
      {
        id: "t-2",
        status: "verified",
        message: "AI verified: Cross-referenced with SF-DOT database. Signal failure corroborated by traffic sensor anomalies.",
        timestamp: "2026-06-22T09:32:00Z",
        actor: "CivicPulse AI Agent"
      },
      {
        id: "t-3",
        status: "assigned",
        message: "Routed to Department of Transportation (Signal Maintenance Division).",
        timestamp: "2026-06-22T14:00:00Z",
        actor: "CivicPulse AI Agent"
      },
      {
        id: "t-4",
        status: "in_progress",
        message: "Crew dispatched to location for hardware diagnostic and signal bulb/logic board replacement.",
        timestamp: "2026-06-23T08:15:00Z",
        actor: "SF Dept of Transportation"
      }
    ],
    aiClassificationNotes: "AI Classification confidence: 99.2%. Priority boosted to Critical due to high pedestrian density and intersection traffic volume.",
    assignedDepartment: "Department of Transportation",
    impactScore: 124
  },
  {
    id: "iss-002",
    title: "Structural Street Cavity (Major Pothole)",
    originalDescription: "giant pothole in the middle lane on 16th street near valencia, cars are swerving to miss it and it's going to cause a crash",
    description: "A large, deep pothole has developed in the center lane of 16th St, approximately 50 feet east of Valencia St. The depth exceeds 5 inches, presenting a structural risk to vehicle tires/suspensions and forcing drivers to make sudden lane changes into oncoming traffic lanes.",
    category: "Infrastructure",
    severity: "High",
    status: "reported",
    latitude: 37.7650,
    longitude: -122.4218,
    address: "16th St & Valencia St, San Francisco, CA 94103",
    reportedBy: "Marcus Vance",
    reportedAt: "2026-06-23T11:45:00Z",
    upvotes: 18,
    upvotedUsers: ["user3"],
    comments: [
      {
        id: "c-201",
        author: "Dave K.",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dave",
        content: "Blew out a tire here last night! Filing a claim with the city. Be careful everyone.",
        timestamp: "2026-06-23T13:20:00Z",
        role: "citizen"
      }
    ],
    timeline: [
      {
        id: "t-1",
        status: "reported",
        message: "Issue filed by citizen Marcus Vance.",
        timestamp: "2026-06-23T11:45:00Z",
        actor: "Marcus Vance"
      },
      {
        id: "t-2",
        status: "verified",
        message: "AI verified: Photographic evidence matches geometric criteria for deep asphalt deterioration.",
        timestamp: "2026-06-23T11:46:12Z",
        actor: "CivicPulse AI Agent"
      }
    ],
    aiClassificationNotes: "AI Classification confidence: 95.8%. Proximity search indicates no active duplicates. Routing suggested: Public Works Department.",
    assignedDepartment: "Public Works Department",
    impactScore: 56
  },
  {
    id: "iss-003",
    title: "Sanitation Overflow in Public Recreational Space",
    originalDescription: "trash is spilling everywhere at dolores park near the playground, garbage bins are completely full and crows are ripping bags apart",
    description: "Multiple public municipal garbage receptacles located in the northeast quadrant of Dolores Park, specifically adjacent to the children's playground area, have reached capacity and are overflowing. Detached trash bags and loose debris are scattered, creating sanitary concerns and attracting scavenger wildlife.",
    category: "Sanitation",
    severity: "Medium",
    status: "resolved",
    latitude: 37.7602,
    longitude: -122.4265,
    address: "Mission Dolores Park, San Francisco, CA 94114",
    reportedBy: "Priya Sharma",
    reportedAt: "2026-06-21T14:10:00Z",
    upvotes: 29,
    upvotedUsers: [],
    comments: [
      {
        id: "c-301",
        author: "Priya Sharma",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
        content: "Thanks for fixing this so quickly! The park looks much cleaner now.",
        timestamp: "2026-06-22T11:00:00Z",
        role: "citizen"
      }
    ],
    timeline: [
      {
        id: "t-1",
        status: "reported",
        message: "Issue filed by citizen Priya Sharma.",
        timestamp: "2026-06-21T14:10:00Z",
        actor: "Priya Sharma"
      },
      {
        id: "t-2",
        status: "verified",
        message: "AI verified: Visual validation confirms bin overflow and debris scatter.",
        timestamp: "2026-06-21T14:12:00Z",
        actor: "CivicPulse AI Agent"
      },
      {
        id: "t-3",
        status: "assigned",
        message: "Assigned to Recreation and Parks Maintenance Crew.",
        timestamp: "2026-06-21T15:30:00Z",
        actor: "CivicPulse AI Agent"
      },
      {
        id: "t-4",
        status: "in_progress",
        message: "Sanitation team scheduled for immediate weekend sweep.",
        timestamp: "2026-06-21T16:00:00Z",
        actor: "Rec & Parks Dept"
      },
      {
        id: "t-5",
        status: "resolved",
        message: "Receptacles emptied and surrounding lawn cleared. Proof photo uploaded by crew.",
        timestamp: "2026-06-22T09:45:00Z",
        actor: "Rec & Parks Dept"
      }
    ],
    aiClassificationNotes: "AI Classification confidence: 98.7%. Automated assignment triggered to Rec & Parks based on geo-fenced coordinates of Dolores Park.",
    assignedDepartment: "Recreation & Parks Department",
    impactScore: 68
  },
  {
    id: "iss-004",
    title: "Illegal E-Waste Disposal",
    originalDescription: "someone dumped a bunch of computer monitors and old televisions under the highway overpass at division st. looks like a commercial dump.",
    description: "An illegal dump site consisting of electronic waste, including approximately 12 cathode-ray tube (CRT) monitors, multiple flat-screen televisions, and bulk wiring, has been deposited under the Highway 101 overpass on Division St. This hazardous material is exposed to the elements, raising toxic runoff concerns.",
    category: "Environment",
    severity: "High",
    status: "reported",
    latitude: 37.7698,
    longitude: -122.4082,
    address: "Division St & San Bruno Ave, San Francisco, CA 94103",
    reportedBy: "Tomás Ortega",
    reportedAt: "2026-06-24T06:15:00Z",
    upvotes: 9,
    upvotedUsers: [],
    comments: [],
    timeline: [
      {
        id: "t-1",
        status: "reported",
        message: "Issue filed by citizen Tomás Ortega.",
        timestamp: "2026-06-24T06:15:00Z",
        actor: "Tomás Ortega"
      },
      {
        id: "t-2",
        status: "verified",
        message: "AI verified: Image signature matches list of banned electronic components. Environmental hazard rating: Elevated.",
        timestamp: "2026-06-24T06:18:10Z",
        actor: "CivicPulse AI Agent"
      }
    ],
    aiClassificationNotes: "AI Classification confidence: 94.1%. Flagged for Environmental Protection Agency hazardous team due to heavy metal content in CRTs.",
    assignedDepartment: "Environmental Protection Department",
    impactScore: 33
  },
  {
    id: "iss-005",
    title: "Commercial Streetlamp Outage",
    originalDescription: "light is completely out in front of the coffee shop on market st, making the block super dark and creepy at night",
    description: "The municipal street lighting fixture located in front of 982 Market Street is non-operational. The resulting darkness on this high-foot-traffic commercial stretch of Market St diminishes community safety and visibility for businesses operating evening hours.",
    category: "Utilities",
    severity: "Low",
    status: "resolved",
    latitude: 37.7825,
    longitude: -122.4095,
    address: "982 Market St, San Francisco, CA 94102",
    reportedBy: "Clara Oswald",
    reportedAt: "2026-06-20T21:40:00Z",
    upvotes: 11,
    upvotedUsers: [],
    comments: [
      {
        id: "c-501",
        author: "Market St Coffee",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Coffee",
        content: "Awesome, the bulb was replaced this afternoon. Dark alley vibe is gone!",
        timestamp: "2026-06-21T18:30:00Z",
        role: "citizen"
      }
    ],
    timeline: [
      {
        id: "t-1",
        status: "reported",
        message: "Issue filed by citizen Clara Oswald.",
        timestamp: "2026-06-20T21:40:00Z",
        actor: "Clara Oswald"
      },
      {
        id: "t-2",
        status: "verified",
        message: "AI verified: Cross-checked with grid power telemetry; bulb filament breakage suspected.",
        timestamp: "2026-06-20T21:42:00Z",
        actor: "CivicPulse AI Agent"
      },
      {
        id: "t-3",
        status: "assigned",
        message: "Assigned to SF-PUC (Power & Water Utilities).",
        timestamp: "2026-06-20T23:00:00Z",
        actor: "CivicPulse AI Agent"
      },
      {
        id: "t-4",
        status: "in_progress",
        message: "Technician dispatched to replace bulb assembly.",
        timestamp: "2026-06-21T09:00:00Z",
        actor: "SF Water Power Sewer"
      },
      {
        id: "t-5",
        status: "resolved",
        message: "Standard LED fixture bulb replaced and photometer test passed.",
        timestamp: "2026-06-21T16:15:00Z",
        actor: "SF Water Power Sewer"
      }
    ],
    aiClassificationNotes: "AI Classification confidence: 97.6%. Routed to Public Utilities Commission.",
    assignedDepartment: "Public Utilities Commission",
    impactScore: 23
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    username: "Alex Chen",
    points: 1250,
    reportsCount: 24,
    resolutionsVerified: 12,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    badges: ["Pothole Patrol", "First Responder", "Local Hero", "Detail Oriented"]
  },
  {
    rank: 2,
    username: "Priya Sharma",
    points: 980,
    reportsCount: 17,
    resolutionsVerified: 8,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    badges: ["Green Guardian", "Clean Street Crusader", "Local Hero"]
  },
  {
    rank: 3,
    username: "Tomás Ortega",
    points: 850,
    reportsCount: 15,
    resolutionsVerified: 5,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ortega",
    badges: ["Eco Warrior", "Active Voice"]
  },
  {
    rank: 4,
    username: "Clara Oswald",
    points: 720,
    reportsCount: 11,
    resolutionsVerified: 7,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Clara",
    badges: ["Night Watch", "Spotter"]
  },
  {
    rank: 5,
    username: "Sarah Jenkins",
    points: 640,
    reportsCount: 9,
    resolutionsVerified: 4,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
    badges: ["Safety First", "Supporter"]
  }
];


