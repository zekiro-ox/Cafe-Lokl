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
  deleteDoc,
  doc,
  updateDoc,
} from "./config/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [isEditVisible, setEditVisible] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, "products"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Use Firestore document ID
        ...doc.data(),
      }));
      setProducts(productsData);
    };

    fetchProducts();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddProduct = async (newProduct) => {
    let imageUrl = "";
    if (newProduct.image) {
      const storage = getStorage();
      const storageRef = ref(storage, `products/${newProduct.image.name}`);
      await uploadBytes(storageRef, newProduct.image);
      imageUrl = await getDownloadURL(storageRef);
    }

    const newProductData = { ...newProduct, image: imageUrl };

    const docRef = await addDoc(collection(db, "products"), newProductData);
    const newProductWithId = { ...newProductData, id: docRef.id }; // Add Firestore document ID

    setProducts((prevProducts) => [...prevProducts, newProductWithId]);
    setFormVisible(false);
  };

  const toggleAvailability = async (id) => {
    // Find the product to toggle
    const product = products.find((product) => product.id === id);

    if (product) {
      // Toggle the availability status
      const updatedProduct = { ...product, available: !product.available };

      try {
        // Reference to the Firestore document
        const productDocRef = doc(db, "products", id);

        // Update the document in Firestore
        await updateDoc(productDocRef, { available: updatedProduct.available });

        // Update the local state
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === id ? updatedProduct : product
          )
        );
      } catch (error) {
        console.error("Error updating document: ", error);
        alert("Failed to update availability. Please try again.");
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setEditVisible(true);
  };

  const handleUpdateProduct = async (updatedProduct) => {
    let imageUrl = updatedProduct.image;
    if (updatedProduct.selectedFile) {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `products/${updatedProduct.selectedFile.name}`
      );
      await uploadBytes(storageRef, updatedProduct.selectedFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const updatedProductData = { ...updatedProduct, image: imageUrl };
    const productDocRef = doc(db, "products", updatedProduct.id); // Use Firestore document ID
    await updateDoc(productDocRef, updatedProductData);

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProductData : product
      )
    );
    setEditVisible(false);
    setEditProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== id)
        );
      } catch (error) {
        console.error("Error deleting product: ", error);
        alert("Failed to delete the product. Please try again.");
      }
    }
  };

  const handleViewProduct = (product) => {
    setViewProduct(product);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Products</h2>
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative flex-1 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full md:w-80 p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
              />
              <FaSearch className="absolute top-3 left-2 text-gray-500" />
            </div>
            <button
              onClick={() => setFormVisible(!isFormVisible)}
              className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
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
                    {product.available ? (
                      <FaToggleOn
                        onClick={() => toggleAvailability(product.id)}
                        className="text-green-500 cursor-pointer hover:text-green-600"
                      />
                    ) : (
                      <FaToggleOff
                        onClick={() => toggleAvailability(product.id)}
                        className="text-red-500 cursor-pointer hover:text-red-600"
                      />
                    )}
                  </td>
                  <td className="flex items-center justify-center py-3 px-4 space-x-2">
                    <FaEye
                      onClick={() => handleViewProduct(product)}
                      className="text-yellow-500 cursor-pointer hover:text-yellow-600"
                    />
                    <FaEdit
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-500 cursor-pointer hover:text-blue-600"
                    />
                    <FaTrash
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 cursor-pointer hover:text-red-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {viewProduct && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <h3 className="text-xl font-bold mb-4">Product Details</h3>
              <div className="mb-4">
                <p>
                  <strong>ID:</strong> {viewProduct.id}
                </p>
                <p>
                  <strong>Name:</strong> {viewProduct.name}
                </p>
                <p>
                  <strong>Description:</strong> {viewProduct.description}
                </p>
                <p>
                  <strong>Category:</strong> {viewProduct.category}
                </p>
                <p>
                  <strong>Sub Category:</strong> {viewProduct.subCategory}
                </p>
                <p>
                  <strong>Price:</strong> {viewProduct.price}
                </p>
                <p>
                  <strong>Ingredients:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    {viewProduct.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.name} | P {ingredient.price} |{" "}
                        {ingredient.recommendedAmount}
                      </li>
                    ))}
                  </ul>
                </p>
                {viewProduct.image && (
                  <div className="mt-4 mb-4">
                    <img
                      src={viewProduct.image}
                      alt={viewProduct.name}
                      className="max-w-full rounded-lg shadow-lg h-64 object-contain"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
