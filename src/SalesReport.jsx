import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { subDays, format } from "date-fns"; // Import date-fns for date manipulation

const SalesReport = ({ salesData }) => {
  const [filter, setFilter] = useState("weekly");
  const [filteredSalesData, setFilteredSalesData] = useState([]);

  useEffect(() => {
    const today = new Date();
    const filteredData = salesData.filter((item) => {
      const itemDate = new Date(item.date);
      if (filter === "weekly") {
        return itemDate >= subDays(today, 7);
      } else if (filter === "monthly") {
        return itemDate >= subDays(today, 30);
      }
      return true;
    });
    setFilteredSalesData(filteredData);
  }, [filter, salesData]);

  const totalSales = filteredSalesData.reduce(
    (acc, item) => acc + item.sales,
    0
  );
  const totalRevenue = filteredSalesData.reduce(
    (acc, item) => acc + item.revenue,
    0
  );
  const averageSalesPerDay = totalSales / filteredSalesData.length;

  const chartData = {
    labels: filteredSalesData.map((item) =>
      format(new Date(item.date), "yyyy-MM-dd")
    ),
    datasets: [
      {
        label: "Sales",
        data: filteredSalesData.map((item) => item.sales),
        borderColor: "#4caf50",
        fill: false,
      },
      {
        label: "Revenue",
        data: filteredSalesData.map((item) => item.revenue),
        borderColor: "#f44336",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col pt-16 pr-5 pl-5 pb-5 lg:ml-64">
        <div className="bg-gradient-to-r from-brown-500 to-brown-400 p-6 rounded-t-2xl">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full lg:w-96">
            <h2 className="text-3xl mb-4 text-center font-bold text-brown-500">
              Sales Report
            </h2>
            <p className="text-gray-700 text-center">
              Overview of sales and revenue.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-2xl mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-brown-500">
              Sales and Revenue Over Time
            </h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="flex flex-col lg:flex-row mt-6 space-y-6 lg:space-x-6 lg:space-y-0">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full lg:w-1/2">
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
                <p className="text-gray-700">${totalRevenue.toFixed(2)}</p>
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
          {/* Additional content can go here */}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
