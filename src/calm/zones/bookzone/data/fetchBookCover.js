// src/components/utils/fetchBookCover.js

export const fetchBookCover = (title) => {
    const encodedTitle = encodeURIComponent(title);
    return `https://covers.openlibrary.org/b/title/${encodedTitle}-L.jpg`;
  };
  