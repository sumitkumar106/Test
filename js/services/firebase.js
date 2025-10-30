// Firebase initialization

// Initialize Firebase with config
try {
  firebase.initializeApp(CONFIG.firebase);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Get Firestore and Auth instances
const db = firebase.firestore();
const auth = firebase.auth();

// Export for other modules (attach to window for global access)
window.firebaseDB = db;
window.firebaseAuth = auth;

// Enable offline persistence for better UX
db.enablePersistence()
  .then(() => {
    console.log('Firestore offline persistence enabled');
  })
  .catch((error) => {
    if (error.code === 'failed-precondition') {
      console.warn('Firestore persistence: Multiple tabs open');
    } else if (error.code === 'unimplemented') {
      console.warn('Firestore persistence: Browser not supported');
    }
  });

// Optional: Sign in anonymously for guest mode
auth.signInAnonymously()
  .then(() => {
    console.log('Signed in anonymously');
  })
  .catch((error) => {
    console.error('Anonymous auth error:', error);
  });

// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User authenticated:', user.uid);
    window.currentUser = user;
  } else {
    console.log('No user authenticated');
    window.currentUser = null;
  }
});
