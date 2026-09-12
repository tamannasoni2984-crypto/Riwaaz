import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setMobileMenuOpen(false);

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

        {/* Action Buttons (Wishlist, Cart, Login) */}
        <div className="nav-actions">
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

          <Link
            to="/login"
            className={`nav-action-btn login-btn ${isActive("/login") ? "active" : ""}`}
            onClick={closeMenu}
            title={user ? user.name : "Account Login"}
          >
            <span className="nav-icon user-icon">👤</span>
            <span className="login-btn-text">
              {user ? user.name.split(" ")[0] : "Login"}
            </span>
          </Link>

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
    </header>
  );
}

export default Navbar;