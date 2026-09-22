import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import "./Productcard.css";

function Productcard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast?.() || {};

  if (!product) return null;

  const productId = String(product._id || product.id);
  const inWishlist = isInWishlist(productId);

  const handleCardClick = () => {
    navigate(`/product/${productId}`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist({ ...product, id: productId, _id: productId });
    if (showToast) {
      if (!inWishlist) {
        showToast(`Added "${product.name}" to Wishlist`, "wishlist-add");
      } else {
        showToast(`Removed "${product.name}" from Wishlist`, "wishlist-remove");
      }
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const added = addToCart({ ...product, _id: productId });
    if (added && showToast) {
      showToast(`Added "${product.name}" to Cart!`, "cart");
    }
  };

  const rating = product.rating || 4.8;

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <div className="product-image">
        {product.isNew && <span className="product-new-badge">NEW</span>}
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
            e.target.src = "/images/ring.png";
          }}
        />
      </div>
      <div className="product-info">
        <div>
          <span className="product-cat-tag">{product.category || "Jewellery"}</span>
          <h3>{product.name}</h3>
          <div className="product-rating-row">
            <span className="stars">★ {rating}</span>
            {product.reviews?.length > 0 && (
              <span className="review-count">({product.reviews.length})</span>
            )}
          </div>
        </div>
        <div>
          <p className="product-price">
            ₹{product.price ? Number(product.price).toLocaleString("en-IN") : "0"}
          </p>
          <button className="add-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Productcard;
