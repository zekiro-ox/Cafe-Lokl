import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./config/firebase";
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const notify = (message, id, type = "error") => {
  if (!toast.isActive(id)) {
    if (type === "error") {
      toast.error(message, { toastId: id });
    } else if (type === "success") {
      toast.success(message, { toastId: id });
    }
  }
}; // Ensure the correct path

const AddProductForm = ({ onAddProduct }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState([
    { name: "", price: "", recommendedAmount: "" },
  ]); // Updated state
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  // Predefined drink categories
  const drinkCategories = [
    "Hot Drinks",
    "Ice Blended",
    "Non-Coffee",
    "Tea",
    "Mocktails",
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
    setIngredients([...ingredients, { name: "", price: "" }]); // Updated to add an object
  };

  const handleIngredientChange = (index, event, field) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = event.target.value;
    setIngredients(newIngredients);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setImage(file);
    } else {
      notify("Please upload a valid image file (JPG or PNG).", "invalid_image");
      setImage(null);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name || !category || !subCategory || !price || !description) {
      notify("Please fill in all required fields.", "missing_fields");
      return;
    }
    const validIngredients = ingredients.filter(
      (ingredient) =>
        ingredient.name.trim() !== "" &&
        ingredient.price !== "" &&
        ingredient.recommendedAmount !== ""
    );

    if (validIngredients.length === 0) {
      notify(
        "Please add at least one valid ingredient.",
        "invalid_ingredients"
      );
      return;
    }

    const newProduct = {
      name,
      category,
      subCategory,
      price,
      available, // Ensure this is boolean
      ingredients: ingredients.filter(
        (ingredient) =>
          ingredient.name.trim() !== "" &&
          ingredient.price !== "" &&
          ingredient.recommendedAmount !== ""
      ),
      image,
      description, // Image file to be handled in ProductPage
    };

    onAddProduct(newProduct);
    notify("Product added successfully!", "product_added", "success");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto"
    >
      <ToastContainer />
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
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded-lg w-full"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            Add-ons Ingredients
          </label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center mb-2 gap-2">
              <select
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, e, "name")}
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
              <input
                type="number"
                placeholder="Price"
                value={ingredient.price}
                onChange={(e) => handleIngredientChange(index, e, "price")}
                className="p-2 border rounded-lg w-24"
              />
              <input
                type="number"
                placeholder="Recommended Amount"
                value={ingredient.recommendedAmount}
                onChange={(e) =>
                  handleIngredientChange(index, e, "recommendedAmount")
                }
                className="p-2 border rounded-lg w-24"
              />
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
            accept=".jpg, .jpeg, .png"
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
