import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPromptModal.css";

export default function LoginPromptModal({
  isOpen,
  onClose,
  title = "Please Login First",
  message = "You need to be logged in to add items to your cart and proceed with shopping.",
}) {
  const navigate = useNavigate();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginClick = () => {
    onClose();
    navigate("/login");
  };

  return (
    <div
      className="login-prompt-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      <div
        className="login-prompt-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="login-prompt-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="login-prompt-icon-wrapper">
          <div className="login-prompt-icon-ring">
            <span className="login-prompt-icon">🔒</span>
          </div>
        </div>

        <h2 id="login-prompt-title" className="login-prompt-title">
          {title}
        </h2>

        <p className="login-prompt-message">{message}</p>

        <div className="login-prompt-actions">
          <button
            type="button"
            className="login-prompt-btn secondary"
            onClick={onClose}
          >
            Continue Browsing
          </button>
          <button
            type="button"
            className="login-prompt-btn primary"
            onClick={handleLoginClick}
          >
            Login / Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
