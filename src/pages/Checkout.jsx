import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user, addresses = [], addAddress } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const {
        shippingCost = 0,
        discount = 0,
        grandTotal = cartTotal,
    } = location.state || {};

    // --------------------------------
    // ADDRESS
    // --------------------------------

    const defaultAddr =
        addresses.find((address) => address.isDefault) ||
        addresses[0] ||
        null;

    const [addressType, setAddressType] = useState(
        defaultAddr ? "default" : "new"
    );

    const [formData, setFormData] = useState({
        street: "",
        city: "",
        state: "",
        pincode: "",
    });

    // Load user's default address
    useEffect(() => {
        if (defaultAddr && addressType === "default") {
            setFormData({
                street: defaultAddr.street || "",
                city: defaultAddr.city || "",
                state: defaultAddr.state || "",
                pincode: defaultAddr.pincode || "",
            });
        }
    }, [defaultAddr, addressType]);

    // --------------------------------
    // PAYMENT
    // --------------------------------

    const [paymentMethod, setPaymentMethod] = useState("cod");

    // --------------------------------
    // HANDLE NEW ADDRESS INPUT
    // --------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --------------------------------
    // GET SELECTED ADDRESS
    // --------------------------------

    const getShippingAddress = () => {
        if (addressType === "default" && defaultAddr) {
            return {
                street: defaultAddr.street || "",
                city: defaultAddr.city || "",
                state: defaultAddr.state || "",
                pincode: defaultAddr.pincode || "",
            };
        }

        return {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
        };
    };

    // --------------------------------
    // VALIDATE ADDRESS
    // --------------------------------

    const isAddressValid = () => {
        const address = getShippingAddress();

        return (
            address.street &&
            address.city &&
            address.state &&
            address.pincode
        );
    };

    // --------------------------------
    // COD
    // --------------------------------

    const handleCOD = async () => {
        try {
            if (!user) {
                alert("Please login first");
                return;
            }

            if (cartItems.length === 0) {
                alert("Your cart is empty");
                return;
            }

            if (!isAddressValid()) {
                alert("Please complete your shipping address");
                return;
            }

            const shippingAddress = getShippingAddress();

            const orderData = {
                customer: {
                    fullName:
                        user.fullname ||
                        user.name ||
                        "Valued Customer",

                    email: user.email || "",

                    phone: user.phone || "",
                },

                shippingAddress,

                items: cartItems,

                itemsTotal: cartTotal,

                tax: 0,

                shippingFee: shippingCost,
                discount: discount,
                promoCode: "",
                grandTotal: grandTotal,
                paymentMethod: "cod",
            };

            const response = await fetch(
                "http://localhost:5000/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(orderData),
                }
            );

            const data = await response.json();

            if (!data.success) {
                alert(data.message);
                return;
            }

            // Save new address if user selected Add New Address
            if (addressType === "new" && addAddress) {
                addAddress({
                    ...shippingAddress,

                    label: "New Address",

                    fullName:
                        user.fullname ||
                        user.name ||
                        "",

                    phone: user.phone || "",

                    isDefault: addresses.length === 0,
                });
            }

            // Clear cart from context & storage
            clearCart();

            navigate("/order-confirmation", {
                state: {
                    order: data.data,
                },
            });

        } catch (error) {
            console.error("COD Order Error:", error);

            alert("Something went wrong while placing the order.");
        }
    };

    // --------------------------------
    // PAYU
    // --------------------------------

    const handlePayU = async () => {
        try {
            if (!user) {
                alert("Please login first");
                return;
            }

            if (cartItems.length === 0) {
                alert("Your cart is empty");
                return;
            }

            if (!isAddressValid()) {
                alert("Please complete your shipping address");
                return;
            }

            const shippingAddress = getShippingAddress();

            const orderData = {
                customer: {
                    fullName:
                        user.fullname ||
                        user.name ||
                        "Valued Customer",
                    email: user.email || "",
                    phone: user.phone || "",
                },
                shippingAddress,
                items: cartItems,
                itemsTotal: cartTotal,
                tax: 0,
                shippingFee: shippingCost,
                discount: discount,
                promoCode: "",
                grandTotal: grandTotal,
                paymentMethod: "online",
            };

            const orderResponse = await fetch(
                "http://localhost:5000/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(orderData),
                }
            );

            const orderDataResponse = await orderResponse.json();

            if (!orderDataResponse.success) {
                alert(orderDataResponse.message);
                return;
            }

            const order = orderDataResponse.data;

            // CREATE PAYU PAYMENT
            const paymentResponse = await fetch(
                "http://localhost:5000/api/payment/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        orderId: order._id,
                        amount: grandTotal,
                        productinfo: "RIWAAZ Jewellery Order",
                        firstname:
                            user.fullname ||
                            user.name ||
                            "Valued Customer",
                        email: user.email,
                        phone: user.phone || "",
                    }),
                }
            );

            const paymentData = await paymentResponse.json();

            if (!paymentData.success) {
                alert(paymentData.message);
                return;
            }

            // SEND TO PAYU
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "https://test.payu.in/_payment";

            const paymentFields = {
                key: paymentData.key,
                txnid: paymentData.txnid,
                amount: paymentData.amount,
                productinfo: paymentData.productinfo,
                firstname: paymentData.firstname,
                email: paymentData.email,
                phone: paymentData.phone,
                hash: paymentData.hash,
                surl: paymentData.surl,
                furl: paymentData.furl,
            };

            Object.keys(paymentFields).forEach((key) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = paymentFields[key];
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();

        } catch (error) {
            console.error("PayU Error:", error);
            alert("Error: " + error.message);
        }
    };

    // --------------------------------
    // UI
    // --------------------------------

    return (
        <div className="checkout-page">

            <div className="checkout-container">

                <h1>RIWAAZ Checkout</h1>

                <div className="checkout-content">

                    {/* =========================
                        SHIPPING ADDRESS
                    ========================= */}

                    <div className="customer-box">

                        <h2>Shipping Address</h2>

                        {/* DEFAULT ADDRESS */}

                        {defaultAddr && (
                            <label className="address-option">

                                <input
                                    type="radio"
                                    name="addressType"
                                    value="default"
                                    checked={
                                        addressType ===
                                        "default"
                                    }
                                    onChange={() =>
                                        setAddressType(
                                            "default"
                                        )
                                    }
                                />

                                <div>
                                    <strong>
                                        Use Default Address
                                    </strong>

                                    <p>
                                        {defaultAddr.street}
                                        <br />

                                        {defaultAddr.city},{" "}
                                        {defaultAddr.state}
                                        <br />

                                        {defaultAddr.pincode}
                                    </p>
                                </div>

                            </label>
                        )}

                        {/* ADD NEW ADDRESS */}

                        <label className="address-option">

                            <input
                                type="radio"
                                name="addressType"
                                value="new"
                                checked={
                                    addressType ===
                                    "new"
                                }
                                onChange={() =>
                                    setAddressType(
                                        "new"
                                    )
                                }
                            />

                            <strong>
                                Add New Address
                            </strong>

                        </label>

                        {/* NEW ADDRESS FORM */}

                        {addressType === "new" && (
                            <div className="new-address-form">

                                <input
                                    type="text"
                                    name="street"
                                    placeholder="Street / Address"
                                    value={
                                        formData.street
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={
                                        formData.city
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={
                                        formData.state
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                                <input
                                    type="text"
                                    name="pincode"
                                    placeholder="Pincode"
                                    value={
                                        formData.pincode
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>
                        )}

                    </div>


                    {/* =========================
                        ORDER SUMMARY
                    ========================= */}

                    <div className="payment-box">

                        <h2>Order Summary</h2>

                        {cartItems.map((item) => (
                            <div
                                className="checkout-item"
                                key={`${item._id}-${item.selectedKarat}-${item.selectedSize}`}
                            >

                                <img
                                    src={
                                        item.image ||
                                        "/images/ring.png"
                                    }
                                    alt={item.name}
                                />

                                <div>

                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p>
                                        Quantity:{" "}
                                        {item.quantity}
                                    </p>

                                    <p>
                                        ₹
                                        {(
                                            Number(
                                                item.price
                                            ) *
                                            item.quantity
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>

                                </div>

                            </div>
                        ))}

                        <div className="checkout-total">

                            <strong>
                                Total:
                            </strong>

                            <strong>
                                ₹
                                {Number(
                                    grandTotal
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>


                        {/* =========================
                            PAYMENT METHOD
                        ========================= */}

                        <div className="payment-method">

                            <h2>
                                Payment Method
                            </h2>

                            <label>

                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cod"
                                    checked={
                                        paymentMethod ===
                                        "cod"
                                    }
                                    onChange={() =>
                                        setPaymentMethod(
                                            "cod"
                                        )
                                    }
                                />

                                Cash on Delivery

                            </label>


                            <label>

                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="online"
                                    checked={
                                        paymentMethod ===
                                        "online"
                                    }
                                    onChange={() =>
                                        setPaymentMethod(
                                            "online"
                                        )
                                    }
                                />

                                Pay Online

                            </label>

                        </div>


                        {/* =========================
                            PLACE ORDER
                        ========================= */}

                        <button
                            className="pay-button"
                            onClick={
                                paymentMethod ===
                                    "cod"
                                    ? handleCOD
                                    : handlePayU
                            }
                        >

                            {paymentMethod ===
                                "cod"
                                ? "Place Order"
                                : "Pay Online"}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Checkout;