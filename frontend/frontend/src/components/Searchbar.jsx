import React from "react";

function Searchbar({ searchTerm, onSearchChange, onClear }) {
  return (
    <div className="shop-search-box">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search solitaire diamond rings, necklaces, jewellery..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button
          className="clear-search-btn"
          onClick={onClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Searchbar;
