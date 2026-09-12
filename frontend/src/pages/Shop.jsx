import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/Productcard.jsx";
import Searchbar from "../components/Searchbar.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import "./Shop.css";

const DEFAULT_CATEGORIES = [
  "All",
  "Rings",
  "Necklaces",
  "Earrings",
  "Accessories",
  "Bangles",
  "Bracelets",
  "Pendants",
  "Jewellery",
  "Men",
  "Women",
];

// Helper to normalize singular/plural variations for flawless matching
const normalizeString = (str) => {
  if (!str) return "";
  let clean = str.trim().toLowerCase();
  // Strip trailing 's' for basic singular comparison if length > 3
  if (clean.endsWith("ies")) {
    clean = clean.slice(0, -3) + "y"; // accessories -> accessory
  } else if (clean.endsWith("s") && !clean.endsWith("ss")) {
    clean = clean.slice(0, -1); // rings -> ring, necklaces -> necklace
  }
  return clean;
};

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("All");
    }
  }, [urlCategory]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("featured");
    setSearchParams({});
  };

  // Dynamically extract all available categories present in products plus defaults
  const dynamicCategories = useMemo(() => {
    const productCategories = products.map((p) => p.category).filter(Boolean);
    const set = new Set(["All", ...DEFAULT_CATEGORIES, ...productCategories]);
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normSelected = normalizeString(selectedCategory);

    return products
      .filter((item) => {
        if (selectedCategory === "All") {
          // No category filtering
        } else {
          const itemCatNorm = normalizeString(item.category);
          const itemSubCatNorm = normalizeString(item.subCategory);

          const matchesDirect =
            itemCatNorm === normSelected ||
            itemSubCatNorm === normSelected ||
            item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            item.subCategory?.toLowerCase() === selectedCategory.toLowerCase();

          // If looking for 'jewellery', also match items with subCategory jewellery or standard jewelry categories
          const matchesJewellery =
            normSelected === "jewellery" || normSelected === "jewelry";

          if (!matchesDirect && !matchesJewellery) {
            return false;
          }
        }

        const matchesSearch =
          !searchQuery.trim() ||
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subCategory?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // default featured
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="shop-page">
      <section className="shop-banner">
        <span className="shop-tag">CURATED FINE JEWELRY</span>
        <h1>Shop All Collections</h1>
        <p>
          Discover handcrafted solitaire rings, diamond necklaces, and royal accessories tailored to perfection.
        </p>
      </section>

      <div className="shop-container">
        <div className="shop-controls-bar">
          <Searchbar
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />

          <div className="shop-category-pills">
            {dynamicCategories.map((cat) => {
              const isSelected =
                normalizeString(selectedCategory) === normalizeString(cat) ||
                (selectedCategory === "All" && cat === "All");

              return (
                <button
                  key={cat}
                  className={`pill-btn ${isSelected ? "active" : ""}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="shop-sort-box">
            <label htmlFor="shop-sort">Sort by:</label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="shop-results-info">
          {loading
            ? "Connecting to database..."
            : `Showing ${filteredProducts.length} of ${products.length} exquisite designs in "${selectedCategory}"`}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="shop-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            <span className="empty-icon">💎</span>
            <h3>No Jewels Found in "{selectedCategory}"</h3>
            <p>We couldn't find any products matching your selected search or filter criteria.</p>
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;
