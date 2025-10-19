import React from "react";
import "./BookZone.css";
import BookCard from "./BookCard";
import BookSuggestion from "./BookSuggestion";
import {books} from "./data/books";

const BookZone = () => {
  return (
    <div className="book-zone">
      {/* Header Section */}
      <header className="book-header">
        <h1>Book Zone</h1>
        <p className="subheading">
          A calm space to explore self-help, spiritual, and mental wellness books. Let your mind heal and grow 
        </p>
      </header>

      {/* Suggestion Area */}
      <section className="suggestion-section">
        <BookSuggestion />
      </section>

      {/* Book Cards */}
      <section className="book-section">
        <h2 className="book-section-title">Explore Our Collection</h2>
        <div className="book-card-grid">
          {books.map((book, index) => (
            <BookCard key={index} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default BookZone;
