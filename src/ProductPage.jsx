// ProductPage.js
import React, { useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Product 1",
      category: "Category 1",
      subCategory: "Sub Category 1",
      price: "10",
      available: true,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Cappuccino_at_Sightglass_Coffee.jpg/640px-Cappuccino_at_Sightglass_Coffee.jpg",
      ingredients: ["Ingredient 1", "Ingredient 2"],
    },
    {
      id: 2,
      name: "Product 2",
      category: "Category 2",
      subCategory: "Sub Category 2",
      price: "20",
      available: false,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Cappuccino_at_Sightglass_Coffee.jpg/640px-Cappuccino_at_Sightglass_Coffee.jpg",
      ingredients: ["Ingredient 3", "Ingredient 4"],
    },
    {
      id: 3,
      name: "Product 3",
      category: "Category 3",
      subCategory: "Sub Category 3",
      price: "30",
      available: true,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Cappuccino_at_Sightglass_Coffee.jpg/640px-Cappuccino_at_Sightglass_Coffee.jpg",
      ingredients: ["Ingredient 5", "Ingredient 6"],
    },
  ]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [isEditVisible, setEditVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddProduct = (newProduct) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
    setFormVisible(false);
  };

  const toggleAvailability = (id) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id
          ? { ...product, available: !product.available }
          : product
      )
    );
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setEditVisible(true);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setEditVisible(false);
    setEditProduct(null);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
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
              {isFormVisible ? "Cancel" : "Add Product"}
            </button>
          </div>
        </div>
        {isFormVisible && <AddProductForm onAddProduct={handleAddProduct} />}
        {isEditVisible && editProduct && (
          <EditProductForm
            product={editProduct}
            onUpdateProduct={handleUpdateProduct}
            onCancel={() => setEditVisible(false)}
          />
        )}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead className="bg-brown-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Sub Category</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="py-3 px-4">{product.id}</td>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">{product.subCategory}</td>
                  <td className="py-3 px-4">
                    {"P "}
                    {product.price}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleAvailability(product.id)}
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        product.available
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white`}
                    >
                      {product.available ? (
                        <FaToggleOn className="mr-2" />
                      ) : (
                        <FaToggleOff className="mr-2" />
                      )}
                      {product.available ? "Available" : "Not Available"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
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

export default ProductPage;
