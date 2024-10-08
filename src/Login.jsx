import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link from react-router-dom
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "./assets/logo.png";
import "./Login.css";
import { auth } from "./config/firebase"; // Import Firebase authentication
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Firebase sign in method
      await signInWithEmailAndPassword(auth, email, password);

      setIsLoading(false);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/dashboard"); // Redirect upon successful login
    } catch (error) {
      setIsLoading(false);
      setError("Invalid email or password. Please try again.");
      console.error("Error signing in:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleRememberMe = () => {
    setRememberMe((prevRememberMe) => !prevRememberMe);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-brown-500 to-brown-400">
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brown-500 text-white py-2 px-4 rounded-md hover:bg-brown-600 focus:outline-none focus:bg-brown-600 relative"
            disabled={isLoading}
          >
            {isLoading && <div className="loading-spinner"></div>}
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        {/* Add the Employee Login link here */}
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
        </div>
      </div>
    </div>
  );
};

export default Login;
