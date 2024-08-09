import React, { useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "./Sidebar";

const EmployeeAccount = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const employees = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      position: "Manager",
      profilePicture: "https://via.placeholder.com/150",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      position: "Barista",
      profilePicture: "https://via.placeholder.com/150",
    },
    {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      position: "Cashier",
      profilePicture: "https://via.placeholder.com/150",
    },
    // Add more employees here
  ];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (employee) => {
    alert(`Edit functionality for ${employee.name} to be implemented`);
  };

  const handleDelete = (employee) => {
    alert(`Delete functionality for ${employee.name} to be implemented`);
  };

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Employee Accounts</h2>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full md:w-auto"
              />
              <FaSearch className="absolute top-3 left-2 text-gray-500" />
            </div>
            <button
              onClick={() =>
                alert("Add Account functionality to be implemented")
              }
              className="flex items-center px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 md:px-6 md:py-3 md:text-lg"
            >
              <FaPlus className="mr-2" /> Add Account
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-brown-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Profile Picture</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Position</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">
                    <img
                      src={employee.profilePicture}
                      alt={employee.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="py-3 px-4">{employee.name}</td>
                  <td className="py-3 px-4">{employee.email}</td>
                  <td className="py-3 px-4">{employee.position}</td>
                  <td className="py-3 px-4 flex space-x-4">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAccount;
