import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ProductCard from "../components/Productcard.jsx";

const KARAT_OPTIONS = [
  { label: "18K Yellow Gold", multiplier: 1.0, description: "Classic 75% Gold hallmarked with hallmark certification" },
  { label: "22K Royal Gold", multiplier: 1.18, description: "Heritage 91.6% Gold high-luster traditional finish" },
  { label: "950 Platinum", multiplier: 1.35, description: "Rare pure Platinum setting with icy brilliance" },
  { label: "18K Rose Gold", multiplier: 1.02, description: "Warm blush tone alloyed with pure copper" },
];

const SIZES = ["12", "14 (Standard)", "16", "18", "20", "Custom Size"];

function Productdetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast?.() || {};
  const { products, addReview } = useProducts();
  const { user } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedKarat, setSelectedKarat] = useState(KARAT_OPTIONS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [activeTab, setActiveTab] = useState("specs"); // 'specs' | 'reviews' | 'delivery'

  // Review Form state
  const [reviewerName, setReviewerName] = useState(user ? user.name : "");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const product = useMemo(() => {
    return (
      products.find((p) => String(p._id || p.id) === String(id)) ||
      products[0] || {
        id: "1",
        _id: "1",
        name: "Solitaire Diamond Ring",
        category: "Rings",
        price: 14999,
        image: "/images/ring.png",
        description: "Exquisite fine jewelry masterpiece handcrafted with unmatched royal artisanal precision.",
        stock: 20,
        rating: 4.8,
        reviews: [],
      }
    );
  }, [id, products]);

  const productId = String(product._id || product.id);
  const inWishlist = isInWishlist(productId);

  // Dynamic price based on selected karat
  const calculatedPrice = Math.round(Number(product.price) * selectedKarat.multiplier);

  const handleAddToCart = () => {
    const added = addToCart(
      { ...product, price: calculatedPrice },
      { karat: selectedKarat.label, size: selectedSize, quantity }
    );
    if (added && showToast) {
      showToast(`Added ${quantity} × "${product.name}" (${selectedKarat.label}) to Cart!`, "cart");
    }
    return added;
  };

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (added) {
      navigate("/cart");
    }
  };

  const handleWishlist = () => {
    toggleWishlist({ ...product, id: productId, _id: productId });
    if (showToast) {
      if (!inWishlist) {
        showToast(`Added "${product.name}" to Wishlist`, "wishlist-add");
      } else {
        showToast(`Removed "${product.name}" from Wishlist`, "wishlist-remove");
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    await addReview(productId, {
      user: reviewerName.trim() || (user ? user.name : "Valued Connoisseur"),
      rating: Number(reviewRating),
      comment: reviewComment.trim(),
    });

    setReviewSubmitted(true);
    setReviewComment("");
    if (showToast) {
      showToast("Thank you for your valuable royal review!", "success");
    }
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => String(p._id || p.id) !== productId && p.category === product.category)
      .slice(0, 4);
  }, [product, products, productId]);

  const existingReviews = product.reviews || [
    {
      user: "Maharaja Devraj",
      rating: 5,
      comment: "Spectacular brilliance! The diamond cut and polishing are breathtaking in person.",
      createdAt: "2026-08-10T10:00:00.000Z",
    },
    {
      user: "Priya Singhania",
      rating: 5,
      comment: "Ordered for my engagement ceremony. The packaging and finish exceeded expectations.",
      createdAt: "2026-08-28T14:30:00.000Z",
    },
  ];

  return (
    <div style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 4%", minHeight: "80vh" }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: "24px", fontSize: "14px", color: "#888" }}>
        <Link to="/" style={{ color: "#b8860b", textDecoration: "none", fontWeight: "600" }}>Home</Link>
        {" / "}
        <Link to="/shop" style={{ color: "#b8860b", textDecoration: "none", fontWeight: "600" }}>Shop</Link>
        {" / "}
        <Link to={`/shop?category=${encodeURIComponent(product.category || "")}`} style={{ color: "#b8860b", textDecoration: "none", fontWeight: "600" }}>
          {product.category}
        </Link>
        {" / "}
        <span style={{ color: "#222", fontWeight: "700" }}>{product.name}</span>
      </div>

      {/* Main Product Showcase Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px", marginBottom: "60px" }}>
        {/* Left: Product Images / Visuals */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "40px",
              border: "1px solid #eaeaea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              minHeight: "420px",
            }}
          >
            <img
              src={product.image || "/images/ring.png"}
              alt={product.name}
              style={{ maxWidth: "100%", maxHeight: "380px", objectFit: "contain", transition: "transform 0.3s ease" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/ring.png";
              }}
            />
            {product.isNew && (
              <span style={{ position: "absolute", top: "20px", left: "20px", background: "linear-gradient(135deg, #d4af37, #b8860b)", color: "#111", padding: "4px 12px", borderRadius: "8px", fontWeight: "800", fontSize: "12px" }}>
                NEW CREATION
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <div style={{ width: "70px", height: "70px", border: "2px solid #d4af37", borderRadius: "10px", padding: "6px", background: "#fff", cursor: "pointer" }}>
              <img src={product.image || "/images/ring.png"} alt="Thumb 1" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ width: "70px", height: "70px", border: "1px solid #ddd", borderRadius: "10px", padding: "6px", background: "#fff", cursor: "pointer" }}>
              <img src="/images/ring-removebg-preview.png" alt="Thumb 2" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>
        </div>

        {/* Right: Product Purchase Controls & Specs */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "12px", letterSpacing: "2.5px", fontWeight: "800", color: "#b8860b", textTransform: "uppercase" }}>
            {product.category} • {product.subCategory || "Haute Joaillerie"}
          </span>
          <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "8px 0 10px", color: "#111", fontFamily: "'Cinzel', serif" }}>
            {product.name}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 10px", borderRadius: "15px", fontWeight: "700", fontSize: "13px" }}>
              ★ {product.rating || 4.8}
            </span>
            <span style={{ color: "#777", fontSize: "13px" }}>
              ({existingReviews.length} Verified Customer Reviews)
            </span>
            <span style={{ color: "#10b981", fontWeight: "700", fontSize: "13px" }}>
              ● {product.stock > 0 ? `${product.stock} In Vault` : "Sold Out"}
            </span>
          </div>

          <p style={{ fontSize: "28px", fontWeight: "900", color: "#b8860b", margin: "0 0 18px" }}>
            ₹{calculatedPrice.toLocaleString("en-IN")}
            <span style={{ fontSize: "13px", color: "#888", fontWeight: "normal", marginLeft: "10px" }}>
              (Inclusive of all taxes & insurance)
            </span>
          </p>

          <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#555", marginBottom: "24px" }}>
            {product.description}
          </p>

          {/* Karat / Metal Selection */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#222", marginBottom: "8px" }}>
              SELECT METAL PURITY:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {KARAT_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSelectedKarat(opt)}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: selectedKarat.label === opt.label ? "2px solid #b8860b" : "1px solid #ddd",
                    background: selectedKarat.label === opt.label ? "#fdfbf7" : "#fff",
                    color: "#111",
                    fontWeight: "600",
                    fontSize: "13px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div>{opt.label}</div>
                  <span style={{ fontSize: "11px", color: "#777" }}>
                    {opt.multiplier === 1 ? "Standard" : `+${Math.round((opt.multiplier - 1) * 100)}%`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#222", marginBottom: "8px" }}>
              SELECT SIZE:
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: selectedSize === sz ? "2px solid #111" : "1px solid #ddd",
                    background: selectedSize === sz ? "#111" : "#fff",
                    color: selectedSize === sz ? "#fff" : "#222",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "30px", overflow: "hidden", background: "#f9f9f9" }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", fontWeight: "700" }}
              >
                -
              </button>
              <span style={{ padding: "10px 16px", fontWeight: "700", minWidth: "20px", textAlign: "center" }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", fontWeight: "700" }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: "30px",
                border: "none",
                background: "#111",
                color: "#fff",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              style={{
                flex: 1,
                padding: "14px 20px",
                borderRadius: "30px",
                border: "none",
                background: "linear-gradient(135deg, #d4af37, #b8860b)",
                color: "#111",
                fontWeight: "800",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Buy Now
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
                flexShrink: 0,
              }}
            >
              {inWishlist ? "♥" : "♡"}
            </button>
          </div>

          <div style={{ background: "#fcfbf7", padding: "14px 18px", borderRadius: "12px", border: "1px solid #ede8db", fontSize: "13px", color: "#666", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>🔒 <strong>BIS Hallmarked & Certified Natural Diamonds</strong></div>
            <div>🚚 <strong>Complimentary Insured Express Delivery across India</strong></div>
            <div>🔄 <strong>15-Day Inspection & Lifetime Exchange Guarantee</strong></div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Live Reviews */}
      <div style={{ borderTop: "1px solid #eaeaea", paddingTop: "40px", marginBottom: "60px" }}>
        <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid #ddd", marginBottom: "25px" }}>
          <button
            onClick={() => setActiveTab("specs")}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "specs" ? "3px solid #b8860b" : "none",
              color: activeTab === "specs" ? "#b8860b" : "#666",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Jewellery Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "reviews" ? "3px solid #b8860b" : "none",
              color: activeTab === "reviews" ? "#b8860b" : "#666",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Customer Reviews ({existingReviews.length})
          </button>
        </div>

        {activeTab === "specs" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", background: "#fcfbf9", padding: "24px", borderRadius: "16px" }}>
            <div><strong>Metal Type:</strong> <p>{selectedKarat.label}</p></div>
            <div><strong>Diamond Clarity:</strong> <p>VVS1 / Exceptional Colorless EF</p></div>
            <div><strong>Certification:</strong> <p>IGI / GIA Certified Authenticity Card</p></div>
            <div><strong>Hallmarking:</strong> <p>BIS Hallmarked 750 / 916 Stamp</p></div>
          </div>
        ) : (
          <div>
            {/* Submit a Review Form */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #eaeaea", marginBottom: "30px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: "18px" }}>Write a Connoisseur Review</h3>
              {reviewSubmitted && (
                <div style={{ background: "#d1fae5", color: "#065f46", padding: "10px 16px", borderRadius: "8px", marginBottom: "12px", fontSize: "14px" }}>
                  ✓ Your review has been added to the product vault!
                </div>
              )}
              <form onSubmit={handleReviewSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd" }}
                  />
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd" }}
                  >
                    <option value={5}>★★★★★ (5 Stars - Flawless)</option>
                    <option value={4}>★★★★☆ (4 Stars - Exceptional)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                  </select>
                </div>
                <textarea
                  rows="3"
                  placeholder="Share your experience regarding diamond brilliance, craftsmanship, and fit..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
                <button
                  type="submit"
                  style={{ alignSelf: "flex-start", padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "20px", fontWeight: "700", cursor: "pointer" }}
                >
                  Submit Review
                </button>
              </form>
            </div>

            {/* List of Reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {existingReviews.map((rev, index) => (
                <div key={index} style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eaeaea" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <strong style={{ fontSize: "15px" }}>{rev.user}</strong>
                    <span style={{ color: "#f59e0b", fontWeight: "700" }}>{"★".repeat(rev.rating)}</span>
                  </div>
                  <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Masterpieces */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "25px", borderBottom: "2px solid #eaeaea", paddingBottom: "10px" }}>
            Related Masterpieces in {product.category}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "25px" }}>
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
