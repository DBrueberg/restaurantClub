// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - deleteRestaurantDirectory.js
// March 13, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 10/16/2022, Updated code from AWS to Cloudinary)

// Cloudinary for deleting images
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// The deleteRestaurantDirectory async function will accept a directory
// (only current directory is main) and delete all the images and 
// videos uploaded from that director. 
// ******* THIS FUNCTION WILL MOST LIKELY DELETE ALL RESTAURANT IMAGES *******
const deleteRestaurantDirectory = async(directory) => {
    // Appending users to get the full directory path
    const fullDirectoryPath = `restaurants/${directory}`;

    // DEBUG *****
    // console.log("FULL DIRECTORY PATH: ", fullDirectoryPath);

    // Deleting any videos in the directory
    await cloudinary.api.delete_resources_by_prefix(fullDirectoryPath, {
        invalidate: true, resource_type: "video"
    })
        .then(result => console.log(result))
        .catch(error => console.log(error));

    // Deleting any images in the directory and returning the result to the caller
    return await cloudinary.api.delete_resources_by_prefix(fullDirectoryPath, {
        invalidate: true
    })
        .then(result => {
            // If the delete was successful 1 is returned
            console.log("Directory successfully deleted", result)
            return 1;
        })
        .catch(error => {
            // If there was an error, that error and -2 is returned
            console.log("Error deleting directory", error)
            return -2;
        });
}

module.exports = deleteRestaurantDirectory;