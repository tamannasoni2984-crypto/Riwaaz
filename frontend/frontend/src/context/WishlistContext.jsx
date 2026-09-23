import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem("riwaaz_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("riwaaz_wishlist", JSON.stringify(wishlistItems));
    } catch (e) {
      console.error("Failed to save wishlist to localStorage", e);
    }
  }, [wishlistItems]);

  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    const prodId = String(product._id || product.id);

    setWishlistItems((currentItems) => {
      const exists = currentItems.some(
        (item) => String(item.id || item._id) === prodId
      );

      if (exists) {
        return currentItems.filter(
          (item) => String(item.id || item._id) !== prodId
        );
      }

      return [...currentItems, { ...product, id: prodId, _id: prodId }];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const strId = String(productId);
      return wishlistItems.some(
        (item) => String(item.id || item._id) === strId
      );
    },
    [wishlistItems]
  );

  const removeFromWishlist = useCallback((productId) => {
    if (!productId) return;
    const strId = String(productId);
    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) => String(item.id || item._id) !== strId
      )
    );
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}