import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, registerUserApi } from "../services/api";

const AuthContext = createContext();

const DEFAULT_ADDRESSES = [];

export function AuthProvider({ children }) {
  // Load User from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("riwaaz_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Load Saved Addresses from localStorage
  const [addresses, setAddresses] = useState(() => {
    try {
      const savedAddresses = localStorage.getItem("riwaaz_addresses");
      return savedAddresses ? JSON.parse(savedAddresses) : DEFAULT_ADDRESSES;
    } catch {
      return DEFAULT_ADDRESSES;
    }
  });

  // Persist User State
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("riwaaz_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("riwaaz_user");
      }
    } catch (e) {
      console.error("Failed to persist user in localStorage", e);
    }
  }, [user]);

  // Persist Address State
  useEffect(() => {
    try {
      localStorage.setItem("riwaaz_addresses", JSON.stringify(addresses));
    } catch (e) {
      console.error("Failed to persist addresses in localStorage", e);
    }
  }, [addresses]);

  // Login handler
  const login = useCallback(async (email, password) => {
    if (!email || !password) return { success: false, message: "Please fill all required fields." };

    try {
      const res = await loginUser(email, password);
      if (res.success && res.user) {
        const loggedUser = {
          id: res.user.id || res.user._id,
          name: res.user.name || res.user.fullname || email.split("@")[0],
          fullname: res.user.fullname || res.user.name || "",
          email: res.user.email || email,
          phone: res.user.phone || "",
          address: res.user.address || {
            street: "",
            city: "",
            state: "",
            pincode: "",
          },
          joinedDate: res.user.joinedDate || "January 2026",
          memberStatus: res.user.memberStatus || "Gold VIP Member",
        };
        setUser(loggedUser);
        return { success: true, message: res.message || "Welcome back to RIWAAZ!" };
      } else if (res.message) {
        return { success: false, message: res.message };
      }
    } catch {
      console.log("ℹ️ [AuthContext] Backend offline / using local auth simulation");
    }

    const fallbackUser = {
      name: email.split("@")[0].toUpperCase() || "Valued Customer",
      email,
      phone: "+91 98765 43210",
      joinedDate: "January 2026",
      memberStatus: "Gold VIP Member",
    };

    setUser(fallbackUser);
    return { success: true, message: "Welcome back to RIWAAZ!" };
  }, []);

  // Signup handler
  const signup = useCallback(async (name, email, phone, password) => {
    if (!name || !email || !password) {
      return { success: false, message: "Please fill in all mandatory signup fields." };
    }

    try {
      const res = await registerUserApi({
        fullname: name,
        email,
        phone,
        password,
      });

      if (res.success && res.user) {
        const newUser = {
          id: res.user.id || res.user._id,
          name: res.user.name || res.user.fullname || name,
          fullname: res.user.fullname || name,
          email: res.user.email || email,
          phone: res.user.phone || phone || "",
          address: res.user.address || {
            street: "",
            city: "",
            state: "",
            pincode: "",
          },
          joinedDate: res.user.joinedDate || "Current Season",
          memberStatus: res.user.memberStatus || "Silver Privilege Member",
        };
        setUser(newUser);
        return { success: true, message: res.message || "Account created successfully!" };
      } else if (res.message) {
        return { success: false, message: res.message };
      }
    } catch {
      console.log("ℹ️ [AuthContext] Backend offline / using local signup simulation");
    }

    const localNewUser = {
      name,
      email,
      phone: phone || "",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      memberStatus: "Silver Privilege Member",
    };

    setUser(localNewUser);
    return { success: true, message: "Account created successfully! Welcome to RIWAAZ." };
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Update Profile
  const updateProfile = useCallback((updatedInfo) => {
    setUser((prev) => (prev ? { ...prev, ...updatedInfo } : prev));
  }, []);

  // Add New Address
  const addAddress = useCallback((newAddr) => {
    const id = "addr-" + Date.now();
    setAddresses((prev) => {
      let list = [...prev];
      if (newAddr.isDefault || list.length === 0) {
        list = list.map((a) => ({ ...a, isDefault: false }));
      }
      return [...list, { ...newAddr, id }];
    });
  }, []);

  // Update Existing Address
  const updateAddress = useCallback((id, updatedAddr) => {
    setAddresses((prev) => {
      let list = prev.map((item) =>
        item.id === id ? { ...item, ...updatedAddr } : item
      );
      if (updatedAddr.isDefault) {
        list = list.map((item) =>
          item.id === id ? { ...item, isDefault: true } : { ...item, isDefault: false }
        );
      }
      return list;
    });
  }, []);

  // Delete Address
  const deleteAddress = useCallback((id) => {
    setAddresses((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  }, []);

  // Set Default Address
  const setDefaultAddress = useCallback((id) => {
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        addresses,
        login,
        signup,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
