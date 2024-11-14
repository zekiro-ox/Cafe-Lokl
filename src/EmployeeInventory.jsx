import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaCheck,
  FaTimes,
  FaFolderOpen,
  FaFolder,
} from "react-icons/fa";
import EmployeeSidebar from "./EmployeeSidebar";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./config/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const notify = (message, id, type = "error") => {
  if (!toast.isActive(id)) {
    if (type === "error") {
      toast.error(message, { toastId: id });
    } else if (type === "success") {
      toast.success(message, { toastId: id });
    }
  }
};

const EmployeeInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    available: true,
    onHand: 0,
    type: "Ingredients",
  });
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editedItem, setEditedItem] = useState({
    name: "",
    productId: "",
    available: true,
    onHand: 0,
  });
  const [selectedFolder, setSelectedFolder] = useState("Ingredients");

  useEffect(() => {
    fetchItems();
  }, [selectedFolder]);

  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, selectedFolder));
      const itemsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsList);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const generateProductId = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `P${randomNumber}`;
  };

  const handleAddItem = async () => {
    if (!newItem.name || newItem.onHand < 0) {
      notify(
        "Please fill in all required fields and ensure 'On Hand' is not negative.",
        "missing_fields"
      );
      return;
    }
    const generatedProductId = generateProductId();
    const newItemWithId = {
      ...newItem,
      productId: generatedProductId,
      type: selectedFolder,
    };

    try {
      const collectionRef = collection(db, selectedFolder);
      await addDoc(collectionRef, newItemWithId);
      setItems((prevItems) => [...prevItems, newItemWithId]);
      setFormVisible(false);
      setNewItem({
        name: "",
        available: true,
        onHand: 0,
        type: selectedFolder,
      });
      notify("Item added successfully!", "item_added", "success"); // Success toast
    } catch (error) {
      console.error("Error adding document: ", error);
      notify("Error adding item. Please try again.", "add_item_error"); // Error toast
    }
  };

  const toggleAvailability = async (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, available: !item.available } : item
    );

    // Find the updated item
    const itemToUpdate = updatedItems.find((item) => item.id === id);

    if (itemToUpdate) {
      try {
        const itemRef = doc(db, selectedFolder, id);
        await updateDoc(itemRef, { available: itemToUpdate.available });

        // Update local state
        setItems(updatedItems);
        notify(
          `Item availability updated to ${
            itemToUpdate.available ? "available" : "not available"
          }.`,
          "availability_updated",
          "success"
        ); // Success toast
      } catch (error) {
        console.error("Error updating availability: ", error);
        notify(
          "Error updating item availability. Please try again.",
          "availability_error"
        ); // Error toast
      }
    }
  };

  const handleEditItem = (index) => {
    setEditItemIndex(index);

    const itemToEdit = items[index];
    if (itemToEdit) {
      setEditedItem({ ...itemToEdit });
    }
  };

  const handleUpdateItem = async () => {
    if (editItemIndex !== null) {
      // Validate the edited item fields
      if (!editedItem.name || editedItem.onHand < 0) {
        notify(
          "Please fill in all required fields and ensure 'On Hand' is not negative.",
          "missing_fields"
        );
        return;
      }
      const updatedItems = [...items];
      updatedItems[editItemIndex] = {
        ...editedItem,
        id: items[editItemIndex].id,
      };

      try {
        const itemRef = doc(db, selectedFolder, updatedItems[editItemIndex].id);
        await updateDoc(itemRef, editedItem);
        setItems(updatedItems);
        setEditItemIndex(null);
        setEditedItem({ name: "", productId: "", available: true, onHand: 0 });
        notify("Item updated successfully!", "item_updated", "success"); // Success toast
      } catch (error) {
        console.error("Error updating document: ", error);
        notify("Error updating item. Please try again.", "update_item_error"); // Error toast
      }
    }
  };

  const renderTable = (filteredItems) => (
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
          {filteredItems
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
                    <FaToggleOn
                      className="text-green-500 cursor-pointer"
                      onClick={() => toggleAvailability(item.id)}
                    />
                  ) : (
                    <FaToggleOff
                      className="text-red-500 cursor-pointer"
                      onClick={() => toggleAvailability(item.id)}
                    />
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
                      <FaCheck
                        className="text-blue-500 cursor-pointer"
                        onClick={handleUpdateItem}
                      />
                      <FaTimes
                        className="text-gray-500 cursor-pointer"
                        onClick={() => {
                          setEditItemIndex(null);
                          setEditedItem({
                            name: "",
                            productId: "",
                            available: true,
                            onHand: 0,
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <FaEdit
                      className="text-blue-500 cursor-pointer"
                      onClick={() => handleEditItem(index)}
                    />
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row">
      <EmployeeSidebar />
      <div className="flex-grow p-8 bg-gray-100 lg:ml-[250px] ml-0">
        <ToastContainer />
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-wrap items-center mb-4 sm:mb-0">
            <button
              className={`flex items-center px-4 py-2 rounded-lg mr-4 ${
                selectedFolder === "Ingredients"
                  ? "bg-brown-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
              onClick={() => setSelectedFolder("Ingredients")}
            >
              {selectedFolder === "Ingredients" ? (
                <FaFolderOpen className="mr-2" />
              ) : (
                <FaFolder className="mr-2" />
              )}
              Ingredients
            </button>
            <button
              className={`flex items-center px-4 py-2 rounded-lg ${
                selectedFolder === "Packaging"
                  ? "bg-brown-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
              onClick={() => setSelectedFolder("Packaging")}
            >
              {selectedFolder === "Packaging" ? (
                <FaFolderOpen className="mr-2" />
              ) : (
                <FaFolder className="mr-2" />
              )}
              Packaging
            </button>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name or ID"
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 pl-8 w-full"
            />
            <FaSearch className="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        <button
          onClick={() => setFormVisible(!isFormVisible)}
          className="flex items-center px-4 py-2 rounded-lg bg-brown-500 text-white hover:bg-brown-600 mb-4 text-sm md:text-base"
        >
          {isFormVisible ? <>Cancel</> : <>Add Item</>}
        </button>
        {isFormVisible && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="block font-medium mb-1">Name:</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Available:</label>
                <select
                  value={newItem.available}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      available: e.target.value === "true",
                    })
                  }
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">On Hand:</label>
                <input
                  type="number"
                  value={newItem.onHand}
                  onChange={(e) =>
                    setNewItem({ ...newItem, onHand: parseInt(e.target.value) })
                  }
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full"
                />
              </div>
            </div>
            <button
              onClick={handleAddItem}
              className="mt-4 px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
            >
              Add Item
            </button>
          </div>
        )}
        {renderTable(items)}
      </div>
    </div>
  );
};

export default EmployeeInventory;
