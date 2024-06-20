// EditProductForm.js
import React, { useState, useEffect } from "react";

const EditProductForm = ({ product, onUpdateProduct, onCancel }) => {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [subCategory, setSubCategory] = useState(product.subCategory);
  const [price, setPrice] = useState(product.price);
  const [image, setImage] = useState(product.image);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ingredients, setIngredients] = useState(product.ingredients || [""]);

  useEffect(() => {
    setIngredients(product.ingredients || [""]);
    setImage(product.image);
  }, [product]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProduct = {
      ...product,
      name,
      category,
      subCategory,
      price,
      image,
      ingredients: ingredients.filter((ingredient) => ingredient.trim() !== ""),
    };
    onUpdateProduct(updatedProduct);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg mt-6"
    >
      <h2 className="text-2xl font-bold text-brown-500 mb-4">Edit Product</h2>
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
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Sub Category</label>
        <input
          type="text"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
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
          onChange={handleFileChange}
          className="w-full p-2 border rounded-lg"
        />
        {image && (
          <div className="mt-4">
            <img
              src={image}
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
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
        >
          Update Product
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
