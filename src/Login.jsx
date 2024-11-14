import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "./assets/logo.png";
import "./Login.css";
import { auth } from "./config/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";

import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const notify = (message, id, type = "error") => {
  if (!toast.isActive(id)) {
    if (type === "error") {
      toast.error(message, { toastId: id });
    } else if (type === "success") {
      toast.success(message, { toastId: id });
    }
  }
};

const Login = () => {
  const navigate = useNavigate();
  const db = getFirestore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0); // State for remaining time

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (isLocked) {
      setRemainingTime(10 * 60); // Set remaining time to 10 minutes in seconds
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup timer on component unmount
    }
  }, [isLocked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      notify("Too many failed attempts. Please try again later.", "locked");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const adminDocRef = doc(db, "admin", user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        throw new Error("You are not authorized to access!");
      }

      setIsLoading(false);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      notify("Login successful! Redirecting...", "login-success", "success");

      // Delay navigation for the success toast
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      setAttempts((prevAttempts) => {
        const newAttempts = prevAttempts + 1;
        if (newAttempts >= 3) {
          setIsLocked(true);
          notify("Too many failed attempts. Please try again later.", "locked");
        } else {
          notify(
            error.message || "Invalid email or password. Please try again.",
            "login_error"
          );
        }
        return newAttempts;
      });
      console.error("Error signing in:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleRememberMe = () => {
    setRememberMe((prevRememberMe) => !prevRememberMe);
  };
  const handleForgotPassword = async () => {
    if (!email) {
      notify("Please enter your email address.", "empty_email");
      return;
    }

    try {
      // Create a query to find the admin document with the matching email
      const adminQuery = query(
        collection(db, "admin"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(adminQuery);

      if (querySnapshot.empty) {
        setError("This email is not associated with any account.");
        return;
      }

      // If we found the document, send the password reset email
      await sendPasswordResetEmail(auth, email);
      notify(
        "Password reset email sent! Please check your inbox.",
        "reset_email_success",
        "success"
      );
    } catch (error) {
      notify(
        error.message || "Failed to send password reset email.",
        "reset_email_error"
      );
      console.error("Error sending password reset email:", error);
    }
  };

  // Convert remaining time in seconds to minutes and seconds format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-brown-500 to-brown-300">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-20 w-auto" />
        </div>
        <h2 className="text-3xl mb-4 text-center font-bold text-brown-500">
          Login Now
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-brown-400 focus:ring focus:ring-brown-200 focus:ring-opacity-50"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-brown-400 focus:ring focus:ring-brown-200 focus:ring-opacity-50 pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 pt-5 flex items-center"
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-500" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={handleRememberMe}
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div>
          {isLocked && (
            <p className="text-sm text-gray-600">
              Locked! Try again in {formatTime(remainingTime)}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-brown-500 text-white py-2 px-4 rounded-md hover:bg-brown-600 focus:outline-none focus:bg-brown-600 relative"
            disabled={isLoading || isLocked}
          >
            {isLoading && <div className="loading-spinner"></div>}
            {isLocked
              ? "Locked for 10 minutes"
              : isLoading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Employee?{" "}
            <Link
              to="/employee-login"
              className="text-brown-500 hover:underline"
            >
              Login Here
            </Link>
          </p>
          <button
            onClick={handleForgotPassword}
            className="text-brown-500 hover:underline mt-2"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
