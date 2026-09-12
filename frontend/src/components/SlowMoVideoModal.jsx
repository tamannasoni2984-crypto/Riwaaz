import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./SlowMoVideoModal.css";

export default function SlowMoVideoModal({ isOpen, onClose }) {
  const videoRef = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5); // Slow motion speed
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Apply slow-mo playback speed whenever video starts or speed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, isOpen]);

  if (!isOpen) return null;

  const toggleSpeed = () => {
    const newSpeed = playbackSpeed === 0.5 ? 1.0 : 0.5;
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="slowmo-modal-overlay">
      <div className="slowmo-modal-container">
        {/* Close Button */}
        <button 
          className="slowmo-close-btn" 
          onClick={onClose}
          aria-label="Close intro video"
        >
          ✕
        </button>

        {/* Video Background */}
        <div className="slowmo-video-wrapper">
          <video
            ref={videoRef}
            className="slowmo-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            poster="/images/ring.png"
          >
            {/* Primary & fallback slow-mo jewelry video sources */}
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-silver-ring-41584-large.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-woman-putting-on-a-ring-41586-large.mp4"
              type="video/mp4"
            />
            Your browser does not support video playback.
          </video>

          {/* Cinematic Overlay Gradient */}
          <div className="slowmo-gradient-overlay" />

          {/* Flying / Floating Ring Effect Layer */}
          <div className="flying-ring-container">
            <div className="ring-aura-glow" />
            <img
              src="/images/ring.png"
              alt="Flying Diamond Ring"
              className="flying-ring-img"
            />
            <div className="sparkle sparkle-1">✦</div>
            <div className="sparkle sparkle-2">✧</div>
            <div className="sparkle sparkle-3">✦</div>
          </div>

          {/* Text & Content Overlay */}
          <div className="slowmo-modal-content">
            <span className="slowmo-badge">
              {playbackSpeed === 0.5 ? "🎬 SLOW-MOTION EXPERIENCE (0.5x)" : "▶ REAL-TIME (1.0x)"}
            </span>
            <h1 className="slowmo-title">RIWAAZ LUXURY JEWELRY</h1>
            <p className="slowmo-subtitle">
              Elegance in Motion — Experience the magical floating solitaire diamond ring.
            </p>

            {/* Action Buttons */}
            <div className="slowmo-actions">
              <button 
                onClick={onClose} 
                className="slowmo-btn primary-btn"
              >
                Explore Collection
              </button>
              
              <button 
                onClick={toggleSpeed} 
                className="slowmo-btn speed-btn"
              >
                {playbackSpeed === 0.5 ? "⚡ Normal Speed (1.0x)" : "⏳ Slow-Motion (0.5x)"}
              </button>
            </div>
          </div>

          {/* Video Control Bar */}
          <div className="slowmo-controls-bar">
            <button onClick={togglePlay} className="ctrl-btn" title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            
            <button onClick={toggleSpeed} className="ctrl-btn speed-indicator">
              Speed: {playbackSpeed}x
            </button>

            <button onClick={toggleMute} className="ctrl-btn" title={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? "🔇 Muted" : "🔊 Sound On"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
