import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUserClock,
  FaSignOutAlt,
  FaWarehouse,
  FaUserTie,
} from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import logo from "./assets/logo.png"; // Update the path as necessary

const EmployeeSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isOpen, setIsOpen] = useState(true);

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("rememberedEmployeeEmail");
    localStorage.removeItem("employeeDocId");
    // Navigate to login page
    navigate("/employee-login");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        type="button"
        className="fixed top-4 right-4 z-50 p-3 text-sm text-black rounded-full sm:hidden hover:bg-gray-100 shadow-xl drop-shadow-xl"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Toggle sidebar</span>
        {isOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <FaBars className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
        style={{ backgroundColor: "#B36636" }} // Set background color to brown
      >
        <div className="h-full px-3 py-4 overflow-y-auto m-2">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className="h-20 w-auto" />
          </div>
          <ul className="space-y-2 font-medium text-white">
            <li className="flex items-center p-4 rounded text-white font-bold text-2xl">
              <FaUserTie className="flex-shrink-0 w-5 h-5 mr-2" />
              <span className="flex-1 ms-3 whitespace-nowrap">Employee</span>
            </li>
            <li>
              <Link
                to="/employee-dashboard"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/employee-dashboard"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/employee-dashboard")}
              >
                <FaUserClock className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Attendance
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/upcoming-orders"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/upcoming-orders"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/upcoming-orders")}
              >
                <FaCartShopping className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">Orders</span>
              </Link>
            </li>
            <li>
              <Link
                to="/employee-inventory"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/employee-inventory"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/employee-inventory")}
              >
                <FaWarehouse className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">Inventory</span>
              </Link>
            </li>
            <li>
              <button
                className="flex items-center p-4 rounded text-white w-full hover:bg-gray-200 hover:text-black"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="ms-3 whitespace-nowrap">Log Out</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default EmployeeSidebar;
