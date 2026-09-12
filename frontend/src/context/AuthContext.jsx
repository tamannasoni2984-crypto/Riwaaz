import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

const DEFAULT_ADDRESSES = [
  {
    id: "addr-1",
    label: "Home",
    fullName: "Tamanna Soni",
    phone: "+91 98765 43210",
    street: "402 Luxury Heritage Palms, Altamount Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400026",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Work",
    fullName: "Tamanna Soni",
    phone: "+91 98765 43210",
    street: "12th Floor, Financial Tower, BKC",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    isDefault: false,
  },
];

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
  const login = useCallback((email, password) => {
    // Basic verification simulation
    if (!email || !password) return { success: false, message: "Please fill all required fields." };
    
    const loggedInUser = {
      name: email.split("@")[0].toUpperCase() || "Valued Customer",
      email,
      phone: "+91 98765 43210",
      joinedDate: "January 2026",
      memberStatus: "Gold VIP Member",
    };

    setUser(loggedInUser);
    return { success: true, message: "Welcome back to RIWAAZ!" };
  }, []);

  // Signup handler
  const signup = useCallback((name, email, phone, password) => {
    if (!name || !email || !password) {
      return { success: false, message: "Please fill in all mandatory signup fields." };
    }

    const newUser = {
      name,
      email,
      phone: phone || "+91 98765 43210",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      memberStatus: "Silver Privilege Member",
    };

    setUser(newUser);
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
