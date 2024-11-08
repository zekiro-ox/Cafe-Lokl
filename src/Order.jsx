import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { FaCheckSquare, FaBell } from "react-icons/fa";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "./config/firebase";
import NotificationModal from "./NotificationModal"; // Import the modal

function Order() {
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState("upcoming");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null); // Store user ID

  useEffect(() => {
    const unsubscribeUpcomingOrders = onSnapshot(
      collection(db, "order"),
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt ? data.createdAt.toDate() : null;

          return {
            id: doc.id,
            productName: data.productName || "",
            ingredients: data.ingredients || [],
            totalPrice: data.totalPrice,
            createdAt: createdAt,
            uid: data.uid || "", // Assuming uid is stored in the order document
          };
        });

        setUpcomingOrders(fetchedOrders);
        setLoading(false); // Stop loading once data is fetched
      },
      (err) => {
        console.error("Error fetching upcoming orders:", err);
        setError("Failed to fetch upcoming orders.");
        setLoading(false);
      }
    );

    // Fetch history orders when the selected view changes
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
      } catch (err) {
        console.error("Error fetching history orders:", err);
        setError("Failed to fetch history orders.");
      }
    };

    // Fetch history orders when the selected view changes
    if (selectedView === "history") {
      fetchHistoryOrders();
    }

    // Cleanup function to unsubscribe from the listener
    return () => unsubscribeUpcomingOrders();
  }, [selectedView]);

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

  // Filter history orders based on selected month and year
  const filteredHistoryOrders = historyOrders.filter((order) => {
    const orderMonth = order.createdAt.getMonth() + 1; // Months are 0-indexed
    const orderYear = order.createdAt.getFullYear();
    return orderMonth === selectedMonth && orderYear === selectedYear;
  });

  const handleCheckOrder = async (orderId) => {
    // Show alert to notify the admin
    alert("Status: Notifying the Customer");

    // Update the order status in Firestore
    const orderRef = doc(db, "order", orderId);
    await updateDoc(orderRef, {
      status: "Brew-tiful News! Your Drink’s Ready for You!",
    });
  };

  const handleNotificationClick = (orderId, userId) => {
    setSelectedOrderId(orderId);
    setSelectedUserId(userId); // Fixed variable name
    setIsModalOpen(true);
  };

  const handleSendNotification = async (message) => {
    if (!selectedUserId) return; // Fixed variable name

    const notificationRef = collection(db, "notification");
    const timeSend = new Date();

    // Create a new notification document
    await addDoc(notificationRef, {
      message: message,
      uid: selectedUserId, // User ID from the selected order
      timeSend: timeSend,
    });

    // Within handleSendNotification function, update this line:
    alert(
      `Notification sent to User ID: ${selectedUserId}\nMessage: ${message}`
    ); // Fixed variable name
    // Fixed variable name
    setIsModalOpen(false); // Close the modal
  };

  const renderTable = (orders) => (
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
            <th className="py-3 px-2 md:px-4 text-left text-sm md:text-base">
              Actions
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
                <td className="flex items-center justify-center py-3 px-2 md:px-4 space-x-2">
                  <FaCheckSquare
                    className="text-blue-500 cursor-pointer hover:text-blue-600"
                    onClick={() => handleCheckOrder(order.id)}
                  />
                  <FaBell
                    className="text-green-500 cursor-pointer hover:text-green-600"
                    onClick={() => handleNotificationClick(order.id, order.uid)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
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
        <div className="flex justify-between mb-4">
          <div>
            <button
              className={`px-4 py-2 rounded-lg mr-2 ${
                selectedView === "upcoming"
                  ? "bg-brown-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
              onClick={() => setSelectedView("upcoming")}
            >
              Upcoming Orders
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedView === "history"
                  ? "bg-brown-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
              onClick={() => setSelectedView("history")}
            >
              History
            </button>
          </div>
          {selectedView === "history" && (
            <div className="flex items-center space-x-4">
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
          )}
        </div>
        {selectedView === "upcoming"
          ? renderTable(upcomingOrders)
          : renderHistoryTable(filteredHistoryOrders)}
        {/* Render filtered history orders */}
      </div>
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendNotification}
      />
    </div>
  );
}

export default Order;
