import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaBoxOpen,
  FaUserClock,
  FaChartLine,
  FaWarehouse,
  FaSignOutAlt,
  FaUserShield,
  FaUserTie, // Import the icon for Employee Account
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import logo from "./assets/logo.png"; // Update the path as necessary

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const handleLinkClick = (path) => {
    setActiveLink(path);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      navigate("/");
    }, 1000);
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
              <FaUserShield className="flex-shrink-0 w-5 h-5 mr-2" />
              <span className="flex-1 ms-3 whitespace-nowrap">Admin</span>
            </li>
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/dashboard"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/dashboard")}
              >
                <MdDashboard className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/products"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/products")}
              >
                <FaBoxOpen className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">Products</span>
              </Link>
            </li>
            <li>
              <Link
                to="/employee-logs"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/employee-logs"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/employee-logs")}
              >
                <FaUserClock className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Employee Logs
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/sales-report"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/sales-report"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/sales-report")}
              >
                <FaChartLine className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Sales Report
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/inventory"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/inventory"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/inventory")}
              >
                <FaWarehouse className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">Inventory</span>
              </Link>
            </li>
            {/* New Employee Account Link */}
            <li>
              <Link
                to="/employee-account"
                className={`flex items-center p-4 rounded ${
                  activeLink === "/employee-account"
                    ? "bg-gray-200 text-black"
                    : "text-white hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => handleLinkClick("/employee-account")}
              >
                <FaUserTie className="flex-shrink-0 w-5 h-5 transition duration-75" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Employee Account
                </span>
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

export default Sidebar;
