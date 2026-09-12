import React from "react";
import { Link } from "react-router-dom";
import "./Categories.css";

const CATEGORIES_DATA = [
  {
    id: "rings",
    title: "Solitaire Rings",
    image: "/images/ring.png",
    path: "/shop?category=Rings",
  },
  {
    id: "necklaces",
    title: "Diamond Necklaces",
    image: "/images/women.png",
    path: "/shop?category=Necklaces",
  },
  {
    id: "earrings",
    title: "Artisanal Earrings",
    image: "/images/earring.png",
    path: "/shop?category=Earrings",
  },
  {
    id: "bracelets",
    title: "Bangles & Bracelets",
    image: "/images/jewellery.png",
    path: "/shop?category=Bracelets",
  },
  {
    id: "accessories",
    title: "Royal Accessories",
    image: "/images/accessori.png",
    path: "/shop?category=Accessories",
  },
  {
    id: "men",
    title: "Men's Luxury Bands",
    image: "/images/men.png",
    path: "/shop?category=Men",
  },
  {
    id: "women",
    title: "Women's Couture",
    image: "/images/women.png",
    path: "/shop?category=Women",
  },
  {
    id: "jewellery",
    title: "Heritage Jewellery",
    image: "/images/jewellery.png",
    path: "/shop?category=Jewellery",
  },
];

function Categories() {
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
        {CATEGORIES_DATA.map((cat) => (
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
              <h3>{cat.title}</h3>
              <Link to={cat.path}>Explore Collection</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
