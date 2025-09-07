import React from 'react';
import PropTypes from 'prop-types';
import './SearchBar.css';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  // Function to clear the input
  const handleClear = () => {
    // We create a synthetic event object to pass to onSearchChange
    onSearchChange({ target: { value: '' } });
  };

  return (
    // Add a class to the container when there is text
    <div className={`search-container ${searchTerm ? 'has-text' : ''}`}>
      <input
        type="text"
        placeholder="Search by name or degree..."
        className="search-bar"
        value={searchTerm}
        onChange={onSearchChange}
      />
      {/* Show the clear button only when there is text */}
      {searchTerm && (
        <button type="button" className="clear-button" onClick={handleClear} aria-label="Clear search">
          &times;
        </button>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default SearchBar;