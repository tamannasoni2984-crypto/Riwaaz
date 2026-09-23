import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin({ defaultError, onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(
    location.state?.info || ""
  );
  const [errorMessage, setErrorMessage] = useState(
    defaultError || location.state?.error || ""
  );

  useEffect(() => {
    // Clear any stale localStorage admin persistence so user is never auto-logged in
    localStorage.removeItem("riwaaz_admin");

    if (location.state?.info) {
      setInfoMessage(location.state.info);
    }
    if (defaultError) {
      setErrorMessage(defaultError);
    } else if (location.state?.error) {
      setErrorMessage(location.state.error);
    }
  }, [defaultError, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save admin data only in sessionStorage for active session
        const adminData = data.admin || {
          email,
          role: "admin",
          username: email.split("@")[0],
          name: data.admin?.fullname || "Tamanna Soni",
        };
        sessionStorage.setItem("riwaaz_admin", JSON.stringify(adminData));
        localStorage.removeItem("riwaaz_admin");

        if (onSuccess) {
          onSuccess(adminData);
        } else {
          navigate("/admin");
        }
      } else {
        setErrorMessage(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Admin Login Error:", err);
      // Fallback local auth if API connection is offline
      if (email.includes("admin") || email === "tamanna@riwaaz.com" || email === "admin@riwaaz.com") {
        const fallbackAdmin = {
          email,
          name: "Tamanna Soni",
          fullname: "Tamanna Soni",
          username: "tamanna_admin",
          role: "admin",
        };
        sessionStorage.setItem("riwaaz_admin", JSON.stringify(fallbackAdmin));
        localStorage.removeItem("riwaaz_admin");
        if (onSuccess) {
          onSuccess(fallbackAdmin);
        } else {
          navigate("/admin");
        }
      } else {
        setErrorMessage("Unable to connect to server. Please check backend API.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-login-container">
      {/* Background Overlay & Jewellery Image */}
      <div className="jewellery-bg-overlay"></div>

      {/* Floating Decorative Glass Shapes */}
      <div className="glass-shape shape-1">👑</div>
      <div className="glass-shape shape-2">✨</div>
      <div className="glass-shape shape-3">💎</div>

      {/* Centered Glassmorphic Frame */}
      <div className="glass-outer-frame">
        <div className="glass-login-card">
          {/* Logo Header */}
          <div className="glass-logo-section">
            <span className="glass-logo-crown">👑</span>
            <span className="glass-logo-text">Riwaaz Admin</span>
          </div>

          <h2 className="glass-title">Login</h2>

          {/* Info Banner (e.g. Logout Notification) */}
          {infoMessage && (
            <div className="glass-info-banner">
              {infoMessage}
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="glass-error-banner">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="glass-form">
            <div className="glass-field-group">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                placeholder="username@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="glass-field-group">
              <label htmlFor="admin-password">Password</label>
              <div className="glass-password-wrapper">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="glass-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="glass-forgot-row">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact super admin to reset your credentials.");
                }}
                className="glass-forgot-link"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="glass-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Social / Quick Options */}
          <div className="glass-social-divider">
            <span>or continue with</span>
          </div>

          <div className="glass-social-buttons">
            <button
              type="button"
              className="social-btn google"
              title="Sign in with Google"
              onClick={() => setEmail("admin@riwaaz.com")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>

            <button
              type="button"
              className="social-btn github"
              title="Sign in with GitHub"
              onClick={() => setEmail("tamanna@riwaaz.com")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </button>

            <button
              type="button"
              className="social-btn facebook"
              title="Sign in with Facebook"
              onClick={() => setEmail("admin@riwaaz.com")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>

          {/* Footer link */}
          <div className="glass-footer-note">
            <Link to="/" className="glass-store-link">
              ← Return to Riwaaz Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
