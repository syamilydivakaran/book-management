import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';
import { styled } from '@mui/system'; // Import styled
import { makeStyles } from '@mui/styles'; // If using Material-UI v5


const useStyles = makeStyles((theme) => ({
  input: {
    // Add any custom styles here
    width: '100%',
    padding: '10px',
  },
  imageChangeButton: {
    marginTop: '10px',
  },
  // You can define more classes as needed
}));

// Define styled components
const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  marginLeft: '30%'
}));

const Image = styled('div')(({ theme }) => ({
  position: 'relative',
  height: 300,
  width: 250,
  boxShadow: `0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)`,
  [theme.breakpoints.down('xs')]: {
    width: '100% !important',
    height: 100,
  },
  margin: '20px 2%'
}));

// Your component
function Book() {
  const [bookId, setBookId] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [bookCover, setBookCover] = useState('');
  const [isbn, setIsbn] = useState('');
  //const [originalIsbn, setOriginalIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [bookImage, setBookImage] = useState(null);
  const [rating, setRating] = useState('');
  const [isDeleted, setIsDeleted] = useState('N');
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
 // const totalPages = Math.ceil(books.length / itemsPerPage);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

 // const [bookData, setData] = useState([]);
  const [description, setDescription] = useState('');
  //const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredBooks, setFilteredBooks] = useState(books); 
  const isbnRef = useRef(null);
  const [previousIsbn, setPreviousIsbn] = useState(isbn);
  const [reviews, setReviews] = useState([]);
  //const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  //const [selectedFile, setSelectedFile] = useState(null);
  const [file, setFile] = useState(null);
//const [uploadedImagePreview, setUploadedImagePreview] = useState(null); // Preview of uploaded file



const [totalPages, setTotalPages] = useState(Math.ceil(books.length / itemsPerPage));

  
  const { image } = useSelector((state) => state.upload);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imageName, setImageName] = useState("");
  const classes = useStyles(); 
  const [imageFile, setImageFile] = useState(null);
  const [isIsbnImagePreviewVisible, setIsIsbnImagePreviewVisible] = useState(true); // Initially visible

  const dispatch = useDispatch();
  const uploadState = useSelector((state) => state.upload);

  const handleUpload = () => {
      dispatch({ type: "UPLOAD_SUCCESS", payload: "New Upload" });
  };

  
const handleUploadClick = (event) => {
  const file = event.target.files[0];
  if (file) {
    setImageFile(file);
    setImageName(file.name.split('.')[0]); // Custom name if needed
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Set the base64 preview for the image
      setBookImage(false); // Hide the isbn-image-preview div
    };
    reader.readAsDataURL(file); // Read the file as base64
  }
};


const uploadImageWithAdditionalData = async () => {
  if (!imageFile || !imageName) {
    console.error("No image file or name specified.");
    return;
  }

  const formData = new FormData();
  formData.append("imageFile", imageFile);
  formData.append("imageName", imageName);

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/bookMaster/image`, {
      method: 'POST',
      body: formData, // The browser sets the 'Content-Type' for FormData automatically
    });

    if (response.ok) {
      const contentType = response.headers.get("Content-Type");
      
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("File uploaded successfully (JSON):", data);
      } else {
        const textResponse = await response.text();
        console.log("File uploaded successfully (Text):", textResponse);
      }
    } else {
      console.error("File upload failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

// Set default publication date to today
const [publicationDate, setPublicationDate] = useState(() => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = today.getFullYear();
  return `${year}-${month}-${day}`; // Format: yyyy-mm-dd
});


const handleFileChange = (e) => {
  const selectedFile = e.target.files[0]; // Get the selected file
  setFile(selectedFile); // Update the state with the file
};



const validateIsbnAndSearchBook = async () => {
  if (!isbn.trim()) {
    alert("Kindly Add Book ISBN Number");
    return;
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );

    if (response.status !== 200 || !response.data.items) {
      throw new Error("Book Not Found");
    }

    const book = response.data.items[0].volumeInfo;

    // Populate data into state
    setBookImage(
      book.imageLinks?.thumbnail ||
        "https://book-management-syamily.netlify.app/book-thumbnail.jpg"
    );
    setTitle(book.title || "Unknown Title");
    setAuthor(book.authors?.join(", ") || "Unknown Author");
    //setPublicationDate(book.publishedDate || "Not Available");

 setPublicationDate(() => {
      const rawDate = book.publishedDate;

      // Check if the raw date is a valid full date
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();
        return `${year}-${month}-${day}`;
      }

      // Check if the raw date contains only a year (e.g., "2003")
      if (/^\d{4}$/.test(rawDate)) {
        return `${rawDate}-01-01`; // Default to January 1st of the given year
      }

      // Fallback if the raw date is invalid
      return "";
    });

    setDescription(book.description || "Not Available");
    // setGenre(book.categories?.join(", ") || "Not Available");

    // Add review fetching logic
    const reviews = response.data.items[0].searchInfo?.textSnippet
    ? [
        {
          reviewer: "Google Books User",
          snippet: response.data.items[0].searchInfo.textSnippet,
          rating: "N/A",
        },
      ]
    : [];
    setReviews(reviews);
    console.log("reviews----",reviews);
  } catch (error) {
    setBookImage(null); // Hide image if search fails
    alert(error.message);
  }
};


// Fetch books on component mount
useEffect(() => {
  async function fetchBooks() {
    try {
     // console.log(`Here : ${process.env.REACT_APP_API_URL}`)
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookMaster/list`);
      setBooks(response.data); 
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  }
  fetchBooks();
}, []);

const handleClick = async (book) => {
  console.log("Selected book: ", book); // Log the entire book object
  console.log("bookId: ", book.bookId); // Log the bookId specifically

  try {
    // Fetch book details from your local API
    const response = await fetch(`${process.env.REACT_APP_API_URL}/bookMaster/${book.bookId}`);
    const bookDetails = await response.json();
    console.log("Fetched Book Details: ", bookDetails); // Log the fetched details

    // Initialize the reviews array
    let reviews = [];

    // Check if the book has an ISBN
    if (bookDetails.isbn) {
      try {
        // Fetch additional data from the Google Books API using the ISBN
        const googleBooksResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${bookDetails.isbn}`
        );
        const googleBooksData = await googleBooksResponse.json();

        // Extract the cover image and description if available
        if (googleBooksData.items && googleBooksData.items.length > 0) {
          const googleBook = googleBooksData.items[0].volumeInfo;

          // Set book cover and description from Google Books API
          bookDetails.bookCover = 
            bookDetails.bookCover || 
            googleBook.imageLinks?.thumbnail || 
            "https://book-management-syamily.netlify.app/book-thumbnail.jpg";

            console.log("fetching the image path : ",bookDetails.bookCover);
            const bookDetailsss = await response.json();
            console.log("Fetched Book Details: ", bookDetailsss); // Log the fetched book details

            // Log the final image URL
            const imageUrl = `${process.env.REACT_APP_API_URL}${bookDetails.bookCover}`;
            console.log("Final Image URL: ", imageUrl);  // Log the final image URL

          bookDetails.description = googleBook.description || "No description available.";

          // Fetch reviews from New York Times API
          const reviewsResponse = await fetch(
            `https://api.nytimes.com/svc/books/v3/reviews.json?isbn13=${bookDetails.isbn}&api-key=NagDFy8KENyoIrZHD2bCA6fWQAhoE2G7`
          );
          const reviewsData = await reviewsResponse.json();

          // Check if reviews are available and extract them
          if (reviewsData.status === "OK" && reviewsData.results.length > 0) {
            reviews = reviewsData.results;
          } else {
            console.warn("No reviews found from New York Times API.");
          }
        } else {
          console.warn("No data found on Google Books API for this ISBN.");
        }
      } catch (googleBooksError) {
        console.error("Error fetching data from Google Books API:", googleBooksError);
      }

      // Now attach the reviews to the bookDetails object
      bookDetails.reviews = reviews;
    } else {
      console.warn("ISBN not available for this book.");
    }

    // Pass book details (including Google API data and reviews) to the next page
    navigate("/book-details", { state: { book: bookDetails } });
  } catch (error) {
    console.error("Error fetching book details:", error);
  }
};

async function editBook(book) {
  setBookId(book.bookId);
  setBookCode(book.bookCode);
  setTitle(book.title);
  setAuthor(book.author);

  // Format publication date as yyyy-mm-dd
  const date = new Date(book.publicationDate);
  setPublicationDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);

  setIsbn(book.isbn ? String(book.isbn) : "");
  setPreviousIsbn(book.isbn ? String(book.isbn) : "");
  setGenre(book.genre);
  setRating(book.rating);
  setIsDeleted(book.isDeleted);

  let imageUrl = null;

  // Check if the book has a locally uploaded bookCover
  if (book.bookCover) {
    imageUrl = `${process.env.REACT_APP_API_URL}${book.bookCover}`; // Prepend localhost and port to the relative path
  } else if (book.isbn) {
    // Try fetching the image from Google Books API if ISBN is available
    try {
      const googleBooksResponse = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`
      );
      const googleBooksData = googleBooksResponse.data;

      if (googleBooksData.items && googleBooksData.items.length > 0) {
        const googleBook = googleBooksData.items[0].volumeInfo;
        imageUrl = googleBook.imageLinks?.thumbnail || null; // Use Google Books thumbnail if available
      }
    } catch (error) {
      console.error("Error fetching data from Google Books API:", error);
    }
  }

  // Set the image preview or hide it if no image is available
  setBookImage(imageUrl); // Use this to manage the preview
  setBookCover(book.bookCover); // Retain the uploaded bookCover value for saving
}



// Validation function
const validateForm = () => {
  const newErrors = {};

  // Title validation
  if (!title.trim()) {
    newErrors.title = "Title is required.";
  } else if (title.length > 100) {
    newErrors.title = "Title must not exceed 100 characters.";
  }

  // Author validation
  if (!author.trim()) {
    newErrors.author = "Author is required.";
  } else if (author.length > 50) {
    newErrors.author = "Author must not exceed 50 characters.";
  }

  // Publication date validation
  if (!publicationDate) {
    newErrors.publicationDate = "Publication Date is required.";
  }

  if (!isbn || !String(isbn).trim()) {
    newErrors.isbn = "ISBN is required.";
    document.getElementById("isbn-input")?.focus(); // Focus the input if it exists
  } else if (!/^\d{13}$/.test(String(isbn).trim())) {
    newErrors.isbn = "ISBN must be exactly 13 digits long, and only numbers are allowed.";
    document.getElementById("isbn-input")?.focus(); // Focus the input if invalid
  }
  
 

  // Genre validation
  if (!genre || genre === "Select") {
    newErrors.genre = "Please select a genre.";
  }

  // Rating validation
  if (!rating.trim()) {
    newErrors.rating = "Rating is required.";
  } else if (isNaN(rating) || rating < 1 || rating > 5) {
    newErrors.rating = "Rating must be a number between 1 and 5.";
  }

  // Set errors in state and return validation status
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// CSS for error messages
const errorStyle = {
  color: "red",
  fontSize: "0.9em",
  marginTop: "0.25rem",
};

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/bookMaster/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("File uploaded successfully:", response.data.filePath);
    return response.data.filePath; // Return the file path from the response
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

// Helper function to reset the form fields
function resetForm() {
  setTitle('');
  setAuthor('');
  setPublicationDate(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  });
  setIsbn('');
  setGenre('');
  setRating('');
  setBookCover('');
  setDescription('');
  setBookImage(false);
  setIsDeleted('N');
  if (!bookId) {
    setBookId(null);
    setBookCode(null);
  }
}
async function save(event) {
  event.preventDefault();

  // Validate the form
  if (!validateForm()) {
    console.log("Please fix the errors in the form before submitting.");
    return;
  }

  // Check if the ISBN already exists (only for new books or if ISBN is modified)
  if (bookId == null || isbn !== previousIsbn) {
    if (/^\d{13}$/.test(isbn.trim())) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookMaster/check?isbn=${isbn}`);
        if (response.data) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            isbn: "This ISBN already exists",
          }));
          if (isbnRef.current) isbnRef.current.focus();
          return;
        }
      } catch (error) {
        console.error("Error checking ISBN:", error);
        alert("Failed to check ISBN. Please try again later.");
        return;
      }
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        isbn: "ISBN must be exactly 13 digits.",
      }));
      return;
    }
  }

  // Initialize the bookCover path as null
  let uploadedFilePath = null;

  // Check if an image file is selected for upload
  if (imageFile) {
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    formData.append("imageName", imageName);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/bookMaster/image`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          uploadedFilePath = data.filePath;
        } else {
          const textResponse = await response.text();
          uploadedFilePath = textResponse;
        }
        console.log("Image uploaded successfully:", uploadedFilePath);
      } else {
        console.error("Image upload failed:", response.status, await response.text());
        alert("Image upload failed. Please try again.");
        return; // Abort save if image upload fails
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed. Please try again.");
      return; // Abort save if image upload fails
    }
  }

  // Prepare book data
  const bookData = {
    title,
    author,
    publicationDate,
    isbn,
    genre,
    rating,
    isDeleted,
    bookCover: uploadedFilePath || bookCover, // Add file path if uploaded, otherwise null
  };

  // Include bookId and bookCode only if they exist
  if (bookId) bookData.bookId = bookId;
  if (bookCode) bookData.bookCode = bookCode;

  console.log("Submitting Data:", bookData);

  try {
    const url = `${process.env.REACT_APP_API_URL}/bookMaster/`;
    await axios.post(url, bookData);

    // Display success message
    const successMessage = bookId ? "Book updated successfully!" : "Successfully Registered!";
    alert(successMessage);

    // Reset form fields after save
    resetFormFields();
    setShowModal(false);

    // Fetch the updated list of books
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookMaster/list`);
    setBooks(response.data);
  } catch (err) {
    console.error("Error during book save operation:", err);
    alert("Book save operation failed");
  }
}

// Utility function to reset form fields
function resetFormFields() {
  setTitle('');
  setAuthor('');
  setPublicationDate(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  });
  setIsbn('');
  setBookCode('');
  setBookId('');
  setGenre('');
  setRating('');
  setBookCover('');
  setDescription('');
  setBookImage(false);
  setIsDeleted('N');
  setImagePreview(null);

  // Reset bookId and bookCode only for new books
  if (!bookId) {
    setBookId(null);
    setBookCode(null);
  }
}



// Delete a book
async function DeleteBook(bookId) {
  try {
    // Delete the book
    await axios.delete(`${process.env.REACT_APP_API_URL}/bookMaster/delete/${bookId}`);
    alert("Book deleted successfully");
    // Fetch the updated list of books after deletion
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/bookMaster/list`);
    setBooks(response.data); // Update the state with the new list of books
  } catch (err) {
    console.error('Error during book deletion:', err);
    alert('Book Deletion Failed');
  }
}


  const sortedBooks = React.useMemo(() => {
    // Apply filtering first
    let filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Apply sorting logic
    if (sortConfig.key) {
      filteredBooks.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
  
        if (typeof aValue === "string" && typeof bValue === "string") {
          // String comparison
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
  
        // Numeric or other type comparison
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
  
    return filteredBooks;
  }, [books, sortConfig, searchTerm]);
  
  

  // Sort toggle handler
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Render sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? "↑" : "↓";
    }
    return "⇅";
  };
/*
const searchWithTitle = (searchTerm) => {
  setSearchTerm(searchTerm); // Update search term state
  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  // Filter books by title containing the search term (case-insensitive)
  const filteredResults = books.filter((book) =>
    book.title.toLowerCase().includes(lowerCaseSearchTerm)
  );

  setFilteredBooks(filteredResults); // Update filtered books state
};
*/

useEffect(() => {
  setFilteredBooks(books);
  setTotalPages(Math.ceil(books.length / itemsPerPage));
}, [books]);

const searchWithTitle = (searchTerm) => {
  setSearchTerm(searchTerm);
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const filteredResults = books.filter((book) =>
    book.title.toLowerCase().includes(lowerCaseSearchTerm)
  );

  setFilteredBooks(filteredResults);
  setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
  setCurrentPage(1);
};

const displayedBooks = filteredBooks.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  return (
    <>

    
    <div  style={{ padding: '50px', backgroundColor: 'rgb(89 74 60 / 60%)' }}>
      
    <h1 style={{ marginBottom: '10px' }}>WELCOME</h1>
<h3>the books are waiting for you ... </h3>
<div className="header-container d-flex justify-content-between align-items-center my-3 px-3 form-row">
  {/* Centering "Add New Book" Button */}
  <div className="d-flex justify-content-center form-group" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
    <button className="btn btn-success" onClick={() => setShowModal(true)}>
      ADD NEW BOOK
    </button>
  </div>

  {/* Search Bar on the Right */}
  <div className="search-container d-flex align-items-center" style={{ position: 'absolute', right: '20px' }}>
    <input
      type="text"
      className="form-control"
      placeholder="Search title..."
      onChange={(e) => searchWithTitle(e.target.value)}
      style={{
        width: '285px',
        padding: '8px 35px 8px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    />
    <i
      className="fa fa-search"
      style={{
        position: 'absolute',
        right: '10px',
        transform: 'translateY(-50%)',
        marginBottom: '-15px',
        cursor: 'pointer',
        color: '#888',
      }}
      onClick={() => {
        const inputElement = document.querySelector('.form-control');
        searchWithTitle(inputElement.value);
      }}
    ></i>
  </div>
</div>

{/* Table to display books */}
 <div className="table-container">
  
      <table className="table" align="center">
        <thead>
          <tr>
            <th scope="col" onClick={() => handleSort("bookCode")}>
              Book ID {getSortIcon("bookCode")}
            </th>
            <th scope="col" onClick={() => handleSort("title")}>
              Title {getSortIcon("title")}
            </th>
            <th scope="col" onClick={() => handleSort("author")}>
              Author {getSortIcon("author")}
            </th>
            <th scope="col" onClick={() => handleSort("publicationDate")}>
              Publication Date {getSortIcon("publicationDate")}
            </th>
            <th scope="col" onClick={() => handleSort("isbn")}>
              ISBN {getSortIcon("isbn")}
            </th>
            <th scope="col" onClick={() => handleSort("genre")}>
              Genre {getSortIcon("genre")}
            </th>
            <th scope="col" onClick={() => handleSort("rating")}>
              Rating {getSortIcon("rating")}
            </th>
            <th scope="col">Actions</th>
          </tr>
        </thead>


<tbody>
  {sortedBooks
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map((book) => (
      <tr key={book.bookId}>
        <td>{book.bookCode}</td>
        <td>{book.title}</td>
        <td>{book.author}</td>
        <td>
          {(() => {
            const date = new Date(book.publicationDate);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          })()}
        </td>
        <td>{book.isbn}</td>
        <td>{book.genre}</td>
        <td>{book.rating}</td>
        <td>
          <div className="action-buttons">
            <button
              type="button"
              className="icon-button update-btn"
              title="Edit"
              onClick={() => {
                editBook(book);
                setShowModal(true);
              }}
            >
              <i className="fas fa-pen"></i>
            </button>
           <button
              type="button"
              className="icon-button view-btn"
              title="View"
             /* onClick={() => {
                setSelectedBook(book);
                setShowViewModal(true);
              }}*/
                onClick={() => handleClick(book)} 
            >
              <i className="fas fa-eye"></i>
            </button>
            
             {/* View button now redirects to BookDetailsPage */}
            
           
            <button
              type="button"
              className="icon-button delete-btn"
              title="Delete"
              onClick={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to delete this book?"
                );
                if (confirmed) {
                  DeleteBook(book.bookId); // Call the delete function if user confirms
                }
              }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    ))}
</tbody>


      </table>
    </div>


<div className="pagination-container d-flex justify-content-center mt-3">
  <button
    className="btn pagination-button btn-outline-secondary"
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
  >
    Previous
  </button>
  {Array.from({ length: totalPages }, (_, index) => (
    <button
      key={index + 1}
      className={`btn pagination-button mx-1 ${currentPage === index + 1 ? 'btn-custom-selected' : 'btn-outline-secondary'}`}
      onClick={() => setCurrentPage(index + 1)}
    >
      {index + 1}
    </button>
  ))}
  <button
    className="btn pagination-button btn-outline-secondary"
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>



{showModal && (
  <div
    className="modal fade show"
    style={{ display: 'block', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    tabIndex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
   // aria-hidden="true"
   aria-hidden={!showModal ? "true" : "false"} 
  >
    <div className="modal-dialog" role="document">
      <div className="modal-content book-registration">
        <div className="modal-header" style={{ backgroundColor: '#1a7a1cdb', color: 'white' }}>
          <h5 className="modal-title" id="exampleModalLabel">Book Registration</h5>
          <button
  type="button"
  className="close"
  onClick={() => {
    setShowModal(false); // Close the modal
    // Reset all form states
    setTitle('');
    setAuthor('');
    setBookCover('');
    setPublicationDate(() => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const year = today.getFullYear();
      return `${year}-${month}-${day}`; // Format: yyyy-mm-dd
    });
    setIsbn('');
    setGenre('');
    setImagePreview(null);
    setBookImage(null);
    setDescription('');
    setRating('');
    setErrors({});
  }}
  aria-label="Close"
>
  Close
</button>
 
        </div>
        <div className="modal-body">
        <form style={{ height: '325px' }} onSubmit={save}>
         {/* Image Container */}
         <div id="image-container" style={{ display: bookImage ? "block" : "none", textAlign: "center" }}>


{bookImage ? (
  <div className="form-group isbn-image-preview">
    <img
      src={bookImage} // Use the prioritized image URL
      alt="Book Thumbnail"
      style={{ maxWidth: "200px", maxHeight: "200px", margin: "10px auto" }}
    />
  </div>
) : null} 



</div>


  {/* Row 1: Title and isbn */}
  <div className="form-row">
  <div className="form-group">
  <label>ISBN:</label>
  <div className="input-icon-container">
    <input
      type="text"
      className="form-control"
      value={isbn}
      ref={isbnRef}
      placeholder="search with isbn number"
      onChange={(e) => {  
        const value = e.target.value;
        setIsbn(value);
        setErrors((prev) => ({
          ...prev,
          isbn: /^\d{13}$/.test(value) ? undefined : "ISBN must be exactly 13 digits.",
        }));
      }}
    />
    <i
      className="fa fa-search search-icon"
      onClick={validateIsbnAndSearchBook}
      style={{ cursor: 'pointer' }}
    ></i>
  </div>
  {errors.isbn && <div style={errorStyle}>{errors.isbn}</div>}
</div>

    <div className="form-group">
      <label>Title:</label>
      <input
        type="text"
        className="form-control"
        value={title}
        placeholder="Enter the title"
        onChange={(e) => {
          const value = e.target.value;
          setTitle(value);
          setErrors((prev) => ({
            ...prev,
            title: value.trim() && value.length <= 100 ? undefined : "Title is required and must be at most 100 characters.",
          }));
        }}
      />
      {errors.title && <div style={errorStyle}>{errors.title}</div>}
    </div>
    
  </div>

  {/* Row 2: Publication Date and ISBN */}
  <div className="form-row">
  <div className="form-group">
      <label>Author:</label>
      <input
        type="text"
        className="form-control"
        value={author}
        placeholder="Enter the Author"
        onChange={(e) => {
          const value = e.target.value;
          setAuthor(value);
          setErrors((prev) => ({
            ...prev,
            author: value.trim() && value.length <= 50 ? undefined : "Author is required and must be at most 50 characters.",
          }));
        }}
      />
      {errors.author && <div style={errorStyle}>{errors.author}</div>}
    </div>

    <div className="form-group">
      <label>Publication Date:</label>
      <input
        type="date"
        className="form-control"
        value={publicationDate || ''}
        onChange={(e) => {
          const value = e.target.value;
          setPublicationDate(value);
          setErrors((prev) => ({
            ...prev,
            publicationDate: value ? undefined : "Publication date is required.",
          }));
        }}
      />
      {errors.publicationDate && <div style={errorStyle}>{errors.publicationDate}</div>}
    </div>
   

  </div>

 {/* Row 3: Genre, Rating, and Description */}
<div className="form-row">
  <div className="form-group">
    <label>Genre:</label>
    <select
      className="form-control"
      value={genre}
      onChange={(e) => {
        const value = e.target.value;
        setGenre(value);
        setErrors((prev) => ({
          ...prev,
          genre: value ? undefined : "Please select a genre.",
        }));
      }}
    >
      <option value="">Select Genre</option>
      <option value="Fiction">Fiction</option>
      <option value="Mystery">Mystery</option>
      <option value="Thriller">Thriller</option>
      <option value="Romance">Romance</option>
      <option value="Historical">Historical</option>
      <option value="Fantasy">Fantasy</option>
      <option value="Biography">Biography</option>
    </select>
    {errors.genre && <div style={errorStyle}>{errors.genre}</div>}
  </div>
  <div className="form-group">
  <label>Rating:</label>
  <input
    type="text"
    className="form-control"
    value={rating}
    placeholder="Enter the rating"
    onChange={(e) => {
      const value = e.target.value;

      // Update the rating value regardless of input
      setRating(value);

      // Validate the input after each change
      if (value !== '' && !/^([1-4](\.\d{1,2})?|5(\.0{1,2})?)$/.test(value)) {
        // If the value is not a number between 1 and 5 (including decimals)
        setErrors((prev) => ({
          ...prev,
          rating: "Rating must be a number between 1 and 5, including decimals (e.g., 2.3).",
        }));
      } else {
        // Clear the error if the input is valid
        setErrors((prev) => ({
          ...prev,
          rating: undefined,
        }));
      }
    }}
  />
  {errors.rating && <div style={errorStyle}>{errors.rating}</div>}
</div>

</div>
<div className="form-row">
<div className="form-group">
  <label htmlFor="upload-profile-image" className="image_lbl">
    Upload Book Cover:
  </label>
  <input
    type="file"
    className="form-control clear uploadFile"
    id="upload-profile-image"
    name="upload-profile-image"
    accept="image/*"
    onChange={handleUploadClick}  // Your file upload logic
  />
</div>

  {/* Image Preview Section */}

  {imagePreview && (
    <div className="form-group image-preview">
      <img
        src={imagePreview}
        alt="Book Cover Preview"
      />
    </div>
  )}
   
</div>


  {/* Save button */}
  <div className="button-container">
    <button type="submit" className="btn btn-primary custom-button-save">
      Save
    </button>
  </div>
</form>

        </div>
      </div>
    </div>
  </div>
)}

 {/* modal for view books */}
{showViewModal && selectedBook && (
  <div
    className="modal fade show"
    style={{ display: "block", position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    tabIndex="-1"
    role="dialog"
    aria-labelledby="viewModalLabel"
    //aria-hidden="true"
    aria-hidden={!showModal ? "true" : "false"} 
  >
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header" style={{ backgroundColor: "#1a7a1cdb", color: "white" }}>
          <h5 className="modal-title" id="viewModalLabel">
            Book Details
          </h5>
          <button
            type="button"
            className="close"
            onClick={() => setShowViewModal(false)}
            aria-label="Close"
          >
            <span aria-hidden={!showModal ? "true" : "false"} >&times;</span>
          </button>
        </div>
        <div className="modal-body">
  <div className="row mb-2">
    <div className="col-4"><strong>Title:</strong></div>
    <div className="col-8">{selectedBook.title}</div>
  </div>
  <div className="row mb-2">
    <div className="col-4"><strong>Author:</strong></div>
    <div className="col-8">{selectedBook.author}</div>
  </div>
  <div className="row mb-2">
    <div className="col-4"><strong>Publication Date:</strong></div>
    <div className="col-8">
      {(() => {
        const date = new Date(selectedBook.publicationDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      })()}
    </div>
  </div>
  <div className="row mb-2">
    <div className="col-4"><strong>ISBN:</strong></div>
    <div className="col-8">{selectedBook.isbn}</div>
  </div>
  <div className="row mb-2">
    <div className="col-4"><strong>Genre:</strong></div>
    <div className="col-8">{selectedBook.genre}</div>
  </div>
  <div className="row mb-2">
    <div className="col-4"><strong>Rating:</strong></div>
    <div className="col-8">{selectedBook.rating}</div>
  </div>
</div>

        <div className="modal-footer fixed-footer">
          <button
            type="button"
            className="btn btn-secondary viewCloseButton"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
    </>
  );
}

export default Book;
