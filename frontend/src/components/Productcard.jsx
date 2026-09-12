import React from "react";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import "./Productcard.css";

function Productcard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  if (!product) return null;

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist({ ...product, id: productId });
    if (!inWishlist) {
      showToast(`Added "${product.name}" to Wishlist`, "wishlist-add");
    } else {
      showToast(`Removed "${product.name}" from Wishlist`, "wishlist-remove");
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({ ...product, id: productId });
    showToast(`Added "${product.name}" to Cart!`, "cart");
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <button
          className={`wishlist-btn ${inWishlist ? "active" : ""}`}
          onClick={handleWishlist}
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist button"
        >
          {inWishlist ? "♥" : "♡"}
        </button>
        <img
          src={product.image || "/images/ring.png"}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/ring-removebg-preview.png";
          }}
        />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-price">
          ₹{product.price ? product.price.toLocaleString("en-IN") : "0"}
        </p>
        <button className="add-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default Productcard;
