import React, { useEffect, useState } from "react";
import { FaCheckSquare, FaBell } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import NotificationModal from "./NotificationModal";
import EmployeeSidebar from "./EmployeeSidebar"; // Import the sidebar component

const UpcomingOrders = () => {
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

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

  useEffect(() => {
    fetchUpcomingOrders();
  }, []);

  const handleCheckOrder = async (orderId) => {
    alert("Status: Notifying the Customer");
    const orderRef = doc(db, "order", orderId);
    await updateDoc(orderRef, {
      status: "Brew-tiful News! Your Drink’s Ready for You!",
    });
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

    alert(
      `Notification sent to User ID: ${selectedUserId}\nMessage: ${message}`
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

  return (
    <div className="flex flex-col sm:flex-row">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 lg:ml-64 bg-gray-100 min-h-screen">
        <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
          <h2 className="text-2xl font-bold mb-6">Upcoming Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-brown-500 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Order ID</th>
                  <th className="py-3 px-4 text-left">Product Name</th>
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
                        P{order.totalPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 flex justify-center space-x-4">
                        <FaCheckSquare
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          onClick={() => handleCheckOrder(order.id)}
                        />
                        <FaBell
                          className="text-green-500 cursor-pointer hover:text-green-600"
                          onClick={() =>
                            handleNotificationClick(order.id, order.uid)
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center">
                      No upcoming orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingOrders;
