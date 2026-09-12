import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="riwaaz-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>RIWAAZ</h2>
          <p>
            Crafting timeless elegance and luxury jewelry since 2026. Discover perfection in every piece.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop Collection</Link></li>
              <li><Link to="/collections">Collections</Link></li>
              <li><Link to="/newArrival">New Arrivals</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/login">Account Login</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Connect</h4>
            <p>Email: support@riwaaz.com</p>
            <p>Phone: +91 98765 43210</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RIWAAZ Luxury Jewelry. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
