import React, { useState, useMemo } from "react";
import ProductCard from "../components/Productcard.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import "./NewArrival.css";

const DEFAULT_CATEGORIES = ["All", "Rings", "Necklaces", "Earrings", "Accessories", "Bracelets", "Bangles"];

function NewArrival() {
  const [selectedCat, setSelectedCat] = useState("All");
  const { products } = useProducts();

  const newProducts = useMemo(() => {
    return products.filter((item) => item.isNew);
  }, [products]);

  const categoriesList = useMemo(() => {
    const cats = newProducts.map((p) => p.category).filter(Boolean);
    return Array.from(new Set(["All", ...DEFAULT_CATEGORIES, ...cats]));
  }, [newProducts]);

  const filteredProducts = useMemo(() => {
    return newProducts.filter((item) => {
      if (selectedCat === "All") return true;
      const cat = item.category?.toLowerCase() || "";
      const sub = item.subCategory?.toLowerCase() || "";
      const target = selectedCat.toLowerCase();
      return (
        cat === target ||
        cat.includes(target.replace(/s$/, "")) ||
        sub === target ||
        sub.includes(target.replace(/s$/, ""))
      );
    });
  }, [newProducts, selectedCat]);

  return (
    <div className="new-arrival-page">
      <header className="new-arrival-banner">
        <span className="new-tag-badge">FRESH FROM THE VAULT</span>
        <h1>New Arrivals 2026</h1>
        <p>
          Be the first to explore the newest additions to our luxury jewelry atelier, newly crafted this season.
        </p>
      </header>

      <div className="new-arrival-container">
        <div className="new-filter-bar">
          <span className="filter-label">Filter Category:</span>
          <div className="new-pill-group">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`new-pill ${selectedCat.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="new-product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id || product.id} className="new-card-badge-wrapper">
                <span className="just-arrived-badge">JUST ARRIVED</span>
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px", width: "100%", color: "#9ca3af", gridColumn: "1 / -1" }}>
              <h3>No New Arrivals in "{selectedCat}" currently</h3>
              <p>Check back soon or explore other categories in our vault.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewArrival;
