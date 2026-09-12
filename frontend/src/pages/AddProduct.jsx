import { useState } from "react";
import axios from "axios";

function AddProduct() {
    const [product, setProduct] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        image: "",
        stock: "",
    });

    const handleChange = (e) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:5000/api/products",
                product
            );

            console.log(response.data);

            alert("Product added successfully!");

            setProduct({
                name: "",
                price: "",
                description: "",
                category: "",
                image: "",
                stock: "",
            });
        } catch (error) {
            console.log(error);
            alert("Failed to add product");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="name"
                placeholder="Product name"
                value={product.name}
                onChange={handleChange}
            />

            <input
                name="price"
                type="number"
                placeholder="Price"
                value={product.price}
                onChange={handleChange}
            />

            <input
                name="category"
                placeholder="Category"
                value={product.category}
                onChange={handleChange}
            />

            <input
                name="image"
                placeholder="Image URL"
                value={product.image}
                onChange={handleChange}
            />

            <input
                name="stock"
                type="number"
                placeholder="Stock"
                value={product.stock}
                onChange={handleChange}
            />

            <textarea
                name="description"
                placeholder="Description"
                value={product.description}
                onChange={handleChange}
            />

            <button type="submit">
                Add Product
            </button>
        </form>
    );
}

export default AddProduct;