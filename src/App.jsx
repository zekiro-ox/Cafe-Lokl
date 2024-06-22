import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProductPage from "./ProductPage";
import EmployeeLog from "./EmployeeLogs";
import SalesReport from "./SalesReport";

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/employee-logs" element={<EmployeeLog />} />
        <Route
          path="/sales-report"
          element={<SalesReport salesData={salesData} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
