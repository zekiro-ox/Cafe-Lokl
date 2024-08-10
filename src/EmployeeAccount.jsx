import React, { useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "./Sidebar";

const EmployeeAccount = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([
    {
      id: "E001",
      name: "John Doe",
      email: "john.doe@example.com",
      position: "Manager",
    },
    {
      id: "E002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      position: "Barista",
    },
    {
      id: "E003",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      position: "Cashier",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleInputChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddEmployee = () => {
    if (newEmployee.password !== newEmployee.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    const fullName = `${newEmployee.firstName} ${newEmployee.lastName}`;
    const newId = `E${(employees.length + 1).toString().padStart(3, "0")}`;

    setEmployees([
      ...employees,
      {
        id: newId,
        name: fullName,
        email: newEmployee.email,
        position: newEmployee.position,
      },
    ]);

    setShowAddForm(false);
    setNewEmployee({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      position: "",
    });
    setPasswordError("");
  };

  const handleEditEmployee = () => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === selectedEmployee.id
        ? { ...employee, ...selectedEmployee }
        : employee
    );
    setEmployees(updatedEmployees);
    setShowEditForm(false);
    setSelectedEmployee(null);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (employee) => {
    const [firstName, lastName] = employee.name.split(" ");
    setSelectedEmployee({ ...employee, firstName, lastName });
    setShowEditForm(true);
  };

  const handleDelete = (employee) => {
    setEmployees(employees.filter((e) => e.id !== employee.id));
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
              onClick={() => setShowAddForm(true)}
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
                <th className="py-3 px-4 text-left">Employee ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Position</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4">{employee.id}</td>
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

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add Employee</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={newEmployee.firstName}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={newEmployee.lastName}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={newEmployee.password}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={newEmployee.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-lg"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <select
                name="position"
                value={newEmployee.position}
                onChange={handleInputChange}
                className="mt-1 p-2 w-full border rounded-lg"
              >
                <option value="">Select Position</option>
                <option value="Manager">Manager</option>
                <option value="Barista">Barista</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Employee
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={selectedEmployee.firstName}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    firstName: e.target.value,
                  })
                }
                className="mt-1 p-2 w-full border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={selectedEmployee.lastName}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    lastName: e.target.value,
                  })
                }
                className="mt-1 p-2 w-full border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={selectedEmployee.email}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    email: e.target.value,
                  })
                }
                className="mt-1 p-2 w-full border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <select
                name="position"
                value={selectedEmployee.position}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    position: e.target.value,
                  })
                }
                className="mt-1 p-2 w-full border rounded-lg"
              >
                <option value="Manager">Manager</option>
                <option value="Barista">Barista</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleEditEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditForm(false)}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAccount;
