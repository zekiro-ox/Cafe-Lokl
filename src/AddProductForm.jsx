// AddProductForm.js
import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

const AddProductForm = ({ onAddProduct }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name || !category || !price) {
      alert("Please fill in all fields.");
      return;
    }
    const newProduct = {
      id: Date.now(),
      name,
      category,
      price,
      available: true,
      image: URL.createObjectURL(image),
    };
    onAddProduct(newProduct);
    setName("");
    setCategory("");
    setPrice("");
    setImage(null);
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold text-brown-500 mb-4">Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="category">
            Category
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="price">
            Price
          </label>
          <input
            type="text"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="image">
            Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
          />
          {image && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(image)}
                alt="Product"
                className="w-32 h-32 object-cover"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
