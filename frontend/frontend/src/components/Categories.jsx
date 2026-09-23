import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext.jsx";
import "./Categories.css";

const BASE_CATEGORIES = [
  {
    id: "rings",
    categoryKey: "Rings",
    title: "Solitaire Rings",
    image: "/images/ring.png",
    path: "/shop?category=Rings",
  },
  {
    id: "necklaces",
    categoryKey: "Necklaces",
    title: "Diamond Necklaces",
    image: "/images/women.png",
    path: "/shop?category=Necklaces",
  },
  {
    id: "earrings",
    categoryKey: "Earrings",
    title: "Artisanal Earrings",
    image: "/images/jewellery.png",
    path: "/shop?category=Earrings",
  },
  {
    id: "bracelets",
    categoryKey: "Bracelets",
    title: "Bangles & Bracelets",
    image: "/images/accessories.png",
    path: "/shop?category=Bracelets",
  },
  {
    id: "accessories",
    categoryKey: "Accessories",
    title: "Royal Accessories",
    image: "/images/accessories.png",
    path: "/shop?category=Accessories",
  },
  {
    id: "men",
    categoryKey: "Men",
    title: "Men's Luxury Bands",
    image: "/images/men.png",
    path: "/shop?category=Men",
  },
  {
    id: "women",
    categoryKey: "Women",
    title: "Women's Couture",
    image: "/images/women.png",
    path: "/shop?category=Women",
  },
  {
    id: "jewellery",
    categoryKey: "Jewellery",
    title: "Heritage Jewellery",
    image: "/images/jewellery.png",
    path: "/shop?category=Jewellery",
  },
];

function Categories() {
  const { products } = useProducts();

  const categoriesWithCounts = useMemo(() => {
    return BASE_CATEGORIES.map((cat) => {
      const count = products.filter((p) => {
        const pCat = p.category?.toLowerCase() || "";
        const pSub = p.subCategory?.toLowerCase() || "";
        const target = cat.categoryKey.toLowerCase();
        const rootTarget = target.replace(/s$/, "");
        return (
          pCat === target ||
          pCat.includes(rootTarget) ||
          pSub === target ||
          pSub.includes(rootTarget)
        );
      }).length;

      return {
        ...cat,
        count: count || 4, // Fallback default minimum
      };
    });
  }, [products]);

  return (
    <section className="categories">
      <div className="categories-heading">
        <p>EXPLORE OUR REALM</p>
        <h2>Shop By Category</h2>
        <p>
          Discover timeless elegance curated with artisanal precision and exquisite diamond craftsmanship.
        </p>
      </div>

      <div className="category-grid">
        {categoriesWithCounts.map((cat) => (
          <div className="category-card" key={cat.id}>
            <img
              src={cat.image}
              alt={cat.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/ring.png";
              }}
            />
            <div className="category-content">
              <span style={{ fontSize: "11px", letterSpacing: "1px", color: "#ffd700", fontWeight: "700" }}>
                {cat.count} DESIGNS AVAILABLE
              </span>
              <h3>{cat.title}</h3>
              <Link to={cat.path}>Explore Collection →</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
