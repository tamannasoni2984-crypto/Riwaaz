import { useRef, useState } from "react";
import ProductCard from "./Productcard.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import "./MovingProducts.css";

function MovingProducts() {
    const trackRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const { products } = useProducts();

    // Triple products array for continuous infinite marquee loop
    const displayProducts = [...products, ...products, ...products];

    const scrollLeft = () => {
        if (trackRef.current) {
            trackRef.current.scrollBy({ left: -260, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (trackRef.current) {
            trackRef.current.scrollBy({ left: 260, behavior: "smooth" });
        }
    };

    return (
        <section className="moving-products-section">
            <div className="moving-heading-container">
                <span className="moving-subtitle">LIVE IN MOTION</span>
                <h2 className="moving-title">Featured Products In Motion</h2>
                <p className="moving-desc">
                    Explore our signature luxury jewelry moving continuously live on the front page.
                </p>
            </div>

            <div className="slider-controls-row">
                <div className="arrows-group">
                    <button className="slider-arrow-btn" onClick={scrollLeft} aria-label="Previous products">
                        ❮
                    </button>
                    <button className="slider-arrow-btn" onClick={scrollRight} aria-label="Next products">
                        ❯
                    </button>
                </div>
            </div>

            <div
                className="moving-track-container"
                ref={trackRef}
            >
                <div className={`moving-track ${isPaused ? "paused" : ""}`}>
                    {displayProducts.map((product, idx) => (
                        <div className="moving-card-wrapper" key={`${product._id || product.id}-${idx}`}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default MovingProducts;
