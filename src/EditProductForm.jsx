import React, { useState, useEffect } from "react";

const EditProductForm = ({ product, onUpdateProduct, onCancel }) => {
  const [name, setName] = useState(product.name || "");
  const [categoryOptions] = useState([
    "Hot Drinks",
    "Ice Blended",
    "Non Coffee",
    "Tea",
    "Mocktails",
  ]);
  const [category, setCategory] = useState(product.category || "");
  const [subCategory, setSubCategory] = useState(product.subCategory || "");
  const [price, setPrice] = useState(product.price || "");
  const [image, setImage] = useState(product.image || "");
  const [imagePreview, setImagePreview] = useState(product.image || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ingredients, setIngredients] = useState(product.ingredients || [""]);

  useEffect(() => {
    setIngredients(product.ingredients || [""]);
    setImage(product.image || "");
    setImagePreview(product.image || "");
  }, [product]);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Debug: Log the updatedProduct object
    console.log("Submitting Product:", {
      name,
      category,
      subCategory,
      price,
      image: selectedFile ? URL.createObjectURL(selectedFile) : image,
      ingredients: ingredients.filter((ingredient) => ingredient.trim() !== ""),
    });

    const updatedProduct = {
      ...product,
      name,
      category,
      subCategory,
      price,
      image: selectedFile ? URL.createObjectURL(selectedFile) : image,
      ingredients: ingredients.filter((ingredient) => ingredient.trim() !== ""),
    };

    onUpdateProduct(updatedProduct);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setSubCategory(""); // Clear subCategory when category changes
  };

  const handleSubCategoryChange = (e) => {
    setSubCategory(e.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg mt-6"
    >
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
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
          onChange={handleFileChange}
          accept="image/*"
          className="w-full p-2 border rounded-lg"
        />
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Product Preview"
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
              onChange={(e) => handleIngredientChange(index, e.target.value)}
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
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Update Product
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
