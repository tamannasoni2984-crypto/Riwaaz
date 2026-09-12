import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext.jsx";
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
  const { products, addProduct, updateProduct, deleteProduct, loading } = useProducts();

  const [adminUser] = useState(() => {
    const sessionData = sessionStorage.getItem("riwaaz_admin");
    return sessionData ? JSON.parse(sessionData) : { name: "Admin", email: "admin@riwaaz.com", role: "Super Admin" };
  });

  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("riwaaz_admin_tab") || "products";
  });
  const [toastMessage, setToastMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("riwaaz_admin_tab", tab);
  };


  // Modal State for Adding / Editing Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

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
    sessionStorage.removeItem("riwaaz_admin");
    navigate("/admin-login");
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsCustomCategory(false);
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

    setFormData({
      name: prod.name || "",
      category: isStandard ? prod.category : "Custom",
      customCategory: isStandard ? "" : (prod.category || ""),
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
    if (window.confirm(`Are you sure you want to remove "${prod.name}" from the vault?`)) {
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
      ? (formData.customCategory.trim() || "Jewellery")
      : formData.category;

    const payload = {
      name: formData.name.trim(),
      category: finalCategory,
      subCategory: formData.subCategory,
      price: Number(formData.price),
      rating: Number(formData.rating) || 4.8,
      image: formData.image.trim() || "/images/ring.png",
      isNew: Boolean(formData.isNew),
      isFeatured: Boolean(formData.isFeatured),
      description: formData.description.trim() || "Exquisite handcrafted fine jewelry piece with premium craftsmanship.",
      stock: Number(formData.stock) || 20,
    };

    if (editingProduct) {
      const id = editingProduct._id || editingProduct.id;
      await updateProduct(id, payload);
      showToast(`Updated "${payload.name}" successfully!`);
    } else {
      await addProduct(payload);
      showToast(`Added "${payload.name}" to inventory!`);
    }

    setShowProductModal(false);
  };

  // Compute all unique categories dynamically
  const availableCategories = Array.from(
    new Set(["All", ...STANDARD_CATEGORIES, ...products.map((p) => p.category).filter(Boolean)])
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

  const totalVaultValue = products.reduce((acc, p) => acc + (Number(p.price) || 0), 0);

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
            placeholder="Search vault, inventory, serials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-submit-btn" type="button">🔍</button>
        </div>

        <div className="admin-top-right">
          <div className="admin-profile-pill">
            <div className="admin-avatar">
              {adminUser?.name?.charAt(0) || "A"}
            </div>
            <div className="admin-profile-info">
              <span className="admin-profile-name">{adminUser?.name || "Tamanna Soni"}</span>
              <span className="admin-profile-role">Master Jeweler Admin</span>
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
                <span>Vault Masterpieces</span>
                <div className="metric-icon gold">💎</div>
              </div>
              <div className="metric-value">{products.length}</div>
              <div className="metric-sub">Active Solitaire Listings</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Gross Value</span>
                <div className="metric-icon emerald">₹</div>
              </div>
              <div className="metric-value">
                ₹{(totalVaultValue / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}k
              </div>
              <div className="metric-sub">Catalog Valuation</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Categories Active</span>
                <div className="metric-icon blue">🏷️</div>
              </div>
              <div className="metric-value">{availableCategories.length - 1}</div>
              <div className="metric-sub">Synced Across Shop</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <span>Average Rating</span>
                <div className="metric-icon purple">★</div>
              </div>
              <div className="metric-value">4.92</div>
              <div className="metric-sub">Customer Satisfaction</div>
            </div>
          </div>

          {/* Products Panel */}
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
                      <th style={{ padding: "12px 16px" }}>Rating</th>
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
                          <td style={{ padding: "10px 16px" }}>★ {prod.rating || 4.8}</td>
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

          {/* Users Panel */}
          {activeTab === "users" && (
            <div className="view-panel">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem" }}>VIP Customers & Concierge</h2>
              <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", padding: "20px" }}>
                <p style={{ color: "#9ca3af" }}>Customer relationship details, membership tiers and order histories.</p>
              </div>
            </div>
          )}

          {/* Analytics Overview */}
          {activeTab === "overview" && (
            <div className="view-panel">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem" }}>Sales & Traffic Overview</h2>
              <div style={{ background: "#111827", borderRadius: "12px", border: "1px solid #1f2937", padding: "20px" }}>
                <p style={{ color: "#9ca3af" }}>Real-time sales velocity, top performing solitaire lines and region metrics.</p>
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

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#9ca3af", marginBottom: "4px" }}>Image Path / URL</label>
                <input
                  type="text"
                  placeholder="/images/ring.png or URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                />
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
    </div>
  );
}

export default AdminPanel;
