import { useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import { Link } from "react-router-dom";
import "./Wishlist.css";

function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast?.() || {};

  const [itemToRemove, setItemToRemove] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddToCart = (product) => {
    addToCart(product);
    if (showToast) {
      showToast(`🛍️ "${product.name}" added to cart!`, "success");
    }
  };

  const handleClearWishlist = () => {
    clearWishlist();
    setShowClearConfirm(false);
    if (showToast) {
      showToast("Wishlist cleared successfully.", "info");
    }
  };

  return (
    <main className="wishlist-page-wrapper">
      {/* Hero Banner Section */}
      <section className="wishlist-hero-banner">
        <div className="wishlist-hero-overlay"></div>
        <div className="wishlist-hero-content">
          <h1>MY WISHLIST</h1>
          <div className="wishlist-hero-divider"></div>
          <nav className="wishlist-breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">-</span>
            <span className="breadcrumb-current">My Wishlist</span>
          </nav>
        </div>
      </section>

      {/* Main Wishlist Content */}
      <div className="wishlist-main-container">
        {!wishlistItems || wishlistItems.length === 0 ? (
          /* Empty Wishlist State */
          <div className="wishlist-empty-card">
            <div className="empty-wishlist-icon">♡</div>
            <h2>Your Wishlist is Empty</h2>
            <p>
              Explore our curated fine jewellery collections and save your favorite mastercrafts.
            </p>
            <Link to="/collections" className="wishlist-explore-btn">
              Explore Collections
            </Link>
          </div>
        ) : (
          /* Wishlist Table & Actions */
          <div className="wishlist-table-card">
            {/* Table Header */}
            <div className="wishlist-table-header">
              <div className="col-product">PRODUCT</div>
              <div className="col-price">PRICE</div>
              <div className="col-stock">STOCK STATUS</div>
              <div className="col-action">ADD TO CART</div>
            </div>

            {/* Table Items */}
            <div className="wishlist-table-body">
              {wishlistItems.map((product) => {
                const isOutOfStock = product.stock === 0;
                const categoryLabel = product.category || product.subCategory || "Jewellery";

                return (
                  <div key={product.id || product._id} className="wishlist-item-row">
                    {/* Product Image & Title */}
                    <div className="col-product item-product-info">
                      <div className="item-thumbnail-box">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="item-title-col">
                        <span className="item-category-tag">{categoryLabel}</span>
                        <h3 className="item-title-name">{product.name}</h3>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-price item-price-value">
                      <span>₹{(product.price || 0).toLocaleString("en-IN")}</span>
                    </div>

                    {/* Stock Status */}
                    <div className="col-stock item-stock-status">
                      {isOutOfStock ? (
                        <span className="stock-badge out-of-stock">
                          <span className="stock-dot">●</span> Out of Stock
                        </span>
                      ) : (
                        <span className="stock-badge in-stock">
                          <span className="stock-check">✓</span> In Stock
                        </span>
                      )}
                    </div>

                    {/* Add to Cart & Remove */}
                    <div className="col-action item-action-col">
                      <button
                        className="wishlist-shop-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock ? "SOLD OUT" : "SHOP NOW"}
                      </button>

                      <button
                        className="wishlist-remove-icon-btn"
                        onClick={() => setItemToRemove(product)}
                        title="Remove from Wishlist"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="wishlist-bottom-actions">
              <div className="actions-left-group">
                <button
                  className="wishlist-action-btn secondary-btn"
                  onClick={() => setShowClearConfirm(true)}
                >
                  CLEAR WISHLIST
                </button>
                <Link to="/collections" className="wishlist-action-btn secondary-btn">
                  UPDATE WISHLIST
                </Link>
              </div>

              <div className="actions-right-group">
                <Link to="/collections" className="wishlist-action-btn primary-btn">
                  CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Single Item Removal Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        title="Remove from Wishlist?"
        message={
          itemToRemove
            ? `Are you sure you want to remove "${itemToRemove.name}" from your wishlist?`
            : ""
        }
        confirmText="Yes, Remove"
        onConfirm={() => {
          if (itemToRemove) {
            removeFromWishlist(itemToRemove.id);
            setItemToRemove(null);
            if (showToast) {
              showToast("Item removed from wishlist.", "info");
            }
          }
        }}
        onClose={() => setItemToRemove(null)}
      />

      {/* Clear All Wishlist Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear Wishlist?"
        message="Are you sure you want to clear all items from your wishlist?"
        confirmText="Yes, Clear All"
        onConfirm={handleClearWishlist}
        onClose={() => setShowClearConfirm(false)}
      />
    </main>
  );
}

export default Wishlist;