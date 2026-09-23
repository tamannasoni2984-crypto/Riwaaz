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

const normalizeString = (str) => {
  if (!str) return "";
  let clean = str.trim().toLowerCase();
  if (clean.endsWith("ies")) {
    clean = clean.slice(0, -3) + "y";
  } else if (clean.endsWith("s") && !clean.endsWith("ss")) {
    clean = clean.slice(0, -1);
  }
  return clean;
};

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search");

  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "All");
  const [searchQuery, setSearchQuery] = useState(urlSearch || "");
  const [sortBy, setSortBy] = useState("featured");
  const [maxPriceFilter, setMaxPriceFilter] = useState(250000);

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("All");
    }
  }, [urlCategory]);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

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
    setMaxPriceFilter(250000);
    setSearchParams({});
  };

  // Derive categories with live counts
  const categoryStats = useMemo(() => {
    const productCategories = products.map((p) => p.category).filter(Boolean);
    const set = new Set(["All", ...DEFAULT_CATEGORIES, ...productCategories]);
    const categoriesArray = Array.from(set);

    return categoriesArray.map((cat) => {
      if (cat === "All") {
        return { name: "All", count: products.length };
      }
      const count = products.filter((p) => {
        const normSelected = normalizeString(cat);
        const itemCatNorm = normalizeString(p.category);
        const itemSubCatNorm = normalizeString(p.subCategory);
        return itemCatNorm === normSelected || itemSubCatNorm === normSelected;
      }).length;
      return { name: cat, count };
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normSelected = normalizeString(selectedCategory);

    return products
      .filter((item) => {
        // Price Filter
        if (Number(item.price) > maxPriceFilter) {
          return false;
        }

        // Category Filter
        if (selectedCategory !== "All") {
          const itemCatNorm = normalizeString(item.category);
          const itemSubCatNorm = normalizeString(item.subCategory);

          const matchesDirect =
            itemCatNorm === normSelected ||
            itemSubCatNorm === normSelected ||
            item.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            item.subCategory?.toLowerCase() === selectedCategory.toLowerCase();

          const matchesJewellery =
            normSelected === "jewellery" || normSelected === "jewelry";

          if (!matchesDirect && !matchesJewellery) {
            return false;
          }
        }

        // Search Filter
        const matchesSearch =
          !searchQuery.trim() ||
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subCategory?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === "price-high") return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
        return 0; // default featured
      });
  }, [products, selectedCategory, searchQuery, sortBy, maxPriceFilter]);

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
            {categoryStats.map(({ name, count }) => {
              const isSelected =
                normalizeString(selectedCategory) === normalizeString(name) ||
                (selectedCategory === "All" && name === "All");

              return (
                <button
                  key={name}
                  className={`pill-btn ${isSelected ? "active" : ""}`}
                  onClick={() => handleCategoryChange(name)}
                >
                  {name} {count > 0 ? `(${count})` : ""}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", width: "100%", justifyContent: "space-between" }}>
            {/* Price Filter Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "600" }}>
              <label htmlFor="price-slider">Max Price: ₹{maxPriceFilter.toLocaleString("en-IN")}</label>
              <input
                id="price-slider"
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                style={{ accentColor: "#b8860b", cursor: "pointer" }}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="shop-sort-box">
              <label htmlFor="shop-sort">Sort by:</label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured Masterpieces</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated ★</option>
                <option value="name-asc">Alphabetical A-Z</option>
              </select>
            </div>
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
            <p>We couldn't find any products matching your selected search or price criteria (Under ₹{maxPriceFilter.toLocaleString("en-IN")}).</p>
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
