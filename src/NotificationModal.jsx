import React, { useState } from "react";

const NotificationModal = ({ isOpen, onClose, onSend }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage(""); // Clear the message input
      onClose(); // Close the modal
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Send Notification</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="4"
          className="w-full border rounded p-2 mb-4"
          placeholder="Type your message here..."
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-600 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
        <div className="mt-4">
          <h3 className="font-bold">Pre-built Messages:</h3>
          <div className="flex flex-wrap space-x-2 mt-2">
            <button
              className="bg-green-300 px-2 py-1 rounded"
              onClick={() => setMessage("Your drink is ready for pickup!")}
            >
              Drink Ready
            </button>
            <button
              className="bg-yellow-300 px-2 py-1 rounded"
              onClick={() => setMessage("Your order is being prepared.")}
            >
              Order in Progress
            </button>
            <button
              className="bg-red-300 px-2 py-1 rounded"
              onClick={() => setMessage("There is an issue with your order.")}
            >
              Order Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
