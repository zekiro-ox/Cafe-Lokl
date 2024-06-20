import React from "react";
import Sidebar from "./Sidebar";

const Dashboard = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col pt-16 pr-5 pl-5 pb-5 lg:ml-64">
        <div className="bg-gradient-to-r from-brown-500 to-brown-400 p-6 rounded-t-2xl">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full lg:w-96">
            <h2 className="text-3xl mb-4 text-center font-bold text-brown-500">
              Dashboard
            </h2>
            <p className="text-gray-700 text-center">
              Welcome to your dashboard!
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row mt-6 space-y-6 lg:space-x-6 lg:space-y-0">
          {/* Sales Report Container */}
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full lg:w-1/2">
            <h3 className="text-2xl mb-4 text-center font-bold text-brown-500">
              Sales Report
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-brown-500">
                  Total Sales
                </h4>
                <p className="text-gray-700">1000 units sold</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-brown-500">
                  Revenue
                </h4>
                <p className="text-gray-700">$25,000</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-brown-500">
                  Average Sales per Day
                </h4>
                <p className="text-gray-700">50 units</p>
              </div>
            </div>
          </div>

          {/* Customer Feedback Container */}
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full lg:w-1/2">
            <h3 className="text-2xl mb-4 text-center font-bold text-brown-500">
              Customer Feedback
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-brown-500">
                  Feedback 1
                </h4>
                <p className="text-gray-700">
                  "Great service and quality products!" - John Doe
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-brown-500">
                  Feedback 2
                </h4>
                <p className="text-gray-700">
                  "Fast delivery and friendly staff." - Jane Smith
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-brown-500">
                  Feedback 3
                </h4>
                <p className="text-gray-700">
                  "Excellent product quality!" - Alice Johnson
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
