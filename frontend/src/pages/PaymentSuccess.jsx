import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);


    return (
        <div className="payment-result">
            <div className="payment-card">

                <div className="success-icon">
                    ✓
                </div>

                <h1>Payment Successful!</h1>

                <p>
                    Your payment has been successfully completed.
                </p>

                {orderId && (
                    <p>
                        <strong>Order ID:</strong> {orderId}
                    </p>
                )}

                <button onClick={() => navigate("/orders")}>
                    View My Orders
                </button>

                <button onClick={() => navigate("/")}>
                    Continue Shopping
                </button>

            </div>
        </div>
    );
};

export default PaymentSuccess;