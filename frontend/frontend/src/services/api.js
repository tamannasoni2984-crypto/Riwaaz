const BASE_URL = "http://localhost:5000/api";

// 1. GET all products with query params
export const getProducts = async (params = {}) => {
  let query = "";
  if (typeof params === "string") {
    query = params ? `?category=${encodeURIComponent(params)}` : "";
  } else if (typeof params === "object") {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.append(k, v);
      }
    });
    const qs = searchParams.toString();
    query = qs ? `?${qs}` : "";
  }

  const response = await fetch(`${BASE_URL}/products${query}`);
  return await response.json();
};

// 2. GET single product by ID
export const getProductByIdApi = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  return await response.json();
};

// 3. GET categories with counts
export const getCategoriesApi = async () => {
  const response = await fetch(`${BASE_URL}/products/categories`);
  return await response.json();
};

// 4. User Login
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

// 5. User Signup / Register
export const registerUserApi = async (userData) => {
  const isFormData = userData instanceof FormData;
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    body: isFormData ? userData : JSON.stringify(userData),
  });
  return await response.json();
};

// 6. Add Product
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

// 7. Update Product
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

// 8. Delete Product
export const deleteProductApi = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return await response.json();
};

// 9. Add Review to Product
export const addProductReviewApi = async (id, reviewData) => {
  const response = await fetch(`${BASE_URL}/products/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(reviewData),
  });
  return await response.json();
};

// 10. Orders APIs
export const createOrderApi = async (orderData) => {
  const response = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(orderData),
  });
  return await response.json();
};

export const getOrdersApi = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/orders${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  return await response.json();
};

export const getUserOrdersApi = async () => {
  const response = await fetch(
    `${BASE_URL}/orders/my-orders`,
    {
      credentials: "include",
    }
  );

  return await response.json();
};

export const updateOrderStatusApi = async (orderId, orderStatus, cancellationReason = "") => {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderStatus, cancellationReason }),
  });
  return await response.json();
};

export const cancelOrderApi = async (orderId, cancellationReason = "") => {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ cancellationReason }),
  });
  return await response.json();
};
