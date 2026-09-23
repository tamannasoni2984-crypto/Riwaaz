import "./ConfirmModal.css";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Removal",
  message = "Are you sure you want to remove this item?",
  confirmText = "Yes, Remove",
  cancelText = "Cancel",
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-box">
        <div className="confirm-modal-icon">⚠️</div>
        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button className="confirm-btn cancel-btn" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="confirm-btn action-btn"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
