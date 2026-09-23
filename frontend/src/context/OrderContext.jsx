import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  createOrderApi,
  getOrdersApi,
  getUserOrdersApi,
  updateOrderStatusApi,
  cancelOrderApi,
} from "../services/api";

import { useAuth } from "./AuthContext";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // GET ALL ORDERS FROM BACKEND
  // ==========================================
  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    setLoading(true);

    try {
      const res =
        user.role === "admin"
          ? await getOrdersApi()
          : await getUserOrdersApi();

      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch orders when app starts
  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // ==========================================
  // CREATE ORDER
  // ==========================================

  const placeOrder = async (orderPayload) => {
    try {
      const res = await createOrderApi(orderPayload);

      if (res.success && res.data) {
        // Add the real MongoDB order
        setOrders((prev) => [
          res.data,
          ...prev,
        ]);

        return res.data;
      }

      throw new Error(res.message || "Order creation failed");
    } catch (error) {
      console.error("Order creation error:", error);
      throw error;
    }
  };

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const updateOrderStatus = async (orderId, newStatus, cancellationReason = "") => {
    try {
      console.log("Updating order:", orderId, "Status:", newStatus);

      const res = await updateOrderStatusApi(
        orderId,
        newStatus,
        cancellationReason
      );

      if (res.success) {
        // Update the UI immediately
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId || order.orderId === orderId
              ? {
                ...order,
                orderStatus: newStatus,
                ...(newStatus === "Cancelled" && cancellationReason
                  ? { cancellationReason }
                  : {}),
              }
              : order
          )
        );

        return res.data;
      }

      throw new Error(
        res.message || "Failed to update order status"
      );
    } catch (error) {
      console.error("Order status update error:", error);
      throw error;
    }
  };

  // ==========================================
  // CANCEL ORDER WITH REASON
  // ==========================================

  const cancelOrder = async (orderId, cancellationReason = "") => {
    try {
      console.log("Cancelling order:", orderId, "Reason:", cancellationReason);

      const res = await cancelOrderApi(orderId, cancellationReason);

      if (res.success && res.data) {
        // Update the UI immediately with cancelled order details
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId || order.orderId === orderId
              ? res.data
              : order
          )
        );

        return res.data;
      }

      throw new Error(res.message || "Failed to cancel order");
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  };

  // ==========================================
  // GET CURRENT USER ORDERS
  // ==========================================

  const getUserOrders = useCallback(async () => {
    if (!user) {
      return [];
    }

    try {
      const res = await getUserOrdersApi();

      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }

      return [];
    } catch (error) {
      console.error(
        "Failed to fetch user orders:",
        error
      );

      return [];
    }
  }, [user]);

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        getUserOrders,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error(
      "useOrders must be used within an OrderProvider"
    );
  }

  return context;
}