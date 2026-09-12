import React, { useState } from "react";
import ProductCard from "../components/Productcard.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import "./Collections.css";

const COLLECTIONS_LIST = [
  {
    id: "all",
    name: "All Masterpieces",
    label: "Explore Entire Vault",
    image: "/images/ring.png",
    description: "Every hand-picked solitaire and bespoke diamond piece created for discerning connoisseurs.",
  },
  {
    id: "rings",
    name: "Solitaire Rings",
    label: "View Diamond Bands",
    image: "/images/ring-removebg-preview.png",
    description: "Brilliant certified solitaires set in platinum, 18k yellow and rose gold settings.",
  },
  {
    id: "necklaces",
    name: "Royal Necklaces",
    label: "View Chokers & Sets",
    image: "/images/women.png",
    description: "South Sea pearls and diamond chokers capturing the majestic beauty of royal heritage.",
  },
  {
    id: "earrings",
    name: "Diamond Earrings",
    label: "View Diamond Earrings",
    image: "/images/earring.png",
    description: "Intricately sculpted heritage Kundan and diamond accessories for extraordinary celebrations.",
  },
  {
    id: "bracelets",
    name: "Diamond Bracelets",
    label: "View Diamond Bracelets",
    image: "/images/bracelet.png",
    description: "Intricately sculpted heritage Kundan and diamond accessories for extraordinary celebrations.",
  },
  {
    id: "accessories",
    name: "Heritage Accessories",
    label: "View Cufflinks & Bangles",
    image: "/images/accessories.png",
    description: "Intricately sculpted heritage Kundan and diamond accessories for extraordinary celebrations.",
  },
  {
    id: "women",
    name: "Women's Jewellery",
    label: "View Women's Jewellery",
    image: "/images/women.png",
    description: "Intricately sculpted heritage Kundan and diamond accessories for extraordinary celebrations.",
  },
  {
    id: "men",
    name: "Men's Jewellery",
    label: "View Men's Jewellery",
    image: "/images/men.png",
    description: "Intricately sculpted heritage Kundan and diamond accessories for extraordinary celebrations.",
  },
  {
    id: "jewellery",
    name: "Jewellery",
    label: "View Jewellery",
    image: "/images/jewellery.png",
    description: "Intricately sculpted heritage Kundan and diamond accessories for extraordinary celebrations.",
  },
];

function Collections() {
  const [selectedCol, setSelectedCol] = useState(COLLECTIONS_LIST[0]);
  const { products } = useProducts();

  const displayedProducts = products.filter((product) => {
    if (selectedCol.id === "all") return true;
    if (selectedCol.id === "rings") return product.category?.toLowerCase().includes("ring");
    if (selectedCol.id === "necklaces") return product.category?.toLowerCase().includes("necklace");
    if (selectedCol.id === "earrings") return product.category?.toLowerCase().includes("earring");
    if (selectedCol.id === "bracelets") return product.category?.toLowerCase().includes("bracelet");
    if (selectedCol.id === "accessories") {
      const cat = product.category?.toLowerCase() || "";
      const sub = product.subCategory?.toLowerCase() || "";
      return (
        cat.includes("accessori") ||
        cat.includes("earring") ||
        cat.includes("bangle") ||
        cat.includes("bracelet") ||
        sub.includes("jewellery")
      );
    }
    if (selectedCol.id === "women") return product.category?.toLowerCase().includes("women");
    if (selectedCol.id === "men") return product.category?.toLowerCase().includes("men");
    if (selectedCol.id === "jewellery") return product.category?.toLowerCase().includes("jewellery");
    return true;
  });

  return (
    <div className="collections-page">
      <header className="collections-header">
        <span className="col-tag">HERITAGE & COUTURE</span>
        <h1>Curated Collections</h1>
        <p>
          Immerse yourself in our bespoke fine jewellery collections, designed to celebrate the milestone moments of life.
        </p>
      </header>

      <div className="collections-container">
        {/* Collections Selector Cards */}
        <div className="collections-grid-selector">
          {COLLECTIONS_LIST.map((col) => (
            <div
              key={col.id}
              className={`collection-card ${selectedCol.id === col.id ? "active" : ""}`}
              onClick={() => setSelectedCol(col)}
            >
              <div className="col-img-wrapper">
                <img src={col.image} alt={col.name} />
              </div>
              <div className="col-card-info">
                <h3>{col.name}</h3>
                <span className="col-btn-label">{col.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Collection Details Banner */}
        <div className="active-collection-banner">
          <h2>{selectedCol.name}</h2>
          <p>{selectedCol.description}</p>
          <span className="col-count-badge">
            {displayedProducts.length} Exquisite Designs Available
          </span>
        </div>

        {/* Products Grid */}
        <div className="collections-product-grid">
          {displayedProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Collections;
