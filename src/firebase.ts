import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

// Standard Firebase config - reads from Vite env variables or falls back gracefully
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "civicpulse-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "civicpulse-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "civicpulse-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "12345678",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:12345678:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Live Firestore Sync Real-time Listener
 */
export const listenToIssues = (callback: (issues: any[]) => void, mockFallbackIssues: any[]) => {
  const isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY;

  if (isMockMode) {
    console.log("[Firestore Listener Mock] Running mock collection listeners.");
    callback(mockFallbackIssues);
    return () => {}; // No-op unsubscribe
  }

  try {
    const issuesCollection = collection(db, 'issues');
    return onSnapshot(issuesCollection, (snapshot: any) => {
      const issuesList: any[] = [];
      snapshot.forEach((doc: any) => {
        issuesList.push({ id: doc.id, ...doc.data() });
      });
      if (issuesList.length > 0) {
        callback(issuesList);
      }
    }, (error: any) => {
      console.warn("Firestore listener failed. Falling back to local data:", error);
      callback(mockFallbackIssues);
    });
  } catch (error) {
    console.error("Firestore connection failed. Using fallback:", error);
    callback(mockFallbackIssues);
    return () => {};
  }
};
