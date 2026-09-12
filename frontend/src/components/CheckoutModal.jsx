import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./CheckoutModal.css";

export default function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, addresses } = useAuth();
  const { showToast } = useToast();

  // Selected address state
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddr ? defaultAddr.id : "new"
  );

  // New Address state if user chooses to type new address
  const [newFullName, setNewFullName] = useState(user ? user.name : "");
  const [newPhone, setNewPhone] = useState(user ? user.phone : "");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("Mumbai");
  const [newPincode, setNewPincode] = useState("400001");

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Order Placement state
  const [isPlaced, setIsPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  if (!isOpen) return null;

  const taxes = Math.round(cartTotal * 0.18); // 18% GST
  const grandTotal = cartTotal + taxes;

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    // Generate Order ID
    const orderId = "RW-2026-" + Math.floor(1000 + Math.random() * 9000);
    setPlacedOrderId(orderId);
    setIsPlaced(true);

    // Trigger Success Toast Popup
    if (showToast) {
      showToast(`🎉 Order Placed Successfully! (${orderId})`, "success");
    }

    // Clear cart
    clearCart();
  };

  const handleClose = () => {
    setIsPlaced(false);
    onClose();
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal-card">
        {/* Close Button */}
        <button className="checkout-close-btn" onClick={handleClose}>
          ✕
        </button>

        {isPlaced ? (
          /* ORDER SUCCESS SCREEN */
          <div className="checkout-success-view">
            <div className="success-icon-badge">🎉</div>
            <h2>Order Confirmed!</h2>
            <p className="order-id-label">
              Order ID: <strong>#{placedOrderId}</strong>
            </p>
            <p className="success-desc">
              Thank you for shopping with RIWAAZ. Your luxury items will be handcrafted, insured, and delivered in 2-4 business days.
            </p>

            <div className="order-summary-box">
              <h4>Order Breakdown</h4>
              <p>Items Subtotal: <span>₹{cartTotal.toLocaleString("en-IN")}</span></p>
              <p>GST & Insurance (18%): <span>₹{taxes.toLocaleString("en-IN")}</span></p>
              <p>Shipping: <span className="free-shipping">FREE Express</span></p>
              <hr />
              <p className="total-row">Grand Total Paid: <strong>₹{grandTotal.toLocaleString("en-IN")}</strong></p>
            </div>

            <button className="continue-shopping-btn" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <div className="checkout-form-view">
            <div className="checkout-header">
              <h2>Complete Your Order</h2>
              <p>Select delivery address and payment method to finalize checkout.</p>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-body">
              {/* Left Column: Address & Payment */}
              <div className="checkout-main-col">
                {/* 1. SHIPPING ADDRESS */}
                <div className="checkout-section">
                  <h3>1. Select Delivery Address</h3>
                  
                  {addresses.length > 0 && (
                    <div className="saved-addresses-selector">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`checkout-addr-option ${
                            selectedAddressId === addr.id ? "selected" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressSelect"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                          />
                          <div>
                            <strong>{addr.fullName}</strong> ({addr.label})
                            <p>{addr.street}, {addr.city} - {addr.pincode}</p>
                            <span className="phone-num">📞 {addr.phone}</span>
                          </div>
                        </label>
                      ))}

                      <label
                        className={`checkout-addr-option ${
                          selectedAddressId === "new" ? "selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="addressSelect"
                          value="new"
                          checked={selectedAddressId === "new"}
                          onChange={() => setSelectedAddressId("new")}
                        />
                        <div>
                          <strong>+ Enter New Delivery Address</strong>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* New Address Input Form if "new" selected or no addresses */}
                  {(selectedAddressId === "new" || addresses.length === 0) && (
                    <div className="new-address-form-box">
                      <div className="form-row-2">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Street Address / House No. *"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        required
                      />
                      <div className="form-row-2">
                        <input
                          type="text"
                          placeholder="City *"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Pincode *"
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PAYMENT METHOD */}
                <div className="checkout-section">
                  <h3>2. Payment Method</h3>
                  <div className="payment-options-grid">
                    <label className={`pay-card ${paymentMethod === "upi" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="pay"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                      />
                      <span>⚡ UPI / GPay / PhonePe</span>
                    </label>

                    <label className={`pay-card ${paymentMethod === "card" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="pay"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />
                      <span>💳 Credit / Debit Card</span>
                    </label>

                    <label className={`pay-card ${paymentMethod === "cod" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="pay"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <span>💵 Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Summary & Place Order */}
              <div className="checkout-side-col">
                <div className="side-summary-card">
                  <h3>Order Summary ({cartItems.length} items)</h3>

                  <div className="side-items-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="side-item-row">
                        <img src={item.image} alt={item.name} />
                        <div>
                          <h6>{item.name}</h6>
                          <p>Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="side-calculation">
                    <p>Subtotal: <span>₹{cartTotal.toLocaleString("en-IN")}</span></p>
                    <p>GST & Insurance (18%): <span>₹{taxes.toLocaleString("en-IN")}</span></p>
                    <p>Express Shipping: <span className="free-tag">FREE</span></p>
                    <hr />
                    <p className="grand-total-row">
                      Total Payable: <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
                    </p>
                  </div>

                  <button type="submit" className="place-order-btn">
                    Place Order (₹{grandTotal.toLocaleString("en-IN")})
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
