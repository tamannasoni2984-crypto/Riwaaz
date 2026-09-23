import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "../components/AdminPanel.jsx";

function Admin() {
  const navigate = useNavigate();
  const [adminUser] = useState(() => {
    try {
      const sessionData = sessionStorage.getItem("riwaaz_admin");
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // If not authenticated in session, redirect to /admin-login
    if (!adminUser) {
      navigate("/admin-login", {
        replace: true,
        state: { error: "Please log in with admin credentials to access the Admin Panel." },
      });
    }
  }, [adminUser, navigate]);

  if (!adminUser) {
    return null;
  }

  return <AdminPanel />;
}

export default Admin;
