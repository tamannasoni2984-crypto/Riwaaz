import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("riwaaz_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("riwaaz_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart items to localStorage", e);
    }
  }, [cartItems]);

  const addToCart = useCallback((product, options = {}) => {
    // Require user to be logged in before adding to cart
    if (!user) {
      setShowLoginPrompt(true);
      return false;
    }

    if (!product) return false;

    // Support MongoDB _id and fallback id
    const prodId = String(product._id || product.id || Date.now());

    const selectedKarat =
      options.karat ||
      product.selectedKarat ||
      "18K Yellow Gold";

    const selectedSize =
      options.size ||
      product.selectedSize ||
      "Standard";

    setCartItems((items) => {

      const existingIndex = items.findIndex(
        (item) =>
          String(item._id || item.id) === prodId &&
          item.selectedKarat === selectedKarat &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        return items.map((item, idx) =>
          idx === existingIndex
            ? {
              ...item,
              quantity:
                (item.quantity || 1) +
                (options.quantity || 1),
            }
            : item
        );
      }

      return [
        ...items,
        {
          ...product,
          id: prodId,
          _id: prodId,
          selectedKarat,
          selectedSize,
          price: Number(product.price) || 0,
          quantity: options.quantity || 1,
        },
      ];
    });

    return true;
  }, [user]);

  const removeFromCart = useCallback((id, selectedKarat, selectedSize) => {
    setCartItems((items) =>
      items.filter((item) => {
        const matchId = String(item.id || item._id) === String(id);
        if (!selectedKarat) return !matchId;
        return !(
          matchId &&
          item.selectedKarat === selectedKarat &&
          item.selectedSize === selectedSize
        );
      })
    );
  }, []);

  const increaseQuantity = useCallback((id) => {
    setCartItems((items) =>
      items.map((item) =>
        String(item.id || item._id) === String(id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((id) => {
    setCartItems((items) =>
      items
        .map((item) =>
          String(item.id || item._id) === String(id)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + (item.quantity || 1), 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + (Number(item.price) || 0) * (item.quantity || 1), 0),
    [cartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem("riwaaz_cart");
    } catch (e) {
      console.error("Failed to remove cart items from localStorage", e);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartTotal,
        showLoginPrompt,
        setShowLoginPrompt,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}