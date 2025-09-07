import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase"; // Import the auth service from your firebase.js
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import "./AuthButtons.css"; // <-- THIS IS THE CORRECTED LINE

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Handler for Email/Password Login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, redirect the user to the homepage
      navigate("/");
    } catch (err) {
      // Provide user-friendly error messages
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Failed to log in. Please try again later.");
      }
      console.error("Firebase login error: ", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handler for Google Sign-In ---
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      // On successful login, redirect to the homepage
      navigate("/");
    } catch (err) {
      setError("Could not sign in with Google. Please try again.");
      console.error("Google sign-in error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue your journey.</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Your Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="divider-container">
          <span className="divider-line"></span>
          <span className="divider-text">OR</span>
          <span className="divider-line"></span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="google-signin-button"
          disabled={loading}
        >
          <FaGoogle className="google-icon" />
          Sign In with Google
        </button>

        <p className="signup-link">
          Don't have an account? <Link to="/add">Register as a Student</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;