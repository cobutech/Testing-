// Import the Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration (replace with your project details)
const firebaseConfig = {
  apiKey: "AIzaSyCmk6NU1uiCnb6syjOmgTjpq5qBP5QyQAY",
  authDomain: "cobu-tech-portal.firebaseapp.com",
  projectId: "cobu-tech-portal",
  storageBucket: "cobu-tech-portal.firebasestorage.app",
  messagingSenderId: "61919067593",
  appId: "1:61919067593:web:5a60042df8622d6edb3c18",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to handle Google Sign-In
const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Get the ID token
    const idToken = await user.getIdToken();

    // Send the ID token to the backend
    const response = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Sign-in successful!");
      console.log("User Data:", data.user);
    } else {
      alert("Sign-in failed: " + data.message);
    }
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
  }
};

// Attach the function to a button
document.getElementById("google-signin-btn").addEventListener("click", googleSignIn);