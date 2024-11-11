import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./config/firebase";

function Order() {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year

  useEffect(() => {
    const fetchHistoryOrders = async () => {
      try {
        const historyCollectionRef = collection(db, "history");
        const historyCollectionSnapshot = await getDocs(historyCollectionRef);

        const fetchedHistoryOrders = historyCollectionSnapshot.docs.map(
          (doc) => {
            const data = doc.data();
            const createdAt = data.createdAt ? data.createdAt.toDate() : null;

            return {
              id: doc.id,
              productName: data.productName || "",
              ingredients: data.ingredients || [],
              totalPrice: data.totalPrice,
              createdAt: createdAt,
            };
          }
        );

        setHistoryOrders(fetchedHistoryOrders);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history orders:", err);
        setError("Failed to fetch history orders.");
        setLoading(false);
      }
    };

    fetchHistoryOrders();
  }, []);

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

  // Filter and sort history orders based on selected month and year
  const filteredHistoryOrders = historyOrders
    .filter((order) => {
      const orderMonth = order.createdAt.getMonth() + 1; // Months are 0-indexed
      const orderYear = order.createdAt.getFullYear();
      return orderMonth === selectedMonth && orderYear === selectedYear;
    })
    .sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt descending

  const renderHistoryTable = (orders) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-brown-500 text-white">
          <tr>
            <th className="py-3 px-2 md:px-4 text-left text-sm md:text-base">
              Order ID
            </th>
            <th className="py-3 px-2 md:px-4 text-left text-sm md:text-base">
              Product Name
            </th>
            <th className="py-3 px-2 md:px-4 text-left text-sm md:text-base">
              Ingredients
            </th>
            <th className="py-3 px-2 md:px-4 text-left text-sm md:text-base">
              Total Amount
            </th>
            <th className="py-3 px-2 md:px-4 text-left text-sm md:text-base">
              Order Date
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="border-b text-sm md:text-base">
                <td className="py-3 px-2 md:px-4">{order.id}</td>
                <td className="py-3 px-2 md:px-4">{order.productName}</td>
                <td className="py-3 px-2 md:px-4">
                  {Array.isArray(order.ingredients) && order.ingredients.length
                    ? order.ingredients
                        .map(
                          (ingredient) =>
                            `${ingredient.name} (Qty: ${ingredient.quantity})`
                        )
                        .join(", ")
                    : "No ingredients available"}
                </td>
                <td className="py-3 px-2 md:px-4">
                  P{order.totalPrice.toFixed(2)}
                </td>
                <td className="py-3 px-2 md:px-4">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="py-2 px-2 md:px-4 border-b text-center"
              >
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <h2 className="text-xl font-bold mb-4">Order History</h2>
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded p-2"
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded p-2"
          >
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {renderHistoryTable(filteredHistoryOrders)}
      </div>
    </div>
  );
}

export default Order;
