import Hero from "../components/Hero.jsx";
import MovingProducts from "../components/MovingProducts.jsx";
import Categories from "../components/Categories.jsx";
import FeaturedProducts from "../components/FeaturedProduct.jsx";

function Home() {
  return (
    <main className="home-page">
      {/* Front Page Hero with Video Background & Levitating Flying Ring */}
      <Hero />
      
      {/* Moving Products Slider right from starting */}
      <MovingProducts />

      {/* Shop Categories */}
      <Categories />

      {/* Featured Collection Grid */}
      <FeaturedProducts />
    </main>
  );
}

export default Home;