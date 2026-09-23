import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cancelOrderApi } from "../services/api";

import "./OrderDetails.css";

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cancel modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReasonPreset, setCancelReasonPreset] = useState("Changed my mind");
    const [customCancelReason, setCustomCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState("");

    const fetchOrder = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/orders/${id}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!data.success) {
                alert(data.message);
                return;
            }

            setOrder(data.data);
        } catch (error) {
            console.error("Get Order Error:", error);
            alert("Unable to load order");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleConfirmCancel = async (e) => {
        e.preventDefault();
        const finalReason =
            cancelReasonPreset === "Other"
                ? (customCancelReason.trim() || "Customer requested cancellation")
                : (customCancelReason.trim()
                    ? `${cancelReasonPreset}: ${customCancelReason.trim()}`
                    : cancelReasonPreset);

        setIsCancelling(true);
        setCancelError("");

        try {
            const orderIdentifier = order._id || order.orderId || id;
            const res = await cancelOrderApi(orderIdentifier, finalReason);

            if (res.success && res.data) {
                setOrder(res.data);
                setShowCancelModal(false);
            } else {
                setCancelError(res.message || "Failed to cancel order.");
            }
        } catch (err) {
            setCancelError(err.message || "Failed to cancel order.");
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="order-details-loading">
                Loading order...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-details-page">
                <div className="order-not-found">
                    <h2>Order Not Found</h2>

                    <button onClick={() => navigate("/orders")}>
                        Back to My Orders
                    </button>
                </div>
            </div>
        );
    }

    const address = order.shippingAddress || {};
    const isCancelled = order.orderStatus === "Cancelled";
    const canCancel = order.orderStatus === "Pending" || order.orderStatus === "Processing";

    return (
        <div className="order-details-page">

            <div className="order-details-container">

                {/* PAGE HEADER */}

                <div className="order-details-header">

                    <div>
                        <h1>Order Details</h1>

                        <p>
                            Order ID:{" "}
                            <strong>{order.orderId}</strong>
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span
                            className="order-details-status"
                            style={{
                                background: isCancelled
                                    ? "#fee2e2"
                                    : order.orderStatus === "Delivered"
                                        ? "#d1fae5"
                                        : order.orderStatus === "Shipped"
                                            ? "#dbeafe"
                                            : order.orderStatus === "Processing"
                                                ? "#ede9fe"
                                                : "#fef3c7",
                                color: isCancelled
                                    ? "#991b1b"
                                    : order.orderStatus === "Delivered"
                                        ? "#065f46"
                                        : order.orderStatus === "Shipped"
                                            ? "#1e40af"
                                            : order.orderStatus === "Processing"
                                                ? "#5b21b6"
                                                : "#92400e",
                            }}
                        >
                            ● {order.orderStatus}
                        </span>

                        {canCancel && (
                            <button
                                onClick={() => {
                                    setShowCancelModal(true);
                                    setCancelError("");
                                }}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    background: "#fff",
                                    color: "#dc2626",
                                    border: "1px solid #fca5a5",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>

                </div>

                {/* CANCELLATION BANNER */}
                {isCancelled && (
                    <div
                        style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "12px",
                            padding: "16px 20px",
                            marginBottom: "24px",
                            color: "#991b1b",
                        }}
                    >
                        <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "700" }}>
                            🚫 This Order Has Been Cancelled
                        </h3>
                        <p style={{ margin: "0 0 4px", fontSize: "14px" }}>
                            <strong>Reason:</strong> {order.cancellationReason || "Cancelled by customer"}
                        </p>
                        {order.cancelledAt && (
                            <p style={{ margin: 0, fontSize: "12px", color: "#b91c1c" }}>
                                Cancelled on: {new Date(order.cancelledAt).toLocaleString()}
                                {order.cancelledBy && ` (${order.cancelledBy === "admin" ? "by Admin" : "by Customer"})`}
                            </p>
                        )}
                    </div>
                )}


                {/* ORDER INFORMATION */}

                <div className="order-info-grid">

                    <div className="order-info-box">
                        <h3>Order Date</h3>

                        <p>
                            {new Date(
                                order.createdAt
                            ).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="order-info-box">
                        <h3>Payment Method</h3>

                        <p>
                            {order.paymentMethod === "cod"
                                ? "Cash on Delivery"
                                : "Online"}
                        </p>
                    </div>

                    <div className="order-info-box">
                        <h3>Payment Status</h3>

                        <p>
                            {order.paymentStatus}
                        </p>
                    </div>

                    <div className="order-info-box">
                        <h3>Tracking Number</h3>

                        <p>
                            {order.trackingNumber ||
                                "Not available"}
                        </p>
                    </div>

                </div>


                {/* PRODUCTS */}

                <div className="order-details-section">

                    <h2>Products</h2>

                    <div className="details-products">

                        {order.items.map((item, index) => (

                            <div
                                className="details-product"
                                key={index}
                            >

                                <img
                                    src={
                                        item.image?.startsWith("http")
                                            ? item.image
                                            : `http://localhost:5000${item.image}`
                                    }
                                    alt={item.name}
                                />

                                <div className="details-product-info">

                                    <h3>{item.name}</h3>

                                    <p>
                                        Quantity:{" "}
                                        {item.quantity}
                                    </p>

                                    <p>
                                        Price: ₹{item.price}
                                    </p>

                                    {item.selectedKarat && (
                                        <p>
                                            Karat:{" "}
                                            {item.selectedKarat}
                                        </p>
                                    )}

                                    {item.selectedSize && (
                                        <p>
                                            Size:{" "}
                                            {item.selectedSize}
                                        </p>
                                    )}

                                </div>

                                <div className="details-product-total">
                                    ₹
                                    {Number(item.price) *
                                        Number(item.quantity)}
                                </div>

                            </div>

                        ))}

                    </div>

                </div>


                {/* SHIPPING ADDRESS */}

                <div className="order-details-section">

                    <h2>Shipping Address</h2>

                    <div className="shipping-address">

                        <p>
                            <strong>
                                {order.customer?.name ||
                                    order.customerName ||
                                    "Customer"}
                            </strong>
                        </p>

                        <p>
                            {address.street}
                        </p>

                        <p>
                            {address.city},{" "}
                            {address.state}
                        </p>

                        <p>
                            PIN Code: {address.pincode}
                        </p>

                        {order.customer?.phone && (
                            <p>
                                Phone:{" "}
                                {order.customer.phone}
                            </p>
                        )}

                    </div>

                </div>


                {/* PRICE SUMMARY */}

                <div className="order-details-section">

                    <h2>Price Summary</h2>

                    <div className="price-summary">

                        <div>
                            <span>Items Total</span>

                            <span>
                                ₹{order.itemsTotal}
                            </span>
                        </div>

                        <div>
                            <span>Shipping</span>

                            <span>
                                ₹{order.shippingFee}
                            </span>
                        </div>

                        <div>
                            <span>Tax</span>

                            <span>
                                ₹{order.tax}
                            </span>
                        </div>

                        <div>
                            <span>Discount</span>

                            <span>
                                - ₹{order.discount}
                            </span>
                        </div>

                        <div className="grand-total">

                            <strong>Total</strong>

                            <strong>
                                ₹{order.grandTotal}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* BACK BUTTON */}

                <button
                    className="back-orders-button"
                    onClick={() => navigate("/login")}
                >
                    ← Back to My Orders
                </button>

            </div>

            {/* CANCEL ORDER MODAL */}
            {showCancelModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
                    <div style={{ maxWidth: "480px", width: "90%", background: "#fff", borderRadius: "18px", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px", color: "#111" }}>Cancel Order #{order.orderId}</h3>
                            <button
                                onClick={() => setShowCancelModal(false)}
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

                        <form onSubmit={handleConfirmCancel}>
                            <div style={{ marginBottom: "14px" }}>
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

                            <div style={{ marginBottom: "20px" }}>
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
                                    onClick={() => setShowCancelModal(false)}
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

        </div>
    );
};

export default OrderDetails;