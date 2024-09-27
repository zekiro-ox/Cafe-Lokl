import React, { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { storage, db } from "./config/firebase"; // Adjust path as necessary

const EditProductForm = ({ product, onUpdateProduct, onCancel }) => {
  const [name, setName] = useState(product.name || "");
  const [category, setCategory] = useState(product.category || "");
  const [subCategory, setSubCategory] = useState(product.subCategory || "");
  const [price, setPrice] = useState(product.price || "");
  const [available, setAvailable] = useState(product.available || true);
  const [ingredients, setIngredients] = useState(product.ingredients || []);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState(product.description || "");

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

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "");
      setSubCategory(product.subCategory || "");
      setPrice(product.price || "");
      setAvailable(product.available || true);
      setIngredients(
        product.ingredients || [{ name: "", price: "" }] // Update to include price
      );
      setDescription(product.description || "");
    }
  }, [product]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", price: "" }]);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleImageChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadProductImage = async (file) => {
    const imageRef = ref(storage, `products/${file.name}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let imageURL = product.image; // Preserve existing image URL if no new image is uploaded

    if (selectedFile) {
      try {
        imageURL = await uploadProductImage(selectedFile);
      } catch (error) {
        console.error("Error uploading image: ", error);
        return; // Stop the submit process if image upload fails
      }
    }

    const updatedProduct = {
      name,
      category,
      subCategory,
      price,
      available, // Ensure this is boolean
      ingredients: ingredients.filter(
        (ingredient) =>
          ingredient.name.trim() !== "" && ingredient.price.trim() !== ""
      ),
      image: imageURL,
      description,
    };

    const productDocRef = doc(db, "products", product.id);

    try {
      await updateDoc(productDocRef, updatedProduct);
      onUpdateProduct({ ...updatedProduct, id: product.id }); // Include the ID in the updated product
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg max-w-4xl mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
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
            <div key={index} className="flex items-center mb-2">
              <select
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
                className="p-2 border rounded-lg flex-1 mr-2"
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
                value={ingredient.price}
                onChange={(e) =>
                  handleIngredientChange(index, "price", e.target.value)
                }
                placeholder="Price"
                className="p-2 border rounded-lg w-20"
              />
              {index === ingredients.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="ml-2 px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
                >
                  Add
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
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
          )}
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
        >
          Update Product
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
