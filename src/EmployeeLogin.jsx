import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "./assets/logo.png";
import "./Login.css";
import { db, auth } from "./config/firebase"; // Make sure to import auth
import { signInWithEmailAndPassword } from "firebase/auth"; // Import signInWithEmailAndPassword
import { getDocs, query, where, collection } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { useAuth } from "./AuthProvider";
const notify = (message, id, type = "error") => {
  if (!toast.isActive(id)) {
    if (type === "error") {
      toast.error(message, { toastId: id });
    } else if (type === "success") {
      toast.success(message, { toastId: id });
    }
  }
};

const EmployeeLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const { setIsAuthenticated } = useAuth();
  const [remainingTime, setRemainingTime] = useState(0); // State for remaining time

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmployeeEmail");
    if (storedEmail) {
      setEmail(storedEmail);
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
      notify(
        "Too many failed attempts. Please try again later.",
        "too_many_attempts"
      ); // Toast for too many attempts
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if the user exists in Firestore
      const q = query(collection(db, "accounts"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User exists in Firestore, proceed to navigate
        localStorage.setItem("rememberedEmployeeEmail", email);
        localStorage.setItem("employeeDocId", querySnapshot.docs[0].id);
        setIsAuthenticated(true); // Store the document ID
        notify("Login successful! Redirecting...", "login-success", "success");
        setTimeout(() => {
          navigate(
            "/employee-dashboard",
            { replace: true },
            {
              state: { employeeDocId: querySnapshot.docs[0].id },
            }
          );
        }, 2000);
        return;
      } else {
        // User does not exist in Firestore
        handleFailedAttempt();
      }
    } catch (error) {
      setIsLoading(false);
      handleFailedAttempt();
      console.error("Error signing in:", error);
    }
  };

  const handleFailedAttempt = () => {
    setIsLoading(false);
    setAttempts((prevAttempts) => {
      const newAttempts = prevAttempts + 1;
      if (newAttempts >= 3) {
        setIsLocked(true);

        notify(
          "Too many failed attempts. Please try again later.",
          "too_many_attempts"
        ); // Toast for too many attempts
      } else {
        notify(
          "Invalid email or password. Please try again.",
          "invalid_credentials"
        ); // Toast for invalid credentials
      }
      return newAttempts;
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
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
          Employee Login
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
        <p className="text-center mt-4 text-sm text-gray-600">
          Admin?{" "}
          <Link to="/" className="text-brown-500 hover:underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
