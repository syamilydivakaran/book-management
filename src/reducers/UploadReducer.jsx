// src/reducers/UploadReducer.jsx
import { UPLOAD_IMAGE } from "../actions/Types";

const initialState = {
  image: null,
};

const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_IMAGE:
      return {
        ...state,
        image: action.payload,  // Save the uploaded image data
      };
    default:
      return state;
  }
};

export default uploadReducer;
