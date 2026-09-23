import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const videoRef = useRef(null);

  // Set smooth motion video playback rate directly on front page hero load
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <section className="hero-section">
      {/* Background Video directly embedded on the front page */}
      <div className="hero-video-bg">
        <video
          ref={videoRef}
          className="hero-video-element"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/ring.png"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-silver-ring-41584-large.mp4"
            type="video/mp4"
          />
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-putting-on-a-ring-41586-large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero-overlay-dark" />
      </div>

      <div className="hero-container">
        {/* Left Content */}
        <div className="hero-text-content">
          <span className="hero-collection-tag">EXCLUSIVE COLLECTION 2026</span>

          <h1 className="hero-main-title">
            Timeless Luxury &<br />
            <span className="gold-gradient-text">Ethereal Grace</span>
          </h1>

          <p className="hero-description">
            Experience our handcrafted solitaire diamond rings and fine jewelry,
            designed to illuminate your elegance in every single movement.
          </p>

          <div className="hero-actions-row">
            <Link to="/shop" className="hero-btn primary-cta">
              Explore Collection
            </Link>
            <Link to="/collections" className="hero-btn secondary-cta">
              View Categories
            </Link>
          </div>
        </div>

        {/* Right Flying Floating Ring Feature Showcase */}
        <div className="hero-flying-ring-wrapper">
          <div className="ring-sparkle-glow" />
          <img
            src="/images/ring-removebg-preview.png"
            alt="Flying Solitaire Diamond Ring"
            className="flying-diamond-ring"
          />
          <span className="flying-sparkle s-1">✦</span>
          <span className="flying-sparkle s-2">✧</span>
          <span className="flying-sparkle s-3">✦</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;