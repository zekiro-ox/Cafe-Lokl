import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProductPage from "./ProductPage";
import EmployeeLog from "./EmployeeLogs";
import Inventory from "./Inventory";
import EmployeeAccount from "./EmployeeAccount";
import EmployeeLogin from "./EmployeeLogin";
import EmployeeDashboard from "./EmployeeDashboard";
import Order from "./Order";
import UpcomingOrders from "./UpcomingOrder";
import EmployeeInventory from "./EmployeeInventory";
import { SessionProvider } from "./SessionContext.jsx";
import ProtectedRoute from "./ProtectedRoute";

// Generate more dummy data for the past 60 days
const salesData = Array.from({ length: 150 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  return {
    date: date.toISOString().split("T")[0],
    sales: Math.floor(Math.random() * 100) + 1,
    revenue: Math.floor(Math.random() * 1000) + 100,
  };
}).reverse();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login setAuth={setIsAuthenticated} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={Dashboard}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={ProductPage}
              />
            }
          />
          <Route path="/employee-logs" element={<EmployeeLog />} />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={Inventory}
              />
            }
          />
          <Route path="/employee-account" element={<EmployeeAccount />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={Order}
              />
            }
          />
          <Route
            path="/employee-login"
            element={<EmployeeLogin setAuth={setIsAuthenticated} />}
          />
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={EmployeeDashboard}
              />
            }
          />
          <Route
            path="/upcoming-orders"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={UpcomingOrders}
              />
            }
          />
          <Route
            path="/employee-inventory"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={EmployeeInventory}
              />
            }
          />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export default App;
