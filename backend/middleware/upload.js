// Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - upload.js
// March 9, 2022
// Last Edited (Initials, Date, Edits):
//  (CPD, 4/13/2022, Increase max file upload size to 5MB)
//  (DAB, 10/15/2022, Changed over from S3 to Cloudinary image storage)
//** NOTE, STILL HAVE TO GET THE IMAGE TRANSITION FUNCTIONALITY WORKING TO HAVE ENOUGH SPACE */

require('dotenv').config();
const util = require("util");
const multer = require('multer');
// Cloudinary for image uploads
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Max upload file size 5MB
const maxSize = 5 * 1024 * 1024;

// Using multer storage cloudinary to pack up the image file and assign 
// params before saving to the cloud
let storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // DEBUG
        // console.log("Req in cloudinary storage", req);
        // console.log("File in cloudinary storage", file);
        return {
            // Setting the folder this image will be saved in based off 
            // type and user Id to prevent duplicates
            folder: `${req.body.type}/${req.body.id}/`
        }
    }
});

// Packing the file into multer and adding a max size limit
let uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).single("file");

// Compressing function into promise that can be used in the export to send the 
// multer request to save to the cloud
let uploadFileMiddleware = util.promisify(uploadFile);

// Exporting the cloud save promise function
module.exports = uploadFileMiddleware;