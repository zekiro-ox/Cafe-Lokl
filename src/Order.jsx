import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar"; // Import the Sidebar component
import { FaEye, FaCheckSquare, FaBell } from "react-icons/fa"; // Import necessary icons
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "./config/firebase"; // Ensure the correct path to your Firebase config

function Order() {
  const [upcomingOrders, setUpcomingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingOrders = async () => {
      try {
        const ordersCollection = collection(db, "order");
        const ordersSnapshot = await getDocs(ordersCollection);
        console.log("Orders Snapshot:", ordersSnapshot.docs); // Debugging log

        const ordersPromises = ordersSnapshot.docs.map(async (orderDoc) => {
          const mainOrderId = orderDoc.id; // Document ID of the main order
          const subCollectionRef = collection(
            db,
            `order/${mainOrderId}/orders`
          );
          const subCollectionSnapshot = await getDocs(subCollectionRef);
          console.log(
            `Subcollection for ${mainOrderId}:`,
            subCollectionSnapshot.docs
          ); // Debugging log

          return subCollectionSnapshot.docs.map((subDoc) => {
            const data = subDoc.data();
            return {
              id: subDoc.id,
              orderDetails: data.orderID || [],
              totalPrice: data.totalPrice,
              createdAt: data.createdAt.value,
            };
          });
        });

        const ordersList = await Promise.all(ordersPromises);
        const flattenedOrders = ordersList.flat();

        const finalOrders = flattenedOrders.flatMap((order) =>
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
        console.error("Error fetching orders: ", err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingOrders();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
                      {Array.isArray(order.ingredients)
                        ? order.ingredients
                            .map((ingredient) => ingredient.name)
                            .join(", ")
                        : "No ingredients available"}
                    </td>
                    <td className="py-3 px-2 md:px-4">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 md:px-4">
                      {order.createdAt
                        ? new Date(
                            order.createdAt.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="flex items-center justify-center py-3 px-2 md:px-4 space-x-2">
                      <FaEye className="text-yellow-500 cursor-pointer hover:text-yellow-600" />
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
