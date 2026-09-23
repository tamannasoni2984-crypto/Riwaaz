import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const {
    user,
    addresses,
    login,
    signup,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  const { getUserOrders, cancelOrder } = useOrders();

  // Mode: "login" | "signup"
  const [authMode, setAuthMode] = useState("login");

  // Logged-in Account Sub-tab: "addresses" | "profile" | "orders"
  const [accountTab, setAccountTab] = useState("orders");

  // Auth Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(user ? user.name : "");
  const [editPhone, setEditPhone] = useState(user ? user.phone : "");
  const [profileMsg, setProfileMsg] = useState("");

  const [userOrders, setUserOrders] = useState([]);

  // Cancel Order Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("Changed my mind");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Logout Confirmation Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      const orders = await getUserOrders();
      setUserOrders(Array.isArray(orders) ? orders : []);
    };

    loadOrders();
  }, [getUserOrders]);

  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order);
    setCancelReasonPreset("Changed my mind");
    setCustomCancelReason("");
    setCancelError("");
  };

  const handleConfirmCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;

    const finalReason =
      cancelReasonPreset === "Other"
        ? (customCancelReason.trim() || "Customer requested cancellation")
        : (customCancelReason.trim()
            ? `${cancelReasonPreset}: ${customCancelReason.trim()}`
            : cancelReasonPreset);

    setIsCancelling(true);
    setCancelError("");

    try {
      const orderIdentifier = cancelModalOrder._id || cancelModalOrder.orderId;
      const updated = await cancelOrder(orderIdentifier, finalReason);

      setUserOrders((prev) =>
        prev.map((o) =>
          o._id === updated._id || o.orderId === updated.orderId ? updated : o
        )
      );

      setCancelModalOrder(null);
    } catch (err) {
      setCancelError(err.message || "Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmitting(true);

    if (!loginEmail || !loginPassword) {
      setAuthError("Please enter both email and password.");
      setIsSubmitting(false);
      return;
    }

    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (res.success) {
      setAuthSuccess(res.message);
    } else {
      setAuthError(res.message);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmitting(true);

    if (!signupName || !signupEmail || !signupPassword) {
      setAuthError("Please fill in all mandatory fields.");
      setIsSubmitting(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    const res = await signup(signupName, signupEmail, signupPhone, signupPassword);
    setIsSubmitting(false);
    if (res.success) {
      setAuthSuccess(res.message);
    } else {
      setAuthError(res.message);
    }
  };

  // Quick Demo Login
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    await login("tamanna.soni@riwaaz.com", "demo12345");
    setIsSubmitting(false);
  };

  // Open Address Form
  const openAddressModal = (addrToEdit = null) => {
    if (addrToEdit) {
      setEditingAddressId(addrToEdit.id);
      setAddrLabel(addrToEdit.label || "Home");
      setAddrFullName(addrToEdit.fullName || "");
      setAddrPhone(addrToEdit.phone || "");
      setAddrStreet(addrToEdit.street || "");
      setAddrCity(addrToEdit.city || "");
      setAddrState(addrToEdit.state || "");
      setAddrPincode(addrToEdit.pincode || "");
      setAddrIsDefault(addrToEdit.isDefault || false);
    } else {
      setEditingAddressId(null);
      setAddrLabel("Home");
      setAddrFullName(user ? user.name : "");
      setAddrPhone(user ? user.phone : "");
      setAddrStreet("");
      setAddrCity("Mumbai");
      setAddrState("Maharashtra");
      setAddrPincode("400001");
      setAddrIsDefault(addresses.length === 0);
    }
    setShowAddressForm(true);
  };

  // Save Address
  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addrFullName || !addrStreet || !addrCity || !addrPincode) {
      alert("Please fill all required address fields.");
      return;
    }

    const payload = {
      label: addrLabel,
      fullName: addrFullName,
      phone: addrPhone,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: addrIsDefault,
    };

    if (editingAddressId) {
      updateAddress(editingAddressId, payload);
    } else {
      addAddress(payload);
    }

    setShowAddressForm(false);
  };

  // Handle Profile Update
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name: editName, phone: editPhone });
    setProfileMsg("Profile updated successfully!");
    setTimeout(() => setProfileMsg(""), 3000);
  };

  if (!user) {
    return (
      <main className="auth-page-wrapper">
        <div className="auth-card-container">
          <div className="auth-brand-header">
            <img src="/images/riwaaz-logo.svg" alt="RIWAAZ" className="auth-logo-icon" />
            <h2>RIWAAZ LUXURY</h2>
            <p>Sign in to manage your orders, saved addresses, and wishlist.</p>
          </div>

          <div className="auth-mode-tabs">
            <button
              className={`auth-tab-btn ${authMode === "login" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setAuthSuccess("");
              }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn ${authMode === "signup" ? "active" : ""}`}
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
                setAuthSuccess("");
              }}
            >
              Create Account
            </button>
          </div>

          {authError && <div className="auth-alert error-alert">{authError}</div>}
          {authSuccess && <div className="auth-alert success-alert">{authSuccess}</div>}

          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label>Password</label>
                </div>
                <div className="password-input-wrapper">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In to Account"}
              </button>

              <div className="demo-login-divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="demo-login-btn"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
              >
                ⚡ Instant VIP Demo Sign-In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Tamanna Soni"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showSignupPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create RIWAAZ Account"}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="account-dashboard-wrapper">
      <div className="dashboard-container">
        {/* Profile Summary Header */}
        <div className="user-profile-header">
          <div className="user-avatar-circle">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="user-details-summary">
            <h2>Welcome back, {user.name}!</h2>
            <p className="user-email-text">{user.email} • {user.phone}</p>
            <span className="user-status-tag">✨ {user.memberStatus || "Gold VIP Member"}</span>
          </div>

          <button onClick={() => setShowLogoutModal(true)} className="logout-btn">
            Sign Out
          </button>
        </div>

        {/* Account Sub-Navigation Tabs */}
        <div className="account-subtabs">
          <button
            className={`subtab-btn ${accountTab === "orders" ? "active" : ""}`}
            onClick={() => setAccountTab("orders")}
          >
            📦 My Orders ({userOrders.length})
          </button>
          <button
            className={`subtab-btn ${accountTab === "addresses" ? "active" : ""}`}
            onClick={() => setAccountTab("addresses")}
          >
            📍 Saved Addresses ({addresses.length})
          </button>
          <button
            className={`subtab-btn ${accountTab === "profile" ? "active" : ""}`}
            onClick={() => setAccountTab("profile")}
          >
            👤 Edit Profile
          </button>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {accountTab === "orders" && (
          <div className="orders-tab-content">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3>Your Royal Orders History</h3>
                <p>Track your orders, delivery progress, and view purchase details.</p>
              </div>
              <Link to="/shop" style={{ color: "#b8860b", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>
                + Explore More Jewels
              </Link>
            </div>

            {userOrders.length === 0 ? (
              <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", textAlign: "center", border: "1px solid #eaeaea" }}>
                <span style={{ fontSize: "40px" }}>🛍️</span>
                <h4 style={{ marginTop: "12px", fontSize: "18px" }}>No orders placed yet</h4>
                <p style={{ color: "#777", marginBottom: "20px" }}>Discover our exclusive signature jewelry and place your first royal order.</p>
                <Link to="/shop" style={{ background: "#111", color: "#fff", padding: "10px 24px", borderRadius: "25px", textDecoration: "none", fontWeight: "700" }}>
                  Browse Shop
                </Link>
              </div>
            ) : (
              <div className="order-history-list" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {Array.isArray(userOrders) && userOrders.map((order) => {
                  const isCancelled = order.orderStatus === "Cancelled";
                  const isDelivered = order.orderStatus === "Delivered";
                  const isShipped = order.orderStatus === "Shipped";
                  const isProcessing = order.orderStatus === "Processing";
                  const canCancel = order.orderStatus === "Pending" || order.orderStatus === "Processing";

                  return (
                    <div
                      key={order.orderId || order._id}
                      className="order-history-card"
                      style={{ background: "#fff", borderRadius: "16px", padding: "24px", border: "1px solid #eaeaea", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}
                    >
                      <div className="order-header-row" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "14px", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <span style={{ fontWeight: "800", fontSize: "16px", color: "#111" }}>
                            Order #{order.orderId}
                          </span>
                          <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                            {order.trackingNumber && ` • Tracking: ${order.trackingNumber}`}
                          </div>
                        </div>
                        <div>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "15px",
                              fontWeight: "700",
                              fontSize: "12px",
                              background: isDelivered
                                ? "#d1fae5"
                                : isShipped
                                  ? "#dbeafe"
                                  : isCancelled
                                    ? "#fee2e2"
                                    : isProcessing
                                      ? "#ede9fe"
                                      : "#fef3c7",
                              color: isDelivered
                                ? "#065f46"
                                : isShipped
                                  ? "#1e40af"
                                  : isCancelled
                                    ? "#991b1b"
                                    : isProcessing
                                      ? "#5b21b6"
                                      : "#92400e",
                            }}
                          >
                            ● {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items in order */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <img
                              src={item.image || "/images/ring.png"}
                              alt={item.name}
                              style={{ width: "50px", height: "50px", objectFit: "contain", borderRadius: "8px", background: "#f9f9f9" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/ring.png";
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <h5 style={{ margin: "0 0 2px", fontSize: "14px", color: "#111" }}>{item.name}</h5>
                              <span style={{ fontSize: "12px", color: "#777" }}>
                                Qty: {item.quantity} • ₹{Number(item.price)?.toLocaleString("en-IN")}
                                {item.karat ? ` • ${item.karat}` : ""}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Cancellation Note if Cancelled */}
                      {isCancelled && (
                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#991b1b" }}>
                          <div><strong>Cancellation Reason:</strong> {order.cancellationReason || "Cancelled by customer"}</div>
                          {order.cancelledAt && (
                            <div style={{ fontSize: "11px", color: "#b91c1c", marginTop: "4px" }}>
                              Cancelled on {new Date(order.cancelledAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: "14px", fontSize: "14px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <span>Shipping to: </span>
                          <strong style={{ color: "#333" }}>{order.shippingAddress?.city}, {order.shippingAddress?.pincode}</strong>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div style={{ fontSize: "15px" }}>
                            Grand Total: <strong style={{ color: "#b8860b", fontWeight: "900" }}>₹{Number(order.grandTotal)?.toLocaleString("en-IN")}</strong>
                          </div>
                          <Link
                            to={`/orders/${order.orderId || order._id}`}
                            style={{ padding: "6px 14px", borderRadius: "8px", background: "#f3f4f6", color: "#1f2937", textDecoration: "none", fontSize: "12px", fontWeight: "700", border: "1px solid #e5e7eb" }}
                          >
                            Details →
                          </Link>
                          {canCancel && (
                            <button
                              onClick={() => handleOpenCancelModal(order)}
                              style={{ padding: "6px 14px", borderRadius: "8px", background: "#fff", color: "#dc2626", border: "1px solid #fca5a5", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {accountTab === "addresses" && (
          <div className="addresses-tab-content">
            <div className="address-section-top">
              <div>
                <h3>Manage Delivery Addresses</h3>
                <p>Add, edit, or set default delivery addresses for seamless checkout.</p>
              </div>

              <button
                className="add-address-btn"
                onClick={() => openAddressModal(null)}
              >
                + Add New Address
              </button>
            </div>

            <div className="address-cards-grid">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`address-card ${addr.isDefault ? "default-card" : ""}`}
                >
                  <div className="address-card-header">
                    <span className="address-type-pill">{addr.label || "Home"}</span>
                    {addr.isDefault && <span className="default-badge">DEFAULT ADDRESS</span>}
                  </div>

                  <h4 className="address-name">{addr.fullName}</h4>
                  <p className="address-phone">📞 {addr.phone}</p>
                  <p className="address-text">
                    {addr.street}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>

                  <div className="address-actions-row">
                    <button
                      className="addr-action-btn edit-btn"
                      onClick={() => openAddressModal(addr)}
                    >
                      ✏️ Edit
                    </button>

                    {!addr.isDefault && (
                      <button
                        className="addr-action-btn default-btn"
                        onClick={() => setDefaultAddress(addr.id)}
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      className="addr-action-btn delete-btn"
                      onClick={() => deleteAddress(addr.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddressForm && (
              <div className="modal-backdrop">
                <div className="address-modal-container">
                  <div className="modal-header">
                    <h3>{editingAddressId ? "Edit Address" : "Add New Address"}</h3>
                    <button className="modal-close-btn" onClick={() => setShowAddressForm(false)}>
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveAddress} className="address-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Address Label</label>
                        <select
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          value={addrFullName}
                          onChange={(e) => setAddrFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Street Address / Flat / Building *</label>
                      <textarea
                        rows="2"
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={addrIsDefault}
                          onChange={(e) => setAddrIsDefault(e.target.checked)}
                        />
                        Set as Default Delivery Address
                      </label>
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="modal-cancel-btn"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="modal-save-btn">
                        {editingAddressId ? "Save Address Changes" : "Add Address"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE */}
        {accountTab === "profile" && (
          <div className="profile-tab-content">
            <h3>Edit Account Details</h3>
            {profileMsg && <div className="auth-alert success-alert">{profileMsg}</div>}

            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user.email} disabled />
                <span className="field-hint">Email address cannot be changed.</span>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <button type="submit" className="auth-primary-btn save-profile-btn">
                Update Profile Information
              </button>
            </form>
          </div>
        )}

        {/* CANCEL ORDER MODAL */}
        {cancelModalOrder && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
            <div style={{ maxWidth: "480px", width: "90%", background: "#fff", borderRadius: "18px", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#111" }}>Cancel Order #{cancelModalOrder.orderId}</h3>
                <button
                  onClick={() => setCancelModalOrder(null)}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888" }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: "#666", fontSize: "13px", marginBottom: "16px", lineHeight: "1.5" }}>
                Please let us know why you wish to cancel this order. We continuously strive to improve our royal customer experience.
              </p>

              {cancelError && (
                <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                  {cancelError}
                </div>
              )}

              <form onSubmit={handleConfirmCancelOrder}>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#333" }}>Reason for cancellation</label>
                  <select
                    value={cancelReasonPreset}
                    onChange={(e) => setCancelReasonPreset(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", background: "#fff" }}
                  >
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found better price elsewhere">Found better price elsewhere</option>
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Incorrect shipping address or phone">Incorrect shipping address or phone</option>
                    <option value="Delivery time is too long">Delivery time is too long</option>
                    <option value="Want to change payment method">Want to change payment method</option>
                    <option value="Other">Other (specify below)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px", color: "#333" }}>
                    Additional Comments {cancelReasonPreset === "Other" ? "(Required)" : "(Optional)"}
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Provide any additional details or feedback..."
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    required={cancelReasonPreset === "Other"}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setCancelModalOrder(null)}
                    style={{ padding: "10px 18px", borderRadius: "8px", background: "#f3f4f6", color: "#4b5563", border: "none", fontWeight: "600", cursor: "pointer" }}
                    disabled={isCancelling}
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "10px 20px", borderRadius: "8px", background: "#dc2626", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" }}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* USER LOGOUT CONFIRMATION MODAL */}
        {showLogoutModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
            <div style={{ background: "#fff", borderRadius: "18px", padding: "30px 24px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px" }}>
                🚪
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "#111", fontWeight: "800" }}>Sign Out Confirmation</h3>
              <p style={{ margin: "0 0 24px", color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                Are you sure you want to sign out from your Riwaaz account?
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  style={{ flex: 1, padding: "11px 16px", borderRadius: "10px", background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#4b5563", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
                >
                  Stay Logged In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false);
                    logout();
                  }}
                  style={{ flex: 1, padding: "11px 16px", borderRadius: "10px", background: "#dc2626", border: "none", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Login;