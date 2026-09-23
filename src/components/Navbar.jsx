import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  const closeMenu = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  };

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products live
  const searchResults = searchQuery.trim()
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.subCategory?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const handleSearchResultClick = (id) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="navbar-header">
      <nav className="navbar">
        {/* Brand Logo & Icon */}
        <div className="logo">
          <Link to="/" onClick={closeMenu} className="logo-brand-link">
            <img
              src="/images/riwaaz-logo.svg"
              alt="RIWAAZ Icon"
              className="navbar-brand-icon"
            />
            <span className="brand-name">RIWAAZ</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link
            to="/"
            className={isActive("/") ? "active" : ""}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={isActive("/shop") ? "active" : ""}
            onClick={closeMenu}
          >
            Shop
          </Link>
          <Link
            to="/collections"
            className={isActive("/collections") ? "active" : ""}
            onClick={closeMenu}
          >
            Collections
          </Link>
          <Link
            to="/newArrival"
            className={isActive("/newArrival") || isActive("/NewArrival") ? "active" : ""}
            onClick={closeMenu}
          >
            New Arrivals
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="nav-actions">
          {/* Live Search Trigger */}
          <button
            className="nav-action-btn search-trigger-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Search Jewels"
            aria-label="Search"
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-action-label">Search</span>
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className={`nav-action-btn ${isActive("/wishlist") ? "active" : ""}`}
            onClick={closeMenu}
            title="Wishlist"
          >
            <span className="nav-icon">♡</span>
            <span className="nav-action-label">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="nav-badge wishlist-badge">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className={`nav-action-btn ${isActive("/cart") ? "active" : ""}`}
            onClick={closeMenu}
            title="Cart"
          >
            <span className="nav-icon">🛒</span>
            <span className="nav-action-label">Cart</span>
            {cartCount > 0 && (
              <span className="nav-badge cart-badge">{cartCount}</span>
            )}
          </Link>

          {/* User Account / Dropdown */}
          {user ? (
            <div className="nav-user-dropdown-wrapper" ref={userMenuRef}>
              <button
                className="nav-action-btn login-btn user-logged-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title={user.name}
              >
                <span className="nav-icon user-icon">👤</span>
                <span className="login-btn-text">
                  {user.name.split(" ")[0]}
                </span>
                <span className="dropdown-caret">▾</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link
                    to="/login"
                    onClick={() => {
                      setUserMenuOpen(false);
                      closeMenu();
                    }}
                    className="dropdown-item"
                  >
                    📦 My Orders & Account
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => {
                      setUserMenuOpen(false);
                      closeMenu();
                    }}
                    className="dropdown-item"
                  >
                    ♡ My Wishlist ({wishlistCount})
                  </Link>
                  <hr className="dropdown-divider" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="dropdown-item logout-link"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`nav-action-btn login-btn ${isActive("/login") ? "active" : ""}`}
              onClick={closeMenu}
              title="Account Login"
            >
              <span className="nav-icon user-icon">👤</span>
              <span className="login-btn-text">Login</span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Live Search Bar Overlay / Popover */}
      {searchOpen && (
        <div className="nav-live-search-bar">
          <form onSubmit={handleSearchSubmit} className="search-input-box">
            <span className="search-icon-inside">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search royal solitaires, diamond necklaces, bracelets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
            <button
              type="button"
              className="close-search-btn"
              onClick={() => setSearchOpen(false)}
            >
              Close
            </button>
          </form>

          {/* Instant live search results */}
          {searchQuery.trim() && (
            <div className="search-results-dropdown">
              {searchResults.length > 0 ? (
                <div>
                  <span className="results-header">Matching Masterpieces ({searchResults.length}):</span>
                  <div className="search-items-grid">
                    {searchResults.map((item) => (
                      <div
                        key={item._id || item.id}
                        className="search-item-row"
                        onClick={() => handleSearchResultClick(item._id || item.id)}
                      >
                        <img
                          src={item.image || "/images/ring.png"}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/ring.png";
                          }}
                        />
                        <div className="search-item-details">
                          <span className="search-item-cat">{item.category}</span>
                          <h4>{item.name}</h4>
                          <span className="search-item-price">
                            ₹{Number(item.price)?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-search-results">
                  <p>No jewels matching "<strong>{searchQuery}</strong>".</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* USER LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
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
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: "11px 16px", borderRadius: "10px", background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#4b5563", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                  navigate("/login");
                }}
                style={{ flex: 1, padding: "11px 16px", borderRadius: "10px", background: "#dc2626", border: "none", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;