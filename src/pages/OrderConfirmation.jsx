import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const location = useLocation();
    const { clearCart } = useCart();

    const order = location.state?.order;

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="order-confirmation">
            <div className="confirmation-box">

                <div className="success-icon">✓</div>

                <h1>Order Placed Successfully!</h1>

                <p>
                    Thank you for shopping with <strong>RIWAAZ</strong>.
                </p>

                {order && (
                    <>
                        <div className="order-details">
                            <p>
                                <strong>Order ID:</strong> {order.orderId}
                            </p>

                            <p>
                                <strong>Payment:</strong> Cash on Delivery
                            </p>

                            <p>
                                <strong>Total:</strong> ₹{order.grandTotal}
                            </p>

                            <p>
                                <strong>Status:</strong> {order.orderStatus}
                            </p>
                        </div>
                    </>
                )}

                <div className="confirmation-buttons">
                    <Link to="/shop">
                        <button>Continue Shopping</button>
                    </Link>

                    <Link to="/orders">
                        <button>My Orders</button>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default OrderConfirmation;