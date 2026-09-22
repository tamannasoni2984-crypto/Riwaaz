import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  getProducts,
  createProduct as createProductApi,
  updateProductApi,
  deleteProductApi,
  addProductReviewApi,
} from "../services/api.js";
import { PRODUCTS as FALLBACK_PRODUCTS } from "../data/products.js";

const ProductContext = createContext();

const LOCAL_STORAGE_KEY = "riwaaz_products";
const MODIFIED_FLAG_KEY = "riwaaz_products_modified";

const getInitialProducts = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("⚠️ [ProductContext] Failed to read localStorage:", e);
  }
  return FALLBACK_PRODUCTS;
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(getInitialProducts);
  const [loading, setLoading] = useState(false);
  const isInitialMount = useRef(true);

  // Sync to localStorage whenever products state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    } catch (err) {
      console.error("⚠️ [ProductContext] Failed to sync to localStorage:", err);
    }
  }, [products]);

  // Fetch products from backend API
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const hasUserModified = localStorage.getItem(MODIFIED_FLAG_KEY) === "true";

        if (!hasUserModified) {
          setProducts(res.data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.data));
        } else {
          setProducts((currentLocal) => {
            const currentIds = new Set(currentLocal.map((p) => String(p._id || p.id)));
            const newBackendItems = res.data.filter((bp) => !currentIds.has(String(bp._id || bp.id)));
            if (newBackendItems.length > 0) {
              const merged = [...currentLocal, ...newBackendItems];
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
              return merged;
            }
            return currentLocal;
          });
        }
      }
    } catch (err) {
      console.log("ℹ️ [ProductContext] Backend offline / using local storage products", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Add Product
  const addProduct = async (newProductData) => {
    const isFormData = newProductData instanceof FormData;
    const dataObj = isFormData
      ? Object.fromEntries(newProductData.entries())
      : newProductData;

    const tempId = Date.now();
    const productToAdd = {
      id: tempId,
      _id: String(tempId),
      rating: 4.8,
      isNew: true,
      isFeatured: true,
      stock: 20,
      reviews: [],
      karat: ["18K Yellow Gold", "22K Royal Gold", "950 Platinum", "18K Rose Gold"],
      sizes: ["12 (Standard)", "14", "16", "18", "Free Size"],
      ...dataObj,
      price: Number(dataObj.price) || 0,
      image: typeof dataObj.image === "string" ? dataObj.image : "/images/ring.png",
    };

    localStorage.setItem(MODIFIED_FLAG_KEY, "true");

    setProducts((prev) => {
      const updated = [productToAdd, ...prev];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await createProductApi(newProductData);
      if (res.success && res.data) {
        setProducts((prev) => {
          const updated = prev.map((item) =>
            item.id === tempId ? { ...res.data, id: res.data._id || tempId } : item
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        return res.data;
      }
    } catch (err) {
      console.warn("ℹ️ [ProductContext] Backend createProduct skipped, saved locally:", err);
    }
    return productToAdd;
  };

  // Update Product
  const updateProduct = async (id, updatedFields) => {
    const isFormData = updatedFields instanceof FormData;
    const dataObj = isFormData
      ? Object.fromEntries(updatedFields.entries())
      : updatedFields;

    localStorage.setItem(MODIFIED_FLAG_KEY, "true");

    setProducts((prev) => {
      const updated = prev.map((item) => {
        const itemId = item._id || item.id;
        if (itemId === id || String(itemId) === String(id)) {
          return {
            ...item,
            ...dataObj,
            price: dataObj.price !== undefined ? Number(dataObj.price) : item.price,
            rating: dataObj.rating !== undefined ? Number(dataObj.rating) : item.rating,
            image: typeof dataObj.image === "string" ? dataObj.image : item.image,
          };
        }
        return item;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await updateProductApi(id, updatedFields);
      if (res.success && res.data) {
        setProducts((prev) => {
          const updated = prev.map((item) =>
            (item._id === id || item.id === id) ? { ...res.data, id: res.data._id || id } : item
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.warn("ℹ️ [ProductContext] Backend updateProduct skipped, saved locally:", err);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    localStorage.setItem(MODIFIED_FLAG_KEY, "true");

    setProducts((prev) => {
      const updated = prev.filter((item) => {
        const itemId = item._id || item.id;
        return itemId !== id && String(itemId) !== String(id);
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    try {
      await deleteProductApi(id);
    } catch (err) {
      console.warn("ℹ️ [ProductContext] Backend deleteProduct skipped, removed locally:", err);
    }
  };

  // Add Review to Product
  const addReview = async (productId, reviewData) => {
    const newReview = {
      user: reviewData.user || "Valued Connoisseur",
      rating: Number(reviewData.rating) || 5,
      comment: reviewData.comment || "",
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => {
      const updated = prev.map((item) => {
        const itemId = item._id || item.id;
        if (String(itemId) === String(productId)) {
          const prevReviews = item.reviews || [];
          const updatedReviews = [newReview, ...prevReviews];
          const newAvgRating = Number(
            (updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          return {
            ...item,
            reviews: updatedReviews,
            rating: newAvgRating,
          };
        }
        return item;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    try {
      await addProductReviewApi(productId, reviewData);
    } catch (err) {
      console.warn("Backend add review skipped, saved locally:", err);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
