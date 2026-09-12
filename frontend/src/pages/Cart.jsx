import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import CheckoutModal from "../components/CheckoutModal";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const { showToast } = useToast?.() || {};

  // State for shipping selection
  const [shippingCost, setShippingCost] = useState(0);

  // State for promo code
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  // State for Checkout Modal
  const [showCheckout, setShowCheckout] = useState(false);

  // State for Removal Confirmation Modal
  const [itemToRemove, setItemToRemove] = useState(null);

  // Calculate total items count
  const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Handle promo code apply
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === "RIWAAZ10" || cleanCode === "ROYAL10" || cleanCode === "DISCOUNT10") {
      const disc = Math.round(cartTotal * 0.1);
      setDiscount(disc);
      setAppliedCode(cleanCode);
      if (showToast) showToast(`✨ Code ${cleanCode} applied: ₹${disc.toLocaleString("en-IN")} discount!`, "success");
    } else if (cleanCode === "GOLD500") {
      const disc = Math.min(500, cartTotal);
      setDiscount(disc);
      setAppliedCode(cleanCode);
      if (showToast) showToast(`✨ Code ${cleanCode} applied: ₹500 discount!`, "success");
    } else {
      if (showToast) {
        showToast("Invalid promo code. Try RIWAAZ10 for 10% off!", "error");
      } else {
        alert("Invalid promo code. Try RIWAAZ10 for 10% off!");
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-card-container empty-container">
          <div className="cart-empty-view">
            <div className="empty-cart-icon-ring">🛍️</div>
            <h2>Your Shopping Cart is Empty</h2>
            <p>Explore our handcrafted royal jewellery and find your timeless masterpiece.</p>
            <Link to="/collections" className="back-to-shop-btn">
              Explore Collections
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const grandTotal = Math.max(0, cartTotal + Number(shippingCost) - discount);

  return (
    <main className="cart-page">
      <div className="cart-card-container">
        {/* LEFT COLUMN: Shopping Cart Items */}
        <div className="cart-items-section">
          {/* Header */}
          <div className="cart-section-header">
            <h2>Shopping Cart</h2>
            <span className="cart-items-count">
              {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
            </span>
          </div>

          <hr className="cart-divider" />

          {/* Items List */}
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const categoryLabel = item.category || item.subCategory || "Fine Jewellery";
              const itemTotal = item.price * (item.quantity || 1);

              return (
                <div className="cart-item-row" key={item.id}>
                  {/* Thumbnail */}
                  <div className="cart-item-image-wrapper">
                    <img src={item.image} alt={item.name} />
                  </div>

                  {/* Title & Category */}
                  <div className="cart-item-info-col">
                    <span className="cart-item-category">{categoryLabel}</span>
                    <h3 className="cart-item-name">{item.name}</h3>
                  </div>

                  {/* Quantity Control: - [ 1 ] + */}
                  <div className="cart-item-qty-col">
                    <button
                      className="qty-btn"
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="qty-number-box">{item.quantity || 1}</span>
                    <button
                      className="qty-btn"
                      onClick={() => increaseQuantity(item.id)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <div className="cart-item-price-col">
                    <span>₹{itemTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Remove Button (✕) */}
                  <button
                    className="cart-item-remove-btn"
                    onClick={() => setItemToRemove(item)}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer: Back to shop link */}
          <div className="cart-footer-nav">
            <Link to="/collections" className="back-to-shop-link">
              <span className="back-arrow">←</span> Back to shop
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="cart-summary-section">
          <div className="cart-summary-header">
            <h2>Summary</h2>
          </div>

          <hr className="summary-divider" />

          {/* Items Subtotal Row */}
          <div className="summary-row">
            <span className="summary-label-tracked">ITEMS {totalItemsCount}</span>
            <span className="summary-value-bold">₹{cartTotal.toLocaleString("en-IN")}</span>
          </div>

          {/* Shipping Dropdown */}
          <div className="summary-block">
            <label htmlFor="shipping-select" className="summary-field-title">
              SHIPPING
            </label>
            <div className="select-wrapper">
              <select
                id="shipping-select"
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="summary-select"
              >
                <option value={0}>Standard-Delivery - FREE</option>
                <option value={500}>Express Insured Delivery - ₹500.00</option>
                <option value={1500}>Royal White-Glove Vault - ₹1,500.00</option>
              </select>
            </div>
          </div>

          {/* Promo Code Input ("GIVE CODE") */}
          <div className="summary-block">
            <label htmlFor="promo-code-input" className="summary-field-title">
              GIVE CODE
            </label>
            <form onSubmit={handleApplyPromo} className="promo-input-wrapper">
              <input
                id="promo-code-input"
                type="text"
                placeholder="Enter your code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input"
              />
              <button type="submit" className="promo-submit-btn" aria-label="Apply promo code">
                →
              </button>
            </form>
            {appliedCode && (
              <div className="promo-applied-tag">
                <span>Code <strong>{appliedCode}</strong> applied (-₹{discount.toLocaleString("en-IN")})</span>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCode("");
                    setDiscount(0);
                    setPromoCode("");
                  }}
                  className="remove-promo-btn"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Total Price & Checkout */}
          <div className="summary-footer">
            <hr className="summary-divider" />

            <div className="summary-total-row">
              <span className="summary-total-label">TOTAL PRICE</span>
              <span className="summary-total-price">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <button
              className="summary-checkout-btn"
              onClick={() => setShowCheckout(true)}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />

      {/* Removal Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        title="Remove Item from Cart?"
        message={
          itemToRemove
            ? `Are you sure you want to remove "${itemToRemove.name}" from your cart?`
            : ""
        }
        confirmText="Yes, Remove"
        onConfirm={() => {
          if (itemToRemove) {
            removeFromCart(itemToRemove.id);
            setItemToRemove(null);
          }
        }}
        onClose={() => setItemToRemove(null)}
      />
    </main>
  );
}

export default Cart;