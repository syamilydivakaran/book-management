// src/actions/UploadActions.jsx
import { UPLOAD_IMAGE } from './Types';

// You can keep this function as is for async handling (if necessary):
export const uploadImageWithAdditionalData = (imageData) => {
  return (dispatch) => {
    setTimeout(() => {
      dispatch({
        type: UPLOAD_IMAGE,
        payload: imageData,
      });
    }, 1000);
  };
};
