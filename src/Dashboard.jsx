import React, { useState, useEffect } from "react";
import { db } from "./config/firebase"; // Adjust the import based on your file structure
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "./Sidebar";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import {
  subDays,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
} from "date-fns";
import Papa from "papaparse"; // Import PapaParse

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [filter, setFilter] = useState("weekly");
  const [currentMonth, setCurrentMonth] = useState(0);
  const [filteredSalesData, setFilteredSalesData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      const querySnapshot = await getDocs(collection(db, "history"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSalesData(data);
    };

    fetchSalesData();
  }, []);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      const querySnapshot = await getDocs(collection(db, "customer"));
      const feedback = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (feedback) => feedback.feedback && feedback.feedback.trim() !== ""
        ); // Filter out empty feedback

      setFeedbackData(feedback);
    };

    fetchFeedbackData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today);
    const endOfCurrentWeek = endOfWeek(today);

    const filteredData = salesData.filter((item) => {
      const itemDate = item.createdAt.toDate(); // Convert Firestore timestamp to Date
      if (filter === "weekly") {
        const startDate = subDays(startOfCurrentWeek, currentMonth * 7);
        const endDate = subDays(endOfCurrentWeek, currentMonth * 7);
        return itemDate >= startDate && itemDate <= endDate;
      } else if (filter === "monthly") {
        const startOfSelectedMonth = startOfMonth(
          addMonths(today, currentMonth)
        );
        const endOfSelectedMonth = endOfMonth(addMonths(today, currentMonth));
        return (
          itemDate >= startOfSelectedMonth && itemDate <= endOfSelectedMonth
        );
      }
      return true;
    });
    setFilteredSalesData(filteredData);
  }, [filter, salesData, currentMonth]);

  useEffect(() => {
    if (filter === "monthly") {
      setCurrentMonth(0);
    }
  }, [filter]);

  const totalSales = filteredSalesData.reduce(
    (acc, item) => acc + item.quantity, // Use quantity from Firestore
    0
  );
  const totalRevenue = filteredSalesData.reduce(
    (acc, item) => acc + item.totalPrice, // Use totalPrice from Firestore
    0
  );
  const averageSalesPerDay =
    filteredSalesData.length > 0 ? totalSales / filteredSalesData.length : 0;

  const chartData = {
    labels: filteredSalesData.map(
      (item) => format(item.createdAt.toDate(), "yyyy-MM-dd") // Use createdAt for labels
    ),
    datasets: [
      {
        label: "Sales",
        data: filteredSalesData.map((item) => item.quantity), // Use quantity for sales
        borderColor: "#4caf50",
        fill: false,
      },
      {
        label: "Revenue",
        data: filteredSalesData.map((item) => item.totalPrice), // Use totalPrice for revenue
        borderColor: "#f44336",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: "Amount" },
        beginAtZero: true,
      },
    },
  };

  const handlePeriodChange = (direction) => {
    setCurrentMonth((prevMonth) => prevMonth + direction);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return (
      date.toLocaleString("en-US", {
        timeZone: "Asia/Singapore",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }) + " UTC+8"
    );
  };

  const downloadSalesReport = () => {
    const csvData = filteredSalesData.map(
      ({ id, quantity, totalPrice, createdAt }) => ({
        id,
        quantity,
        totalPrice,
        createdAt: formatDate(createdAt.toDate()), // Use formatDate for formatting
      })
    );

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col pt-5 pr-5 pl-5 pb-5 lg:ml-64">
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

        <div className="bg-white p-6 rounded-2xl shadow-2xl mt-6">
          <h3 className="text-2xl font-bold text-brown-500">
            Sales and Revenue Over Time
          </h3>
          <div className="flex flex-col lg:flex-row justify-between items-center mb-4">
            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePeriodChange(-1)}
                  disabled={currentMonth === 0}
                  className="p-2 border border-gray-300 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePeriodChange(1)}
                  className="p-2 border border-gray-300 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
              <button
                onClick={downloadSalesReport}
                className="p-2 border border-gray-300 rounded bg-blue-500 text-white hover:bg-blue-600 mt-2 lg:mt-0"
              >
                Download CSV
              </button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-2/3 mb-6 lg:mb-0">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="w-full lg:w-1/3">
              <h3 className="text-2xl mb-4 text-center font-bold text-brown-500">
                Sales Summary
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-brown-500">
                    Total Sales
                  </h4>
                  <p className="text-gray-700">{totalSales} units sold</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-brown-500">
                    Revenue
                  </h4>
                  <p className="text-gray-700">₱{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-brown-500">
                    Average Sales per Day
                  </h4>
                  <p className="text-gray-700">
                    {averageSalesPerDay.toFixed(2)} units
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-2xl mt-6">
            <h3 className="text-2xl mb-4 text-center font-bold text-brown-500">
              Customer Feedback
            </h3>
            <div className="space-y-4">
              {feedbackData.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-gray-100 p-4 m-2 rounded-lg"
                >
                  <h4 className="text-lg font-semibold text-brown-500">
                    {feedback.name ? feedback.name : "Unknown Customer"}
                  </h4>
                  <p className="text-gray-700">"{feedback.feedback}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
