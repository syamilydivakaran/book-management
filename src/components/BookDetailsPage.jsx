import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../BookStyle.css';

const BookDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { book } = location.state || {};

  if (!book) {
    return <p>No book details available. Please go back and try again.</p>;
  }

  return (
    <>
    <div className="container">
      <h2>{book.title}</h2>
      {book.bookCover && (
  <div>
    <img
      src={book.bookCover}
      alt={book.title}
      style={{ maxWidth: "200px", maxHeight: "200px" }}
    />
  </div>
)}

     
      <p>
        <strong>Author:</strong> {book.author}
      </p>
      <p>
        <strong>Publication Date:</strong> {
          (() => {
            const date = new Date(book.publicationDate);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          })()
        }
      </p>
      <p>
        <strong>Genre:</strong> {book.genre}
      </p>
      <p>
        <strong>Description:</strong> {book.description || "No description available"}
      </p>
    
        <button
          type="button"
          className="btn btn-primary gotoBookList"
          onClick={() => navigate(-1)}
        >
          Back to Book List
        </button>
    
    </div>
    </>
  );
};

export default BookDetailsPage;
