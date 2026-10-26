/**
 * United Restaurant - Google Firebase Cloud Integration
 * Project: United-Restaurant (united-restaurant-73d22)
 * Live Realtime Cloud Firestore Database & Cloud Sync
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBWpm-9WoB0CQ__vi08Ejw-bM6WlojjLNE",
  authDomain: "united-restaurant-73d22.firebaseapp.com",
  projectId: "united-restaurant-73d22",
  storageBucket: "united-restaurant-73d22.firebasestorage.app",
  messagingSenderId: "242267323436",
  appId: "1:242267323436:web:5b43def154ed4112e9a589",
  measurementId: "G-HS04X8QSPN"
};

let urDb = null;
let isFirebaseActive = false;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    urDb = firebase.firestore();
    isFirebaseActive = true;
    console.log("🔥 United Restaurant: Google Firebase Cloud connected successfully! (Project: united-restaurant-73d22)");
  }
} catch (e) {
  console.warn("Firebase initialization note:", e);
}

window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.urDb = urDb;
window.isFirebaseActive = isFirebaseActive;
