// Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - delete.js
// March 11, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 10/16/2022, Updated the image delete to use Cloudinary VS S3)

// Cloudinary for deleting images
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinaryPublicIDFromURL = require('../helperFunction/utilityHelper');

// Deletes one file stored in Cloudinary when the full URL location is passed as a parameter
const deleteFile = async(location) => {
    // Cloudinary uses the public ID to delete images so that will be pulled from the full URL
    const publicID = cloudinaryPublicIDFromURL(location, 'https://res.cloudinary.com/slen/image/upload/');
    
    // Using the Cloudinary destory method to delete the image if it exists
    return await cloudinary.uploader.destroy(publicID, {invalidate: true})
        .then(result => {
            // Log the basic result and send the success number back to the caller
            console.log("Image deleted successfully", result);
            return 1;
        })
        .catch(error => {
            // Log the error and send the failure message back to the caller
            console.log("Error deleting image", error);
            return -2;
        });
}

// Exporting the deleteFile method so images can be deleted
module.exports = deleteFile;