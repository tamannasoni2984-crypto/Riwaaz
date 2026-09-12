import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Collections from "./pages/Collections.jsx";
import NewArrival from "./pages/NewArrival.jsx";
import Login from "./pages/Login.jsx";
import Admin from "./pages/Admin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function MainContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.toLowerCase().startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/shop" element={<Shop/>}/>
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/wishlist" element={<Wishlist/>}/>
        <Route path="/collections" element={<Collections/>}/>
        <Route path="/newArrival" element={<NewArrival/>}/>
        <Route path="/NewArrival" element={<NewArrival/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/admin-login" element={<AdminLogin/>}/>
        <Route path="/admin/login" element={<AdminLogin/>}/>
        <Route path="/admin-page" element={<Admin/>}/>
        <Route path="/Admin-page" element={<Admin/>}/>
        <Route path="/admin" element={<Admin/>}/>
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MainContent />
    </BrowserRouter>
  );
}

export default App;
