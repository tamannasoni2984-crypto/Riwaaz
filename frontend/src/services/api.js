const BASE_URL = "http://localhost:5000/api";

// 1. GET all products from Backend
export const getProducts = async (category = "") => {
  const url = category ? `${BASE_URL}/products?category=${encodeURIComponent(category)}` : `${BASE_URL}/products`;
  const response = await fetch(url);
  return await response.json();
};

// 2. User Login (POST JSON)
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // sends cookies
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

// 3. Add Product (POST FormData or JSON)
export const createProduct = async (productData) => {
  const isFormData = productData instanceof FormData;
  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    body: isFormData ? productData : JSON.stringify(productData),
  });
  return await response.json();
};

// 4. Update Product (PUT FormData or JSON)
export const updateProductApi = async (id, productData) => {
  const isFormData = productData instanceof FormData;
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    body: isFormData ? productData : JSON.stringify(productData),
  });
  return await response.json();
};

// 5. Delete Product (DELETE)
export const deleteProductApi = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return await response.json();
};

