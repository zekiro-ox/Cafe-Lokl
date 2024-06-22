import React, { useState } from "react";

const AddProductForm = ({ onAddProduct }) => {
  const [name, setName] = useState("");
  const [categoryOptions] = useState([
    "Hot Drinks",
    "Ice Blended",
    "Non Coffee",
    "Tea",
    "Mocktails",
  ]); // Example categories for coffee products
  const [category, setCategory] = useState("");
  const [subCategoryOptions, setSubCategoryOptions] = useState({
    "Hot Drinks": ["Espresso", "Cappuccino", "Latte", "Macchiato"],
    "Ice Blended": ["Frappuccino", "Iced Latte", "Smoothie"],
    "Non Coffee": ["Hot Chocolate", "Tea Latte", "Chai Latte"],
    Tea: ["Black Tea", "Green Tea", "Herbal Tea"],
    Mocktails: ["Mango Tango", "Berry Bliss", "Tropical Sunset"],
  });
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([""]);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredientField = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name,
      category,
      subCategory,
      price,
      available: true,
      image: image ? URL.createObjectURL(image) : "",
      ingredients: ingredients.filter((ingredient) => ingredient.trim() !== ""),
    };
    onAddProduct(newProduct);
    setName("");
    setCategory("");
    setSubCategory("");
    setPrice("");
    setImage(null);
    setIngredients([""]);
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setSubCategory(""); // Reset subCategory when category changes
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg mt-6"
    >
      <h2 className="text-2xl font-bold text-brown-500 mb-4">Add Product</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Category</label>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="w-full p-2 border rounded-lg"
          required
        >
          <option value="">Select Category</option>
          {categoryOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {category && (
        <div className="mb-4">
          <label className="block text-gray-700">Sub Category</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="">Select Sub Category</option>
            {subCategoryOptions[category].map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-gray-700">Price</label>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Image</label>
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full p-2 border rounded-lg"
        />
        {image && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(image)}
              alt="Product Preview"
              className="w-48 h-48 object-cover mt-2"
            />
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Ingredients</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              className="w-full p-2 border rounded-lg mr-2"
              placeholder="Ingredient"
            />
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeIngredientField(index)}
                className="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addIngredientField}
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
        >
          Add Ingredient
        </button>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
        >
          Add Product
        </button>
      </div>
    </form>
  );
};

export default AddProductForm;
