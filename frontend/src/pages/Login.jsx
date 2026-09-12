import { useState } from "react";
import { useAuth } from "../context/AuthContext";
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

  // Mode: "login" | "signup"
  const [authMode, setAuthMode] = useState("login");

  // Logged-in Account Sub-tab: "addresses" | "profile" | "orders"
  const [accountTab, setAccountTab] = useState("addresses");

  // Auth Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Address Form Modal / Drawer State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null if adding new

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

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!loginEmail || !loginPassword) {
      setAuthError("Please enter both email and password.");
      return;
    }

    const res = login(loginEmail, loginPassword);
    if (res.success) {
      setAuthSuccess(res.message);
    } else {
      setAuthError(res.message);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!signupName || !signupEmail || !signupPassword) {
      setAuthError("Please fill in all mandatory fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    const res = signup(signupName, signupEmail, signupPhone, signupPassword);
    if (res.success) {
      setAuthSuccess(res.message);
    } else {
      setAuthError(res.message);
    }
  };

  // Quick Demo Login
  const handleDemoLogin = () => {
    login("tamanna.soni@riwaaz.com", "demo12345");
  };

  // Open Address Form for Add or Edit
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

  // Save Address (Create or Edit)
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

  // Handle Profile Update Submit
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name: editName, phone: editPhone });
    setProfileMsg("Profile updated successfully!");
    setTimeout(() => setProfileMsg(""), 3000);
  };

  // -------------------------------------------------------------
  // IF USER IS NOT LOGGED IN -> RENDER LOGIN / SIGNUP FORMS
  // -------------------------------------------------------------
  if (!user) {
    return (
      <main className="auth-page-wrapper">
        <div className="auth-card-container">
          {/* Header Branding */}
          <div className="auth-brand-header">
            <img src="/images/riwaaz-logo.svg" alt="RIWAAZ" className="auth-logo-icon" />
            <h2>RIWAAZ LUXURY</h2>
            <p>Sign in to manage your orders, saved addresses, and wishlist.</p>
          </div>

          {/* Mode Switch Tabs */}
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

          {/* Alert Messages */}
          {authError && <div className="auth-alert error-alert">{authError}</div>}
          {authSuccess && <div className="auth-alert success-alert">{authSuccess}</div>}

          {/* LOGIN FORM */}
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
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" defaultChecked /> Remember Me
                </label>
                <button type="button" className="forgot-pass-btn">
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="auth-primary-btn">
                Sign In to Account
              </button>

              <div className="demo-login-divider">
                <span>OR</span>
              </div>

              <button
                type="button"
                className="demo-login-btn"
                onClick={handleDemoLogin}
              >
                ⚡ Instant Demo Sign-In
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
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
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-primary-btn">
                Create RIWAAZ Account
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // IF USER IS LOGGED IN -> RENDER FULL ACCOUNT DASHBOARD & ADDRESS MANAGER
  // -------------------------------------------------------------
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

          <button onClick={logout} className="logout-btn">
            Sign Out
          </button>
        </div>

        {/* Account Sub-Navigation Tabs */}
        <div className="account-subtabs">
          <button
            className={`subtab-btn ${accountTab === "addresses" ? "active" : ""}`}
            onClick={() => setAccountTab("addresses")}
          >
            📍 Saved Shipping Addresses ({addresses.length})
          </button>
          <button
            className={`subtab-btn ${accountTab === "profile" ? "active" : ""}`}
            onClick={() => setAccountTab("profile")}
          >
            👤 Edit Profile Details
          </button>
          <button
            className={`subtab-btn ${accountTab === "orders" ? "active" : ""}`}
            onClick={() => setAccountTab("orders")}
          >
            📦 My Orders
          </button>
        </div>

        {/* TAB 1: SAVED ADDRESSES MANAGEMENT */}
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

            {/* List of Saved Addresses */}
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

            {/* ADDRESS ADD / EDIT FORM MODAL */}
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

        {/* TAB 2: PROFILE DETAILS */}
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

        {/* TAB 3: ORDER HISTORY */}
        {accountTab === "orders" && (
          <div className="orders-tab-content">
            <h3>Recent Order History</h3>
            <div className="order-history-list">
              <div className="order-history-card">
                <div className="order-header-row">
                  <div>
                    <span className="order-id">Order #RW-2026-9842</span>
                    <span className="order-date">Placed on Aug 24, 2026</span>
                  </div>
                  <span className="order-status-badge delivered">Delivered ✓</span>
                </div>

                <div className="order-items-preview">
                  <div className="order-item-thumb">
                    <img src="/images/ring-removebg-preview.png" alt="Solitaire Ring" />
                    <div>
                      <h5>Solitaire Diamond Ring</h5>
                      <p>Qty: 1 • ₹14,999</p>
                    </div>
                  </div>
                </div>

                <div className="order-footer-row">
                  <p>Total Amount: <strong>₹14,999</strong></p>
                  <button className="reorder-btn">View Invoice</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Login;