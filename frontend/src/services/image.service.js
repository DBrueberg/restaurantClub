// Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - image.service.js
// February 14, 2022
// Last Edited (Initials, Date, Edits):
// (CPD, 3/8/22, Created upload service route, removed unnecessary functions)

import http from "../http-common";

class ImageDataService {

  // Creates a new image by calling the upload image method on the images controller
  upload(file) {
    let formData = new FormData();
    formData.append("file", file);
    
    return http.post("/images/", formData, {
      // Set multipart headers
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
  }

  // Deletes a specific image
  delete(id) {
    return http.delete(`/images/${id}`);
  }
}

// Exporting the data service
export default new ImageDataService();
