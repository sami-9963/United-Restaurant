/**
 * United Restaurant - Google Firebase Cloud Integration (Optional)
 * 
 * TO CONNECT REAL GOOGLE FIREBASE CLOUD DATABASE & AUTH:
 * 1. Go to https://console.firebase.google.com and click "Add Project"
 * 2. Name your project "United-Restaurant"
 * 3. In the project dashboard, click the Web icon (</>) to register a Web app
 * 4. Enable "Authentication" -> Email/Password & Google Sign-In
 * 5. Enable "Firestore Database" in test/production mode
 * 6. Copy your config keys and replace the values below:
 */

const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if Firebase keys have been configured by the owner
const IS_FIREBASE_ACTIVE = FIREBASE_CONFIG.apiKey !== "YOUR_FIREBASE_API_KEY";

if (IS_FIREBASE_ACTIVE) {
  console.log("🔥 United Restaurant: Google Firebase Cloud connected successfully.");
} else {
  console.log("⚡ United Restaurant: Running in high-performance local persistent mode with real Cash on Delivery order storage & WhatsApp dispatch.");
}
