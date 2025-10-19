import React, { useState } from "react";
import "./BookSuggestion.css";
import { triggers } from "./data/suggestionTriggers";
import { books } from "./data/books";
import BookCard from "./BookCard";

const BookSuggestion = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [suggestedBooks, setSuggestedBooks] = useState([]);

  const handleSuggestion = () => {
    const message = `${selectedMood} ${userMessage}`.toLowerCase();

    const match = triggers.find((trigger) =>
      trigger.keywords.some((keyword) => message.includes(keyword))
    );

    if (match) {
      const matchedBooks = books.filter((book) =>
        match.bookTitles.includes(book.title)
      );
      setSuggestedBooks(matchedBooks);
    } else {
      setSuggestedBooks([]);
    }
  };

  return (
    <div className="book-suggestion">
      <h2 className="suggestion-title">Not sure what to read?</h2>
      <p className="suggestion-subtitle">
        Tell us how you feel, and we’ll suggest a book to match your vibe.
      </p>

      <div className="input-group">
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="mood-dropdown"
        >
          <option value="">How do you feel today?</option>
          <option value="tired">😴 Tired</option>
          <option value="anxious">😟 Anxious</option>
          <option value="overwhelmed">😓 Overwhelmed</option>
          <option value="lost">😔 Lost</option>
          <option value="motivated">💪 Motivated</option>
          <option value="grateful">🙏 Grateful</option>
        </select>

        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Or type your feelings here..."
          className="message-input"
        />

        <button className="suggest-btn" onClick={handleSuggestion}>
          Suggest Books
        </button>
      </div>

      {suggestedBooks.length > 0 && (
        <div>
          <p className="quote">
            “It’s okay to feel overwhelmed. Try reading one of these to find calm and clarity.”
          </p>
          <div className="suggested-books">
            {suggestedBooks.map((book, index) => (
              <BookCard key={index} book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSuggestion;
