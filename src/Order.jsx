import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { FaCheckSquare, FaBell } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./config/firebase";

function Order() {
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingOrders = async () => {
      try {
        const mainOrderId = "aAjkzDmsErTGJCwWDAMtwJ0Rvsd2"; // Hardcoded UID for testing

        const subCollectionRef = collection(db, `order/${mainOrderId}/orders`);
        const subCollectionSnapshot = await getDocs(subCollectionRef);

        const fetchedOrders = subCollectionSnapshot.docs.map((subDoc) => {
          const data = subDoc.data();
          console.log(`Fetched data for sub-document ID: ${subDoc.id}`, data); // Debugging log

          // Directly convert Firestore Timestamp to Date
          const createdAt = data.createdAt ? data.createdAt.toDate() : null;

          return {
            id: subDoc.id,
            orderDetails: data.orderID || [],
            totalPrice: data.totalPrice,
            createdAt: createdAt,
          };
        });

        const finalOrders = fetchedOrders.flatMap((order) =>
          order.orderDetails.map((item) => ({
            id: order.id,
            productName: item.productName,
            ingredients: item.ingredients,
            totalPrice: order.totalPrice,
            createdAt: order.createdAt,
          }))
        );

        console.log("Final Orders:", finalOrders); // Debugging log
        setUpcomingOrders(finalOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingOrders();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return (
      date.toLocaleString("en-US", {
        timeZone: "Asia/Singapore", // Adjust the time zone as needed
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }) + " UTC+8"
    ); // Append the UTC offset
  };

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="text-center text-2xl font-bold mb-4">
          Upcoming Orders
        </div>
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
              {upcomingOrders.length > 0 ? (
                upcomingOrders.map((order) => (
                  <tr key={order.id} className="border-b text-sm md:text-base">
                    <td className="py-3 px-2 md:px-4">{order.id}</td>
                    <td className="py-3 px-2 md:px-4">{order.productName}</td>
                    <td className="py-3 px-2 md:px-4">
                      {Array.isArray(order.ingredients) &&
                      order.ingredients.length
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
                      <FaCheckSquare className="text-blue-500 cursor-pointer hover:text-blue-600" />
                      <FaBell className="text-green-500 cursor-pointer hover:text-green-600" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-2 px-2 md:px-4 border-b text-center"
                  >
                    No upcoming orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Order;
