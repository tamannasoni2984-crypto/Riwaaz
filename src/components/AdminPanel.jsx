import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext.jsx";
import { useOrders } from "../context/OrderContext.jsx";
import "./AdminPanel.css";

const STANDARD_CATEGORIES = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Accessories",
  "Bangles",
  "Bracelets",
  "Pendants",
  "Jewellery",
  "Men",
  "Women",
];

function AdminPanel() {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, updateOrderStatus } = useOrders();

  const [adminUser] = useState(() => {
    try {
      const sessionData = sessionStorage.getItem("riwaaz_admin");
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!adminUser) {
      navigate("/admin-login", {
        replace: true,
        state: { error: "Please log in with admin credentials to access the Admin Panel." },
      });
    }
  }, [adminUser, navigate]);

  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("riwaaz_admin_tab") || "orders";
  });
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("riwaaz_admin_tab", tab);
  };

  // Modal State for Adding / Editing Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "Rings",
    customCategory: "",
    subCategory: "Jewellery",
    price: "",
    rating: 4.8,
    image: "/images/ring.png",
    isNew: true,
    isFeatured: true,
    description: "",
    stock: 20,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem("riwaaz_admin");
    sessionStorage.removeItem("riwaaz_admin_tab");
    localStorage.removeItem("riwaaz_admin");
    setShowLogoutModal(false);
    navigate("/admin-login", { state: { info: "Admin session ended securely." } });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      let reason = "";
      if (newStatus === "Cancelled") {
        const inputReason = window.prompt("Enter cancellation reason (optional):", "Cancelled by Administrator");
        if (inputReason === null) {
          return; // user pressed cancel on prompt
        }
        reason = inputReason.trim() || "Cancelled by Administrator";
      }
      await updateOrderStatus(orderId, newStatus, reason);
      showToast(`Order status updated to ${newStatus}`);
    } catch (err) {
      showToast(err.message || "Failed to update order status");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleClearFile = () => {
    setImageFile(null);
    setImagePreview(formData.image || "/images/ring.png");
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsCustomCategory(false);
    setImageFile(null);
    setImagePreview("/images/ring.png");
    setFormData({
      name: "",
      category: "Rings",
      customCategory: "",
      subCategory: "Jewellery",
      price: "",
      rating: 4.8,
      image: "/images/ring.png",
      isNew: true,
      isFeatured: true,
      description: "",
      stock: 20,
    });
    setShowProductModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    const isStandard = STANDARD_CATEGORIES.includes(prod.category);
    setIsCustomCategory(!isStandard);
    setImageFile(null);
    setImagePreview(prod.image || "/images/ring.png");

    setFormData({
      name: prod.name || "",
      category: isStandard ? prod.category : "Custom",
      customCategory: isStandard ? "" : prod.category || "",
      subCategory: prod.subCategory || "Jewellery",
      price: prod.price || "",
      rating: prod.rating || 4.8,
      image: prod.image || "/images/ring.png",
      isNew: prod.isNew ?? true,
      isFeatured: prod.isFeatured ?? false,
      description: prod.description || "",
      stock: prod.stock || 20,
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (prod) => {
    const id = prod._id || prod.id;
    if (window.confirm(`Are you sure you want to remove "${prod.name}" from the catalog?`)) {
      await deleteProduct(id);
      showToast("Product deleted successfully from catalog!");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert("Please enter a valid product name and price");
      return;
    }

    const finalCategory = isCustomCategory
      ? formData.customCategory.trim() || "Jewellery"
      : formData.category;

    let payload;

    if (imageFile) {
      // Send directly as multipart/form-data for backend Multer upload
      const fd = new FormData();
      fd.append("name", formData.name.trim());
      fd.append("category", finalCategory);
      fd.append("subCategory", formData.subCategory);
      fd.append("price", Number(formData.price));
      fd.append("rating", Number(formData.rating) || 4.8);
      fd.append("stock", Number(formData.stock) || 20);
      fd.append("isNew", Boolean(formData.isNew));
      fd.append("isFeatured", Boolean(formData.isFeatured));
      fd.append(
        "description",
        formData.description.trim() ||
          "Exquisite handcrafted fine jewelry piece with premium craftsmanship."
      );
      fd.append("image", imageFile);
      payload = fd;
    } else {
      payload = {
        name: formData.name.trim(),
        category: finalCategory,
        subCategory: formData.subCategory,
        price: Number(formData.price),
        rating: Number(formData.rating) || 4.8,
        image: formData.image.trim() || "/images/ring.png",
        isNew: Boolean(formData.isNew),
        isFeatured: Boolean(formData.isFeatured),
        description:
          formData.description.trim() ||
          "Exquisite handcrafted fine jewelry piece with premium craftsmanship.",
        stock: Number(formData.stock) || 20,
      };
    }

    if (editingProduct) {
      const id = editingProduct._id || editingProduct.id;
      await updateProduct(id, payload);
      showToast(`Updated "${formData.name}" successfully!`);
    } else {
      await addProduct(payload);
      showToast(`Added "${formData.name}" to inventory!`);
    }

    setShowProductModal(false);
  };

  // Compute all unique categories dynamically
  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set(["All", ...STANDARD_CATEGORIES, ...products.map((p) => p.category).filter(Boolean)])
      ),
    [products]
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      categoryFilter === "All" ||
      p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
      p.subCategory?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === "All" || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.phone?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Analytics derivations
  const totalGrossRevenue = orders.reduce((acc, o) => acc + (Number(o.grandTotal) || 0), 0);
  const totalVaultValue = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
  const averageOrderValue = orders.length > 0 ? Math.round(totalGrossRevenue / orders.length) : 0;
  const totalInMotion = orders.filter(
    (o) => o.orderStatus !== "Delivered"
  ).length;
  // Derive unique clients
  const uniqueClients = useMemo(() => {
    const clientMap = new Map();
    orders.forEach((o) => {
      const email = o.customer?.email || o.customer?.phone || "Guest";
      if (!clientMap.has(email)) {
        clientMap.set(email, {
          name: o.customer?.fullName || "Valued Client",
          email: o.customer?.email || "—",
          phone: o.customer?.phone || "—",
          ordersCount: 1,
          totalSpent: Number(o.grandTotal) || 0,
          tier: (Number(o.grandTotal) || 0) > 50000 ? "Gold Royal VIP" : "Silver Member",
          lastOrder: o.createdAt,
        });
      } else {
        const client = clientMap.get(email);
        client.ordersCount += 1;
        client.totalSpent += Number(o.grandTotal) || 0;
        if (client.totalSpent > 50000) client.tier = "Gold Royal VIP";
      }
    });
    return Array.from(clientMap.values());
  }, [orders]);

  if (!adminUser) {
    return null;
  }

  return (
    <div className="admin-panel-root">
      {toastMessage && <div className="admin-toast-popup">{toastMessage}</div>}

      {/* Topbar */}
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="brand-logo-icon">👑</div>
          <div>
            <span className="brand-title">RIWAAZ</span>{" "}
            <span className="brand-subtitle">ADMIN ATELIER</span>
          </div>
        </div>

        <div className="upstream-topbar-search">
          <select
            className="search-category-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search vault, orders, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-submit-btn" type="button">🔍</button>
        </div>

        <div className="admin-top-right">
          <Link to="/" style={{ color: "#d4af37", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}>
            ← View Live Store
          </Link>
          <div className="admin-profile-pill">
            <div className="admin-avatar">{adminUser?.name?.charAt(0) || "A"}</div>
            <div className="admin-profile-info">
              <span className="admin-profile-name">{adminUser?.name || "Tamanna Soni"}</span>
              <span className="admin-profile-role">Super Admin</span>
            </div>
          </div>
          <button className="admin-top-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="admin-body">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`menu-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => handleTabChange("orders")}
            >
              <span className="menu-icon">📦</span>
              <span className="menu-text">Live Orders</span>
              <span className="menu-badge">{orders.length}</span>
            </button>
            <button
              className={`menu-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => handleTabChange("products")}
            >
              <span className="menu-icon">💎</span>
              <span className="menu-text">Products Vault</span>
              <span className="menu-badge">{products.length}</span>
            </button>
            <button
              className={`menu-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => handleTabChange("overview")}
            >
              <span className="menu-icon">📊</span>
              <span className="menu-text">Analytics</span>
            </button>
            <button
              className={`menu-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => handleTabChange("users")}
            >
              <span className="menu-icon">👥</span>
              <span className="menu-text">Clients & VIPs</span>
              <span className="menu-badge">{uniqueClients.length}</span>
            </button>
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-divider" />
            <button className="menu-item logout-item" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              <span className="menu-text">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="admin-main-content">
          {/* Key Metrics */}
          <div className="metrics-cards-row">
            <div className="metric-card">
              <div className="metric-header">
                <span>Gross Revenue</span>
                <div className="metric-icon emerald">₹</div>
              </div>
              <div className="metric-value">
                ₹{totalGrossRevenue.toLocaleString("en-IN")}
              </div>
              <div className="metric-sub">{orders.length} Orders Processed</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Vault Masterpieces</span>
                <div className="metric-icon gold">💎</div>
              </div>
              <div className="metric-value">{products.length}</div>
              <div className="metric-sub">Active Solitaire Listings</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Avg Order Value</span>
                <div className="metric-icon blue">💰</div>
              </div>
              <div className="metric-value">₹{averageOrderValue.toLocaleString("en-IN")}</div>
              <div className="metric-sub">Across All Customer Tiers</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Registered VIPs</span>
                <div className="metric-icon purple">👑</div>
              </div>
              <div className="metric-value">{uniqueClients.length || 2}</div>
              <div className="metric-sub">Active Customer Base</div>
            </div>
          </div>

          {/* TAB 1: LIVE ORDERS MANAGER */}
          {activeTab === "orders" && (
            <div className="view-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>Live Customer Orders Management</h2>
                  <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "2px" }}>
                    Manage fulfillment, tracking, and order statuses in real-time.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>Filter Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    style={{ background: "#1f2937", border: "1px solid #374151", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="All">All Statuses ({orders.length})</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1f2937", color: "#9ca3af" }}>
                      <th style={{ padding: "12px 16px" }}>Order ID</th>
                      <th style={{ padding: "12px 16px" }}>Customer</th>
                      <th style={{ padding: "12px 16px" }}>Items Snapshot</th>
                      <th style={{ padding: "12px 16px" }}>Grand Total</th>
                      <th style={{ padding: "12px 16px" }}>Payment</th>
                      <th style={{ padding: "12px 16px" }}>Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.orderId || ord._id} style={{ borderBottom: "1px solid #1f2937" }}>
                        <td style={{ padding: "12px 16px", fontWeight: "700", color: "#38bdf8" }}>
                          #{ord.orderId}
                          {ord.trackingNumber && <div style={{ fontSize: "11px", color: "#9ca3af" }}>{ord.trackingNumber}</div>}
                          {ord.orderStatus === "Cancelled" && (
                            <div style={{ fontSize: "11px", color: "#f87171", marginTop: "4px", background: "rgba(239, 68, 68, 0.1)", padding: "3px 6px", borderRadius: "4px" }}>
                              <strong>Reason:</strong> {ord.cancellationReason || "Cancelled"}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <strong>{ord.customer?.fullName}</strong>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}</div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>{ord.customer?.phone}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {ord.items?.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "3px 0" }}>
                              <img
                                src={item.image || "/images/ring.png"}
                                alt={item.name}
                                style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "contain", background: "#1f2937" }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/ring.png";
                                }}
                              />
                              <span style={{ fontSize: "12px" }}>{item.quantity}× {item.name}</span>
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: "800", color: "#ffd700" }}>
                          ₹{Number(ord.grandTotal)?.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "3px 8px", borderRadius: "10px", fontSize: "11px" }}>
                            {ord.paymentMethod?.toUpperCase()} ({ord.paymentStatus})
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <select
                            value={ord.orderStatus || "Pending"}
                            onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                            style={{
                              background:
                                ord.orderStatus === "Delivered"
                                  ? "#065f46"
                                  : ord.orderStatus === "Shipped"
                                    ? "#1e40af"
                                    : ord.orderStatus === "Cancelled"
                                      ? "#991b1b"
                                      : ord.orderStatus === "Processing"
                                        ? "#5b21b6"
                                        : "#78350f",
                              color: "#fff",
                              border: "none",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS VAULT */}
          {activeTab === "products" && (
            <div className="view-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>Manage Inventory Vault</h2>
                  <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "2px" }}>
                    Changes made here instantly update the Shop, Collections, and Home pages.
                  </p>
                </div>
                <button
                  onClick={handleOpenAdd}
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "0.6rem 1.2rem",
                    borderRadius: "8px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>+</span> Add New Masterpiece
                </button>
              </div>

              <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1f2937", color: "#9ca3af" }}>
                      <th style={{ padding: "12px 16px" }}>Image</th>
                      <th style={{ padding: "12px 16px" }}>Title</th>
                      <th style={{ padding: "12px 16px" }}>Category</th>
                      <th style={{ padding: "12px 16px" }}>Sub-Category</th>
                      <th style={{ padding: "12px 16px" }}>Price</th>
                      <th style={{ padding: "12px 16px" }}>Stock</th>
                      <th style={{ padding: "12px 16px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => {
                      const id = prod._id || prod.id;
                      return (
                        <tr key={id} style={{ borderBottom: "1px solid #1f2937" }}>
                          <td style={{ padding: "10px 16px" }}>
                            <img
                              src={prod.image}
                              alt={prod.name}
                              style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px", background: "#1f2937" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/ring.png";
                              }}
                            />
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "600" }}>{prod.name}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "3px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600" }}>
                              {prod.category}
                            </span>
                          </td>
                          <td style={{ padding: "10px 16px", color: "#9ca3af" }}>{prod.subCategory || "Jewellery"}</td>
                          <td style={{ padding: "10px 16px", fontWeight: "700", color: "#ffd700" }}>
                            ₹{Number(prod.price)?.toLocaleString("en-IN")}
                          </td>
                          <td style={{ padding: "10px 16px", color: prod.stock > 0 ? "#34d399" : "#f87171" }}>
                            {prod.stock || 20} units
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              style={{ background: "#1f2937", border: "1px solid #374151", color: "#38bdf8", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", marginRight: "6px" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#f87171", padding: "4px 10px", borderRadius: "6px", cursor: "pointer" }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENTS & VIPS */}
          {activeTab === "users" && (
            <div className="view-panel">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem" }}>VIP Clients & Customer Registry</h2>
              <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1f2937", color: "#9ca3af" }}>
                      <th style={{ padding: "12px 16px" }}>Client Name</th>
                      <th style={{ padding: "12px 16px" }}>Email / Contact</th>
                      <th style={{ padding: "12px 16px" }}>Membership Tier</th>
                      <th style={{ padding: "12px 16px" }}>Total Orders</th>
                      <th style={{ padding: "12px 16px" }}>Lifetime Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueClients.map((client, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #1f2937" }}>
                        <td style={{ padding: "12px 16px", fontWeight: "700" }}>{client.name}</td>
                        <td style={{ padding: "12px 16px", color: "#9ca3af" }}>
                          <div>{client.email}</div>
                          <div style={{ fontSize: "11px" }}>{client.phone}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: "rgba(212, 175, 55, 0.15)", color: "#ffd700", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" }}>
                            👑 {client.tier}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>{client.ordersCount} Orders</td>
                        <td style={{ padding: "12px 16px", fontWeight: "700", color: "#34d399" }}>
                          ₹{client.totalSpent.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS OVERVIEW */}
          {activeTab === "overview" && (
            <div className="view-panel">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem" }}>Sales & Catalog Analytics</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#ffd700" }}>Revenue Realization</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>Total Gross Realized: <strong>₹{totalGrossRevenue.toLocaleString("en-IN")}</strong></p>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>Catalog Capital Value: <strong>₹{totalVaultValue.toLocaleString("en-IN")}</strong></p>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>Average Order Cart: <strong>₹{averageOrderValue.toLocaleString("en-IN")}</strong></p>
                </div>
                <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#38bdf8" }}>Inventory Breakdown</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>Active Masterpieces: <strong>{products.length}</strong></p>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>Active Categories: <strong>{availableCategories.length - 1}</strong></p>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>Orders In Motion: <strong>{orders.filter((o) => o.status !== "Delivered").length}</strong></p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Modal */}
      {showProductModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
          <div style={{ background: "#111827", border: "1px solid #374151", borderRadius: "16px", width: "520px", maxWidth: "92vw", padding: "24px", color: "#fff", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "1.2rem", fontWeight: "700" }}>
              {editingProduct ? "Edit Masterpiece Details" : "Add New Masterpiece to Vault"}
            </h3>
            <form onSubmit={handleSaveProduct} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Solitaire Diamond Ring"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>Category</label>
                  <select
                    value={isCustomCategory ? "Custom" : formData.category}
                    onChange={(e) => {
                      if (e.target.value === "Custom") {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  >
                    {STANDARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>Sub-Category / Gender</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  >
                    <option value="Jewellery">Jewellery (General)</option>
                    <option value="Women">Women's Collection</option>
                    <option value="Men">Men's Collection</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              {isCustomCategory && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#38bdf8", marginBottom: "4px" }}>Enter Custom Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mangalsutra, Bridal, Anklets..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #38bdf8", color: "#fff" }}
                  />
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 14999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  />
                </div>
              </div>

              {/* Media Upload Portal */}
              <div className="image-upload-portal">
                <label className="portal-label">Product Media & Visual Asset</label>
                <div className="portal-container">
                  <div className="portal-preview-box">
                    <img
                      src={imagePreview || formData.image || "/images/ring.png"}
                      alt="Product Preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/ring.png";
                      }}
                    />
                    {imageFile && <span className="portal-file-badge">NEW FILE</span>}
                  </div>

                  <div className="portal-controls">
                    <div className="file-input-wrapper">
                      <label className="btn-file-upload">
                        📁 Upload Media File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </label>

                      {imageFile ? (
                        <span className="selected-filename">
                          ✓ {imageFile.name}
                          <button
                            type="button"
                            className="btn-clear-file"
                            onClick={handleClearFile}
                            title="Remove selected file"
                          >
                            ✕
                          </button>
                        </span>
                      ) : (
                        <span className="no-file-text">Directly upload high-res image (PNG, JPG, WebP)</span>
                      )}
                    </div>

                    <div>
                      <span className="or-divider">Or enter public image URL / asset path:</span>
                      <input
                        type="text"
                        placeholder="/images/ring.png or https://..."
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          if (!imageFile) {
                            setImagePreview(e.target.value);
                          }
                        }}
                        className="portal-url-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "20px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  />
                  Mark as New Arrival
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  Feature on Front Page
                </label>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed description of craftsmanship, metal purity, diamonds..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", background: "#374151", color: "#fff", border: "none", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "#10b981", color: "#064e3b", fontWeight: "700", border: "none", cursor: "pointer" }}
                >
                  {editingProduct ? "Save Changes" : "Create Masterpiece"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="admin-logout-modal-overlay">
          <div className="admin-logout-modal-card">
            <div className="logout-modal-header">
              <div className="logout-modal-icon">🚪</div>
              <h3>Confirm Admin Sign Out</h3>
            </div>
            <p className="logout-modal-text">
              Are you sure you want to end your administrative session? You will need to enter your super admin credentials to regain access.
            </p>
            <div className="logout-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Stay Logged In
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={confirmLogout}
                style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", padding: "11px 18px", cursor: "pointer" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
