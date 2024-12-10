import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Book from './components/Book';
import BookDetailsPage from "./components/BookDetailsPage";

function App() {
  return (
   /* <div>
      <Book/>
      
    </div>*/
    <Router>
      <Routes>
      <Route path="/" element={<Book />} />
      <Route path="/book-details" element={<BookDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
