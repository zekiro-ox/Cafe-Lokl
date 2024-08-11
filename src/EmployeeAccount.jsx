import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import { db } from "./config/firebase"; // Ensure this path is correct for your project setup
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const EmployeeAccount = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const employeesCollectionRef = collection(db, "accounts");

  // Fetch employees from Firestore on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getDocs(employeesCollectionRef);
      setEmployees(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    fetchEmployees();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleInputChange = (e) => {
    setNewEmployee({
      ...newEmployee,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddEmployee = async () => {
    if (newEmployee.password !== newEmployee.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    const fullName = `${newEmployee.firstName} ${newEmployee.lastName}`;

    const newEmployeeData = {
      name: fullName,
      email: newEmployee.email,
      position: newEmployee.position,
      password: newEmployee.password,
    };

    try {
      const docRef = await addDoc(employeesCollectionRef, newEmployeeData);
      setEmployees([...employees, { ...newEmployeeData, id: docRef.id }]);
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
    } catch (error) {
      console.error("Error adding employee: ", error);
    }
  };

  const handleEditEmployee = async () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const employeeDoc = doc(db, "accounts", selectedEmployee.id);
      const updatedEmployeeData = {
        name: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        email: selectedEmployee.email,
        position: selectedEmployee.position,
      };

      // Update the password only if a new one is provided
      if (newPassword) {
        updatedEmployeeData.password = newPassword;
      }

      await updateDoc(employeeDoc, updatedEmployeeData);

      const updatedEmployees = employees.map((employee) =>
        employee.id === selectedEmployee.id
          ? { ...employee, ...updatedEmployeeData }
          : employee
      );
      setEmployees(updatedEmployees);
      setShowEditForm(false);
      setSelectedEmployee(null);
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordError("");
    } catch (error) {
      console.error("Error editing employee: ", error);
    }
  };

  const handleDelete = async (employee) => {
    try {
      const employeeDoc = doc(db, "accounts", employee.id);
      await deleteDoc(employeeDoc);
      setEmployees(employees.filter((e) => e.id !== employee.id));
    } catch (error) {
      console.error("Error deleting employee: ", error);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const id = employee.id || ""; // Fallback to an empty string if undefined
    const name = employee.name || "";
    const email = employee.email || "";
    const position = employee.position || "";

    return (
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleEdit = (employee) => {
    const [firstName, lastName] = employee.name.split(" ");
    setSelectedEmployee({ ...employee, firstName, lastName });
    setShowEditForm(true);
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
                className="mt-1 p-2 border rounded-lg w-full"
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
                className="mt-1 p-2 border rounded-lg w-full"
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
                className="mt-1 p-2 border rounded-lg w-full"
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={newEmployee.password}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded-lg w-full pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-11 right-0 flex items-center px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={newEmployee.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded-lg w-full pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-11 right-0 flex items-center px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <select
                name="position"
                value={newEmployee.position}
                onChange={handleInputChange}
                className="mt-1 p-2 border rounded-lg w-full"
              >
                <option value="">Select a position</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Barista">Barista</option>
                {/* Add more positions as needed */}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-4"
              >
                Add Employee
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
                className="mt-1 p-2 border rounded-lg w-full"
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
                className="mt-1 p-2 border rounded-lg w-full"
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
                className="mt-1 p-2 border rounded-lg w-full"
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
                className="mt-1 p-2 border rounded-lg w-full"
              >
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
                <option value="Barista">Barista</option>
                {/* Add more positions as needed */}
              </select>
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                New Password (optional)
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 p-2 border rounded-lg w-full pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-11 right-0 flex items-center px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password (optional)
              </label>
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 p-2 border rounded-lg w-full pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-11 right-0 flex items-center px-3"
                onClick={() =>
                  setShowConfirmNewPassword(!showConfirmNewPassword)
                }
              >
                {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEditEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-4"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAccount;
