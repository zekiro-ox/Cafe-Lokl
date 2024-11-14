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
import { db } from "./config/firebase";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { auth } from "./config/firebase";
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const notify = (message, id, type = "error") => {
  if (!toast.isActive(id)) {
    if (type === "error") {
      toast.error(message, { toastId: id });
    } else if (type === "success") {
      toast.success(message, { toastId: id });
    }
  }
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      notify("Passwords do not match.", "password_mismatch"); // Toast for password mismatch
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmployee.email,
        newEmployee.password
      );

      const uid = userCredential.user.uid;

      const newEmployeeData = {
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        position: newEmployee.position,
        createdAt: new Date(),
        uid: uid,
      };

      await setDoc(doc(employeesCollectionRef, uid), newEmployeeData);

      setEmployees([...employees, { ...newEmployeeData, id: uid }]);
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
      notify("Employee added successfully!", "employee_added", "success"); // Success toast
    } catch (error) {
      console.error("Error adding employee: ", error);
      if (error.code === "auth/email-already-in-use") {
        setPasswordError("Email already in use.");
        notify("Email already in use.", "email_in_use"); // Toast for email already in use
      } else {
        setPasswordError("Error creating account.");
        notify("Error creating account.", "account_creation_error"); // Toast for account creation error
      }
    }
  };

  const handleEditEmployee = async () => {
    try {
      const employeeDoc = doc(db, "accounts", selectedEmployee.id);
      const updatedEmployeeData = {
        firstName: selectedEmployee.firstName,
        lastName: selectedEmployee.lastName,
        email: selectedEmployee.email,
        position: selectedEmployee.position,
      };

      await updateDoc(employeeDoc, updatedEmployeeData);

      const updatedEmployees = employees.map((employee) =>
        employee.id === selectedEmployee.id
          ? { ...employee, ...updatedEmployeeData }
          : employee
      );
      setEmployees(updatedEmployees);
      setShowEditForm(false);
      setSelectedEmployee(null);
      setPasswordError("");
      notify("Employee updated successfully!", "employee_updated", "success"); // Success toast
    } catch (error) {
      console.error("Error editing employee: ", error);
      notify(
        "Error updating employee. Please try again.",
        "update_employee_error"
      ); // Toast for update error
    }
  };
  const handleDelete = async (employee) => {
    try {
      // First, delete the employee document from Firestore
      const employeeDoc = doc(db, "accounts", employee.uid); // Use the UID stored in Firestore
      await deleteDoc(employeeDoc);

      // Then, delete the user from Firebase Authentication
      const user = auth.currentUser; // Get the currently signed-in user

      if (user && user.uid === employee.uid) {
        // Only delete if the current user matches the employee's UID
        await deleteUser(user);
        notify("Employee deleted successfully!", "employee_deleted", "success"); // Success toast
      } else {
        // If the user is not signed in, you cannot delete them directly
        console.error("User  not signed in or does not match.");
        notify("User  not signed in or does not match.", "user_not_signed_in"); // Toast for user not signed in
      }

      // Update the local employees state
      setEmployees(employees.filter((e) => e.uid !== employee.uid));
    } catch (error) {
      console.error("Error deleting employee: ", error);
      notify(
        "Error deleting employee. Please try again.",
        "delete_employee_error"
      ); // Toast for delete error
    }
  };
  const sendResetPasswordEmail = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setShowEditForm(false);
      notify("Password reset email sent!", "reset_email_sent", "success"); // Success toast
    } catch (error) {
      console.error("Error sending password reset email: ", error);
      notify("Error sending password reset email.", "reset_email_error"); // Toast for reset email error
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const id = employee.id || "";
    const name = `${employee.firstName} ${employee.lastName}` || "";
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
    setSelectedEmployee(employee);
    setShowEditForm(true);
  };

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <ToastContainer />
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Employee Accounts</h2>
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
                  <td className="py-3 px-4">
                    {employee.firstName} {employee.lastName}
                  </td>
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
              <p className="mt-1 p-2 border rounded-lg w-full bg-gray-100 text-gray-700 cursor-pointer">
                {selectedEmployee.email}
              </p>
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
            <div className="flex justify-center space-between">
              <button
                onClick={() => sendResetPasswordEmail(selectedEmployee.email)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Send Reset Password
              </button>
              <button
                onClick={handleEditEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-4"
              >
                Save Changes
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
