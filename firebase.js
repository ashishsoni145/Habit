// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7jot7SDiAFUXOx3SWP91HhMzeL6Pn81Q",
  authDomain: "habit-tracker-app-4075a.firebaseapp.com",
  projectId: "habit-tracker-app-4075a",
  storageBucket: "habit-tracker-app-4075a.firebasestorage.app",
  messagingSenderId: "484264102731",
  appId: "1:484264102731:web:c43995dd7fd6aef2bbb6ce",
  measurementId: "G-QYSTGKQCQL"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Services
const auth = firebase.auth();
const db = firebase.firestore();