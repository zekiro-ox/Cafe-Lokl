import React, { useState } from "react";
import { collection, addDoc, db } from "./config/firebase"; // Ensure the path is correct

const AddProductForm = ({ onAddProduct }) => {
  const [name, setName] = useState("");
  const [categoryOptions] = useState([
    "Hot Drinks",
    "Ice Blended",
    "Non Coffee",
    "Tea",
    "Mocktails",
  ]);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(""); // State for image preview
  const [ingredients, setIngredients] = useState([""]);
  const [showRemoveButtons, setShowRemoveButtons] = useState(false);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setSubCategory(""); // Clear subCategory when category changes
  };

  const handleSubCategoryChange = (e) => {
    setSubCategory(e.target.value);
  };

  const handleIngredientChange = (index, event) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = event.target.value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(URL.createObjectURL(file)); // Set image preview URL
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now().toString(),
      name,
      category,
      subCategory,
      price,
      available: true,
      image: image ? URL.createObjectURL(image) : "",
      ingredients: ingredients.filter((ingredient) => ingredient.trim() !== ""),
    };

    try {
      await addDoc(collection(db, "products"), newProduct);
      onAddProduct(newProduct); // Notify ProductPage to update its state
      setName("");
      setCategory("");
      setSubCategory("");
      setPrice("");
      setImage(null);
      setImagePreview(""); // Clear image preview
      setIngredients([""]);
      setShowRemoveButtons(false);
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Category</label>
        <select
          value={category}
          onChange={handleCategoryChange}
          required
          className="w-full p-2 border rounded-lg"
        >
          <option value="">Select a category</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Sub Category</label>
        <input
          type="text"
          value={subCategory}
          onChange={handleSubCategoryChange}
          required
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Image</label>
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          className="w-full p-2 border rounded-lg"
        />
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-50 h-24 object-contain border rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Ingredients</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(event) => handleIngredientChange(index, event)}
              className="w-full p-2 border rounded-lg"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="ml-2 p-2 bg-red-500 text-white rounded-lg"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddIngredient}
          className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
        >
          Add Ingredient
        </button>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Add Product
        </button>
      </div>
    </form>
  );
};

export default AddProductForm;
