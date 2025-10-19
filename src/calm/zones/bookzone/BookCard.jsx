import React, { useEffect, useState } from "react";
import { fetchBookCover } from "./data/fetchBookCover"; // 👈 Correct path
import "./BookCard.css";

const BookCard = ({ book }) => {
  const [cover, setCover] = useState("");

  useEffect(() => {
    const loadCover = async () => {
      const fetched = await fetchBookCover(book.title);
      setCover(fetched);
    };
    loadCover();
  }, [book.title]);

  return (
    <div className="book-card">
      {cover && <img src={cover} alt={book.title} className="book-cover" />}
      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="author">by {book.author}</p>
        <p className="description">{book.description}</p>
        <a
          href={book.downloadLink}
          download
          className="download-btn"
        >
          Download
        </a>
      </div>
    </div>
  );
};

export default BookCard;
