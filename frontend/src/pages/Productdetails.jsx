import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import ProductCard from "../components/Productcard.jsx";

function Productdetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { products } = useProducts();
  const [quantity, setQuantity] = useState(1);

  const product = useMemo(() => {
    return (
      products.find((p) => String(p._id || p.id) === String(id)) ||
      products[0] || {
        id: 1,
        name: "Solitaire Diamond Ring",
        category: "Rings",
        price: 14999,
        image: "/images/ring.png",
        description: "Exquisite fine jewelry masterpiece.",
      }
    );
  }, [id, products]);

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, id: productId });
    }
    showToast(`Added ${quantity} x "${product.name}" to Cart!`, "cart");
  };

  const handleWishlist = () => {
    toggleWishlist({ ...product, id: productId });
    if (!inWishlist) {
      showToast(`Added "${product.name}" to Wishlist`, "wishlist-add");
    } else {
      showToast(`Removed "${product.name}" from Wishlist`, "wishlist-remove");
    }
  };

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => String(p._id || p.id) !== String(productId) && p.category === product.category)
      .slice(0, 4);
  }, [product, products, productId]);

  return (
    <div style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 5%", minHeight: "80vh" }}>
      <div style={{ marginBottom: "20px", fontSize: "14px", color: "#777" }}>
        <Link to="/" style={{ color: "#d4af37", textDecoration: "none" }}>Home</Link> /{" "}
        <Link to="/shop" style={{ color: "#d4af37", textDecoration: "none" }}>Shop</Link> /{" "}
        <span>{product.name}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "50px", marginBottom: "60px" }}>
        <div style={{ background: "#fff", borderRadius: "16px", padding: "30px", border: "1px solid #eaeaea", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ maxWidth: "100%", maxHeight: "420px", objectFit: "contain" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/ring.png";
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={{ fontSize: "12px", letterSpacing: "2px", fontWeight: "700", color: "#b8860b", textTransform: "uppercase" }}>
            {product.category}
          </span>
          <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "10px 0 15px", color: "#111" }}>
            {product.name}
          </h1>
          <p style={{ fontSize: "26px", fontWeight: "800", color: "#b8860b", margin: "0 0 20px" }}>
            ₹{product.price ? Number(product.price).toLocaleString("en-IN") : "0"}
          </p>

          <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#555", marginBottom: "25px" }}>
            {product.description}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "25px", overflow: "hidden" }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: "8px 16px", background: "#f5f5f5", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                -
              </button>
              <span style={{ padding: "8px 18px", fontWeight: "600" }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: "8px 16px", background: "#f5f5f5", border: "none", cursor: "pointer", fontSize: "16px" }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: "14px 28px",
                borderRadius: "30px",
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
            >
              Add to Cart
            </button>

            <button
              onClick={handleWishlist}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                background: inWishlist ? "#e63946" : "#fff",
                color: inWishlist ? "#fff" : "#111",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {inWishlist ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 style={{ fontSize: "24px", marginBottom: "25px", borderBottom: "2px solid #eaeaea", paddingBottom: "10px" }}>
            Related Masterpieces
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "25px" }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Productdetails;
