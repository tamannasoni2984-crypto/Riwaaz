import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./MyOrders.css";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/orders/my-orders",
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

            setOrders(data.data);
        } catch (error) {
            console.error("Get Orders Error:", error);
            alert("Unable to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return <h2 className="orders-loading">Loading orders...</h2>;
    }

    return (
        <div className="my-orders-page">
            <div className="my-orders-container">

                <h1>My Orders</h1>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <h2>No Orders Yet</h2>
                        <p>Your orders will appear here.</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div
                            className="order-card"
                            key={order._id}
                        >

                            {/* ORDER HEADER */}
                            <div className="order-header">

                                <div>
                                    <h3>
                                        Order ID: {order.orderId}
                                    </h3>

                                    <p>
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <span className="order-status">
                                    {order.orderStatus}
                                </span>

                            </div>


                            {/* ORDER ITEMS */}
                            <div className="order-items">

                                {order.items.map((item, index) => (

                                    <div
                                        className="order-item"
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

                                        <div>

                                            <h4>
                                                {item.name}
                                            </h4>

                                            <p>
                                                Quantity: {item.quantity}
                                            </p>

                                            <p>
                                                Price: ₹{item.price}
                                            </p>

                                        </div>

                                    </div>

                                ))}

                            </div>


                            {/* ORDER FOOTER */}
                            <div className="order-footer">

                                <p>
                                    <strong>Payment:</strong>{" "}
                                    {order.paymentMethod === "cod"
                                        ? "Cash on Delivery"
                                        : "Online"}
                                </p>

                                <p>
                                    <strong>
                                        Payment Status:
                                    </strong>{" "}
                                    {order.paymentStatus}
                                </p>

                                <p>
                                    <strong>Total:</strong>{" "}
                                    ₹{order.grandTotal}
                                </p>

                                <p>
                                    <strong>Tracking:</strong>{" "}
                                    {order.trackingNumber ||
                                        "Not available"}
                                </p>

                            </div>


                            {/* VIEW DETAILS BUTTON */}
                            <div className="order-actions">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/orders/${order._id}`
                                        )
                                    }
                                >
                                    View Details
                                </button>

                            </div>

                        </div>
                    ))
                )}

            </div>
        </div>
    );
};

export default MyOrders;