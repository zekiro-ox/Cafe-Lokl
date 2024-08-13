import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "./assets/logo.png";
import "./Login.css";
import { db } from "./config/firebase";
import { getDocs, query, where, collection } from "firebase/firestore";

const EmployeeLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmployeeEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const q = query(collection(db, "accounts"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const employeeDoc = querySnapshot.docs[0];
        const employeeData = employeeDoc.data();

        if (employeeData.password === password) {
          setIsLoading(false);

          // Save email and document ID to local storage
          localStorage.setItem("rememberedEmployeeEmail", email);
          localStorage.setItem("employeeDocId", employeeDoc.id);

          // Pass the document ID to the next component
          navigate("/employee-dashboard", {
            state: { employeeDocId: employeeDoc.id },
          });
        } else {
          throw new Error("Invalid email or password.");
        }
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (error) {
      setIsLoading(false);
      setError("Invalid email or password. Please try again.");
      console.error("Error signing in:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-brown-500 to-brown-400">
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
