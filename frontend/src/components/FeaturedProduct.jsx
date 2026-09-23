import React, { useState } from "react";
import ProductCard from "./Productcard.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import "./FeaturedProduct.css";

const TABS = ["All", "Rings", "Necklaces", "Earrings", "Bracelets", "Accessories", "Women", "Men", "Jewellery"];

function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState("All");
  const { products } = useProducts();

  const filteredProducts = products.filter((product) => {
    if (activeTab === "All") return true;
    const cat = product.category?.toLowerCase() || "";
    const sub = product.subCategory?.toLowerCase() || "";
    const target = activeTab.toLowerCase();
    const rootTarget = target.replace(/s$/, "").replace(/ies$/, "y");

    return (
      cat === target ||
      cat.includes(rootTarget) ||
      sub === target ||
      sub.includes(rootTarget)
    );
  });

  return (
    <section className="featured-products">
      <div className="featured-heading">
        <span className="featured-subtitle">SIGNATURE HIGHLIGHTS</span>
        <h2>Featured Collections</h2>
        <p className="featured-desc">
          Indulge in our most sought-after royal gems, handcrafted with 18k and 22k gold.
        </p>

        <div className="filter-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`filter-tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;
