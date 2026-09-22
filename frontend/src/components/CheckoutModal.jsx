import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import "./CheckoutModal.css";

export default function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, addresses } = useAuth();
  const { placeOrder } = useOrders();
  const { showToast } = useToast?.() || {};

  // Selected address state
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddr ? defaultAddr.id : "new"
  );

  // New Address state
  // const [newFullName, setNewFullName] = useState(user ? user.name : "");
  // const [newPhone, setNewPhone] = useState(user ? user.phone : "+91 98765 43210");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("Mumbai");
  const [newPincode, setNewPincode] = useState("400001");

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Order Placement state
  const [isPlacing, setIsPlacing] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [placedGrandTotal, setPlacedGrandTotal] = useState(0);

  if (!isOpen) return null;

  const taxes = Math.round(cartTotal * 0.18); // 18% GST
  const grandTotal = cartTotal + taxes;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsPlacing(true);

    let customerInfo = {
      fullName: user?.name || "Valued Customer",
      email: user?.email || "",
      phone: user?.phone || "",
    };

    let shippingAddress = {};

    if (selectedAddressId !== "new" && addresses.length > 0) {
      const selected = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
      customerInfo.fullName = selected.fullName;
      customerInfo.phone = selected.phone;
      shippingAddress = {
        street: selected.street,
        city: selected.city,
        state: selected.state || "Maharashtra",
        pincode: selected.pincode,
      };
    } else {
      shippingAddress = {
        street: newStreet || "Luxury Avenue",
        city: newCity || "Mumbai",
        state: "Maharashtra",
        pincode: newPincode || "400001",
      };
    }

    const orderPayload = {
      customer: customerInfo,
      shippingAddress,
      items: cartItems.map((item) => ({
        id: item.id || item._id,
        _id: item._id || item.id,
        name: item.name,
        image: item.image || "/images/ring.png",
        price: Number(item.price),
        quantity: item.quantity || 1,
        karat: item.selectedKarat || "18K Yellow Gold",
        size: item.selectedSize || "Standard",
      })),
      itemsTotal: cartTotal,
      tax: taxes,
      shippingFee: 0,
      discount: 0,
      grandTotal,
      paymentMethod,
    };

    const savedOrder = await placeOrder(orderPayload);
    const finalOrderId = savedOrder.orderId || "RW-2026-" + Math.floor(1000 + Math.random() * 9000);

    setPlacedOrderId(finalOrderId);
    setPlacedGrandTotal(grandTotal);
    setIsPlaced(true);
    setIsPlacing(false);

    if (showToast) {
      showToast(`🎉 Order Placed Successfully! (${finalOrderId})`, "success");
    }

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
              Thank you for shopping with RIWAAZ. Your luxury pieces will be handcrafted, insured, and delivered in 2-4 business days.
            </p>

            <div className="order-summary-box">
              <h4>Order Breakdown</h4>
              <p>Items Subtotal: <span>₹{cartTotal ? cartTotal.toLocaleString("en-IN") : (placedGrandTotal - Math.round(placedGrandTotal * 0.18)).toLocaleString("en-IN")}</span></p>
              <p>GST & White-Glove Insurance (18%): <span>₹{taxes ? taxes.toLocaleString("en-IN") : Math.round(placedGrandTotal * 0.18).toLocaleString("en-IN")}</span></p>
              <p>Shipping: <span className="free-shipping">FREE Express Insured</span></p>
              <hr />
              <p className="total-row">Grand Total Paid: <strong>₹{placedGrandTotal.toLocaleString("en-IN")}</strong></p>
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
                          className={`checkout-addr-option ${selectedAddressId === addr.id ? "selected" : ""
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
                        className={`checkout-addr-option ${selectedAddressId === "new" ? "selected" : ""
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

                  {/* New Address Input Form */}
                  {/* {(selectedAddressId === "new" || addresses.length === 0) && (
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
                  )} */}
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
                    {cartItems.map((item, idx) => (
                      <div key={`${item.id || item._id}-${idx}`} className="side-item-row">
                        <img
                          src={item.image || "/images/ring.png"}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/ring.png";
                          }}
                        />
                        <div>
                          <h6>{item.name}</h6>
                          <p>
                            Qty: {item.quantity} × ₹{(Number(item.price) || 0).toLocaleString("en-IN")}
                          </p>
                          {item.selectedKarat && (
                            <span style={{ fontSize: "11px", color: "#888" }}>
                              {item.selectedKarat}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="side-calculation">
                    <p>Subtotal: <span>₹{cartTotal.toLocaleString("en-IN")}</span></p>
                    <p>GST & White-Glove Insurance (18%): <span>₹{taxes.toLocaleString("en-IN")}</span></p>
                    <p>Express Shipping: <span className="free-tag">FREE</span></p>
                    <hr />
                    <p className="grand-total-row">
                      Total Payable: <strong>₹{grandTotal.toLocaleString("en-IN")}</strong>
                    </p>
                  </div>

                  <button type="submit" className="place-order-btn" disabled={isPlacing}>
                    {isPlacing ? "Securing Order..." : `Place Order (₹${grandTotal.toLocaleString("en-IN")})`}
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
