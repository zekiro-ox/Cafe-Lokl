import React, { useEffect, useState } from "react";
import { FaCheckSquare, FaBell } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  getDocs,
} from "firebase/firestore";
import NotificationModal from "./NotificationModal";
import EmployeeSidebar from "./EmployeeSidebar";
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
}; // Import the sidebar component

const UpcomingOrders = () => {
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [view, setView] = useState("upcoming");

  const statuses = [
    "30 minutes to go! Swing by soon to grab your order!",
    "20 minutes left! Your pick-up time is approaching fast!",
    "10 minutes remaining! Almost time to pick up your order!",
    "5 minutes left! Hurry over to collect your order!",
    "Your drinks is almost finished and will be ready for pick up",
    "Brew-tiful News! Your Drink’s Ready for You!",
  ];

  const fetchUpcomingOrders = () => {
    const ordersCollection = collection(db, "order");
    const unsubscribe = onSnapshot(
      ordersCollection,
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
            uid: data.uid || "",
            specialRemarks: data.specialRemarks || "None",
            pickupTime: data.pickupTime,
          };
        });

        setUpcomingOrders(fetchedOrders);
      },
      (error) => {
        console.error("Error fetching upcoming orders:", error);
      }
    );

    return () => unsubscribe();
  };
  const fetchHistoryOrders = async () => {
    try {
      const historyCollectionRef = collection(db, "history");
      const historyCollectionSnapshot = await getDocs(historyCollectionRef);

      const fetchedHistoryOrders = historyCollectionSnapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt ? data.createdAt.toDate() : null;

        return {
          id: doc.id,
          productName: data.productName || "",
          ingredients: data.ingredients || [],
          totalPrice: data.totalPrice,
          createdAt: createdAt,
        };
      });

      // Sort the fetched orders
      fetchedHistoryOrders.sort((a, b) => {
        // Compare by year and month first
        const yearA = a.createdAt.getFullYear();
        const monthA = a.createdAt.getMonth();
        const yearB = b.createdAt.getFullYear();
        const monthB = b.createdAt.getMonth();

        if (yearA !== yearB) {
          return yearB - yearA; // Sort by year descending
        }
        return monthB - monthA; // Sort by month descending
      });

      // Now sort by date within the same month
      fetchedHistoryOrders.sort((a, b) => b.createdAt - a.createdAt);

      setHistoryOrders(fetchedHistoryOrders);
    } catch (err) {
      console.error("Error fetching history orders:", err);
    }
  };

  useEffect(() => {
    fetchUpcomingOrders();
    fetchHistoryOrders(); // Fetch history orders on mount
  }, []);
  const handleCheckOrder = async () => {
    if (!selectedStatus || !selectedOrderId) return;

    notify(`Status: ${selectedStatus}`, "order_status", "success");
    const orderRef = doc(db, "order", selectedOrderId);
    await updateDoc(orderRef, {
      status: selectedStatus,
    });

    setIsStatusModalOpen(false);
    setSelectedOrderId(null);
    setSelectedStatus("");
  };

  const handleOpenStatusModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsStatusModalOpen(true);
  };

  const handleNotificationClick = (orderId, userId) => {
    setSelectedOrderId(orderId);
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleSendNotification = async (message) => {
    if (!selectedUserId) return;

    const notificationRef = collection(db, "notification");
    const timeSend = new Date();

    await addDoc(notificationRef, {
      message: message,
      uid: selectedUserId,
      timeSend: timeSend,
    });

    notify(
      `Notification sent to User ID: ${selectedUserId}\nMessage: ${message}`,
      "notification_sent",
      "success"
    );
    setIsModalOpen(false);
  };

  const formatOrderDate = (date) => {
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
  const renderUpcomingOrdersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-brown-500 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Order ID</th>
            <th className="py-3 px-4 text-left">Product Name</th>
            <th className="py-3 px-4 text-left">Ingredients</th>
            <th className="py-3 px-4 text-left">Special Remarks</th>
            <th className="py-3 px-4 text-left">Pick-up Time</th>
            <th className="py-3 px-4 text-left">Total Amount</th>
            <th className="py-3 px-4 text-left">Order Date</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {upcomingOrders.length > 0 ? (
            upcomingOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-3 px-4">{order.id}</td>
                <td className="py-3 px-4">{order.productName}</td>
                <td className="py-3 px-4">
                  {Array.isArray(order.ingredients) && order.ingredients.length
                    ? order.ingredients
                        .map(
                          (ingredient) =>
                            `${ingredient.name} (Qty: ${ingredient.quantity})`
                        )
                        .join(", ")
                    : "No ingredients available"}
                </td>
                <td className="py-3 px-4">{order.specialRemarks}</td>
                <td className="py-3 px-4">{order.pickupTime}</td>
                <td className="py-3 px-4">P{order.totalPrice.toFixed(2)}</td>
                <td className="py-3 px-4">
                  {formatOrderDate(order.createdAt)}
                </td>
                <td className="py-3 px-4 flex justify-center space-x-4">
                  <FaCheckSquare
                    className="text-blue-500 cursor-pointer hover:text-blue-600"
                    onClick={() => handleOpenStatusModal(order.id)}
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
              <td colSpan="7" className="py-4 px-4 text-center">
                No upcoming orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderHistoryOrdersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-brown-500 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Order ID</th>
            <th className="py-3 px-4 text-left">Product Name</th>
            <th className="py-3 px-4 text-left">Ingredients</th>
            <th className="py-3 px-4 text-left">Total Amount</th>
            <th className="py-3 px-4 text-left">Order Date</th>
          </tr>
        </thead>
        <tbody>
          {historyOrders.length > 0 ? (
            historyOrders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-3 px-4">{order.id}</td>
                <td className="py-3 px-4">{order.productName}</td>
                <td className="py-3 px-4">
                  {Array.isArray(order.ingredients) && order.ingredients.length
                    ? order.ingredients
                        .map(
                          (ingredient) =>
                            `${ingredient.name} (Qty: ${ingredient.quantity})`
                        )
                        .join(", ")
                    : "No ingredients available"}
                </td>
                <td className="py-3 px-4">P{order.totalPrice.toFixed(2)}</td>
                <td className="py-3 px-4">
                  {formatOrderDate(order.createdAt)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-4 px-4 text-center">
                No history orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 lg:ml-64 bg-gray-100 min-h-screen">
        <ToastContainer />
        <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
          <h2 className="text-2xl font-bold mb-6">Orders</h2>
          <div className="flex mb-4">
            <button
              className={`px-4 py-2 mr-2 rounded-lg ${
                view === "upcoming" ? "bg-brown-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setView("upcoming")}
            >
              Upcoming Orders
            </button>
            <button
              className={`px-4 py-2 ml-2 rounded-lg ${
                view === "history" ? "bg-brown-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setView("history")}
            >
              Order History
            </button>
          </div>
          {view === "upcoming"
            ? renderUpcomingOrdersTable()
            : renderHistoryOrdersTable()}
        </div>
      </div>
      {/* Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Select Order Status</h2>
            <select
              className="w-full p-2 border rounded-lg mb-4"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              {statuses.map((status, index) => (
                <option key={index} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
                onClick={handleCheckOrder}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendNotification}
      />
    </div>
  );
};

export default UpcomingOrders;
