import React from "react";
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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={<Dashboard salesData={salesData} />}
        />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/employee-logs" element={<EmployeeLog />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/employee-account" element={<EmployeeAccount />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/order" element={<Order />} />
      </Routes>
    </Router>
  );
}

export default App;
