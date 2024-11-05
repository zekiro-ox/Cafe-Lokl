import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import { db } from "./config/firebase"; // Import your Firebase config
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions

function Order() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Reference to the 'order' collection
        const ordersCollectionRef = collection(db, "order");
        const ordersSnapshot = await getDocs(ordersCollectionRef);

        const allOrders = [];

        console.log("Orders Collection Snapshot:", ordersSnapshot.docs);

        // Iterate through each document in the 'order' collection
        for (const doc of ordersSnapshot.docs) {
          console.log("Processing Document ID:", doc.id);

          // Reference to the 'orders' sub-collection for each user document
          const subOrdersCollectionRef = collection(
            db,
            "order",
            doc.id,
            "orders"
          );
          const subOrdersSnapshot = await getDocs(subOrdersCollectionRef);

          console.log(
            "Sub-Orders Snapshot for User ID:",
            doc.id,
            subOrdersSnapshot.docs
          );

          // Map through the sub-collection documents and add them to the allOrders array
          subOrdersSnapshot.docs.forEach((subDoc) => {
            const data = subDoc.data();
            const orderItems = data.orderID || []; // Access the orderID array

            orderItems.forEach((item) => {
              allOrders.push({
                id: subDoc.id, // Document ID from the sub-collection
                orderID: doc.id, // Parent document ID (user UID)
                productName: item.productName || "N/A", // Fetch productName
                ingredients:
                  item.ingredients.map((ing) => ing.name).join(", ") || "N/A", // Fetch Ingredients
                totalPrice: data.totalPrice || 0, // Fetch totalPrice
                createdAt: data.createdAt, // Assuming createdAt is also in the sub-document
              });
            });
          });
        }

        console.log("All Orders Fetched:", allOrders);
        setOrders(allOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-brown-500 p-4 flex justify-between items-center">
        <div className="text-white text-xl font-bold">Orders</div>
        <Link
          to="/employee-dashboard" // Link to go back to EmployeeDashboard
          className="text-white hover:text-brown-300 flex items-center space-x-2"
        >
          <span>Back</span>
        </Link>
      </nav>

      <div className="container mx-auto p-4">
        <div className="text-center text-2xl font-bold mb-4">Order Details</div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Order ID</th>
                <th className="py-2 px-4 border-b text-left">Product Name</th>
                <th className="py-2 px-4 border-b text-left">Ingredients</th>
                <th className="py-2 px-4 border-b text-left">Total Amount</th>
                <th className="py-2 px-4 border-b text-left">Order Date</th>
                {/* Add more columns as needed */}
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-2 px-4 border-b">{order.orderID}</td>
                    <td className="py-2 px-4 border-b">{order.productName}</td>
                    <td className="py-2 px-4 border-b">{order.ingredients}</td>
                    <td className="py-2 px-4 border-b">${order.totalPrice}</td>
                    <td className="py-2 px-4 border-b">
                      {order.createdAt
                        ? new Date(
                            order.createdAt.seconds * 1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-2 px-4 border-b text-center">
                    No orders found.
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
