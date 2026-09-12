import { useState, useEffect } from "react";
import AdminPanel from "../components/AdminPanel.jsx";
import AdminLogin from "./AdminLogin.jsx";

function Admin() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const sessionData = sessionStorage.getItem("riwaaz_admin") || localStorage.getItem("riwaaz_admin");
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (adminUser) {
      sessionStorage.setItem("riwaaz_admin", JSON.stringify(adminUser));
      localStorage.setItem("riwaaz_admin", JSON.stringify(adminUser));
    }
  }, [adminUser]);

  // If not logged in in current session, render Login page with Access Denied error banner first
  if (!adminUser) {
    return (
      <AdminLogin
        defaultError="⚠️ Access Denied: Please log in to access the Admin Panel."
        onSuccess={(user) => setAdminUser(user)}
      />
    );
  }

  return <AdminPanel />;
}

export default Admin;
