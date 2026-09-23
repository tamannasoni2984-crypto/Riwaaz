import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentFailure.css";

const PaymentFailure = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const orderId = params.get("orderId");

    return (
        <div className="payment-result">
            <div className="payment-card">

                <div className="failure-icon">
                    ✕
                </div>

                <h1>Payment Failed</h1>

                <p>
                    Unfortunately, your payment could not be completed.
                </p>

                {orderId && (
                    <p>
                        <strong>Order ID:</strong> {orderId}
                    </p>
                )}

                <button onClick={() => navigate("/checkout")}>
                    Try Again
                </button>

                <button onClick={() => navigate("/orders")}>
                    View My Orders
                </button>

            </div>
        </div>
    );
};

export default PaymentFailure;