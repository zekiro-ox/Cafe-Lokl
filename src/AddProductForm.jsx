import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./config/firebase"; // Ensure the correct path

const AddProductForm = ({ onAddProduct }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState([""]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [image, setImage] = useState(null);

  // Predefined drink categories
  const drinkCategories = [
    "Hot Drinks",
    "Ice Blend",
    "Tea",
    "Frappe",
    "Juices",
    "Dessert",
  ];

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Ingredients"));
        const options = querySnapshot.docs.map((doc) => doc.data().name);
        setIngredientOptions(options);
      } catch (error) {
        console.error("Error fetching ingredients: ", error);
      }
    };

    fetchIngredients();
  }, []);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleIngredientChange = (index, event) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = event.target.value;
    setIngredients(newIngredients);
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newProduct = {
      name,
      category,
      subCategory,
      price,
      available, // Ensure this is boolean
      ingredients: ingredients.filter((ingredient) => ingredient.trim() !== ""),
      image, // Image file to be handled in ProductPage
    };

    onAddProduct(newProduct);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Add Product</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded-lg w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded-lg w-full"
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {drinkCategories.map((drink, index) => (
              <option key={index} value={drink}>
                {drink}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sub Category</label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="p-2 border rounded-lg w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 border rounded-lg w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={available}
            onChange={(e) => setAvailable(e.target.value === "true")}
            className="p-2 border rounded-lg w-full"
          >
            <option value={true}>Available</option>
            <option value={false}>Unavailable</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center mb-2">
              <select
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e)}
                className="p-2 border rounded-lg flex-1"
              >
                <option value="" disabled>
                  Select Ingredient
                </option>
                {ingredientOptions.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {index === ingredients.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="ml-2 px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
                >
                  Add Ingredient
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="p-2 border rounded-lg w-full"
          />
        </div>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 mt-4"
      >
        Add Product
      </button>
    </form>
  );
};

export default AddProductForm;
