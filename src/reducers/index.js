// src/reducers/index.js
import { combineReducers } from 'redux';
import uploadReducer from './UploadReducer';  // Ensure the correct path

// Combine reducers into one rootReducer
const rootReducer = combineReducers({
  upload: uploadReducer,  // Define the state slice for upload
});

export default rootReducer;  // Export rootReducer as default
