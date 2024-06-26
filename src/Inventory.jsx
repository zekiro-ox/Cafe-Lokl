import React, { useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Sidebar from "./Sidebar";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([
    { id: 1, name: "Item 1", productId: "P001", available: true, onHand: 10 },
    { id: 2, name: "Item 2", productId: "P002", available: false, onHand: 5 },
    { id: 3, name: "Item 3", productId: "P003", available: true, onHand: 8 },
    { id: 4, name: "Item 4", productId: "P004", available: true, onHand: 12 },
    { id: 5, name: "Item 5", productId: "P005", available: false, onHand: 3 },
    // Add more mock data here
  ]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    available: true,
    onHand: 0,
  });

  const [editItemIndex, setEditItemIndex] = useState(null); // Track index of item being edited
  const [editedItem, setEditedItem] = useState({
    name: "",
    productId: "",
    available: true,
    onHand: 0,
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const generateProductId = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
    return `P${randomNumber}`;
  };

  const handleAddItem = () => {
    const generatedProductId = generateProductId();
    const newItemWithId = { ...newItem, productId: generatedProductId };
    setItems((prevItems) => [...prevItems, newItemWithId]);
    setFormVisible(false);
    setNewItem({ name: "", available: true, onHand: 0 });
  };

  const toggleAvailability = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleEditItem = (index) => {
    setEditItemIndex(index); // Set the index of the item being edited
    const itemToEdit = items[index];
    if (itemToEdit) {
      setEditedItem({ ...itemToEdit });
    }
  };

  const handleUpdateItem = () => {
    if (editItemIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editItemIndex] = {
        ...editedItem,
        id: items[editItemIndex].id,
      };
      setItems(updatedItems);
      setEditItemIndex(null);
      setEditedItem({ name: "", productId: "", available: true, onHand: 0 });
    }
  };

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full md:w-auto"
              />
              <FaSearch className="absolute top-3 left-2 text-gray-500" />
            </div>
            <button
              onClick={() => setFormVisible(!isFormVisible)}
              className="flex items-center px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 md:px-6 md:py-3 md:text-lg"
            >
              <FaPlus className="mr-2" />{" "}
              {isFormVisible ? "Cancel" : "Add Item"}
            </button>
          </div>
        </div>
        {isFormVisible && (
          <div className="flex flex-wrap space-y-4 md:space-x-4 md:space-y-0">
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full md:w-auto"
            />
            <input
              type="number"
              placeholder="On Hand"
              value={newItem.onHand}
              onChange={(e) =>
                setNewItem({ ...newItem, onHand: parseInt(e.target.value) })
              }
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full md:w-auto"
            />
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full md:w-auto"
            >
              Add
            </button>
          </div>
        )}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-brown-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">No.</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Product ID</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">On Hand</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter(
                  (item) =>
                    item.productId
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">
                      {editItemIndex === index ? (
                        <input
                          type="text"
                          value={editedItem.name}
                          onChange={(e) =>
                            setEditedItem({
                              ...editedItem,
                              name: e.target.value,
                            })
                          }
                          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-3 px-4">{item.productId}</td>
                    <td className="py-3 px-4 text-center">
                      {item.available ? (
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className="flex items-center px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                        >
                          <FaToggleOn className="mr-2" /> Available
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleAvailability(item.id)}
                          className="flex items-center px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        >
                          <FaToggleOff className="mr-2" /> Not Available
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editItemIndex === index ? (
                        <input
                          type="number"
                          value={editedItem.onHand}
                          onChange={(e) =>
                            setEditedItem({
                              ...editedItem,
                              onHand: parseInt(e.target.value),
                            })
                          }
                          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                        />
                      ) : (
                        item.onHand
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editItemIndex === index ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleUpdateItem}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          >
                            <FaCheck className="mr-0" />
                          </button>
                          <button
                            onClick={() => {
                              setEditItemIndex(null);
                              setEditedItem({
                                name: "",
                                productId: "",
                                available: true,
                                onHand: 0,
                              });
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <FaTimes className="mr-0" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditItem(index)}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
