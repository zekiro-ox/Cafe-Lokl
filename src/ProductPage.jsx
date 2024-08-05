import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc, // Import deleteDoc
  doc, // Import doc
} from "./config/firebase";

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [isEditVisible, setEditVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, "products"), orderBy("id", "asc"));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    };

    fetchProducts();
  }, []);

  const generateProductId = async () => {
    const q = query(
      collection(db, "products"),
      orderBy("id", "desc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return "000001";
    } else {
      const lastProductId = querySnapshot.docs[0].data().id;
      const newId = (parseInt(lastProductId) + 1).toString().padStart(6, "0");
      return newId;
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddProduct = async (newProduct) => {
    const newProductId = await generateProductId();
    const productWithId = { ...newProduct, id: newProductId };

    await addDoc(collection(db, "products"), productWithId);
    setProducts((prevProducts) => [...prevProducts, productWithId]);
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

  const handleDeleteProduct = async (id) => {
    try {
      // Delete the document from Firestore
      await deleteDoc(doc(db, "products", id));
      // Remove the product from the state
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  const handleViewDescription = (product) => {
    setViewProduct(product);
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
              <FaPlus className="mr-2" />
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
                      className={`flex items-center px-4 py-2 rounded-2xl ${
                        product.available
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white`}
                    >
                      {product.available ? (
                        <FaToggleOn className="mr-2 ml-2" />
                      ) : (
                        <FaToggleOff className="mr-2 ml-2" />
                      )}
                    </button>
                  </td>
                  <td className="flex items-center py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => handleViewDescription(product)}
                      className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-2xl hover:bg-yellow-600"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {viewProduct && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Product Description</h2>
            <p>{viewProduct.description}</p>
            <button
              onClick={() => setViewProduct(null)}
              className="mt-4 px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
