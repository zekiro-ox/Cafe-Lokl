import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProductPage from "./ProductPage";
import EmployeeLog from "./EmployeeLogs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/employee-logs" element={<EmployeeLog />} />
      </Routes>
    </Router>
  );
}

export default App;
