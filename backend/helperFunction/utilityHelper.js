// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - utilityHelper.js
// October 16, 2022
// Last Edited (Initials, Date, Edits):


// Function used to remove the file type extension from a path string
const removeTypeExt = (oldURL) => {
    // Stripping out the extension from the end of the string
    const newURL = oldURL.substring(0, oldURL.lastIndexOf(".")) || oldURL;

    // Returning the string without an extension
    return newURL;
}


// Function used to convert a full URL into just the cloudinary public ID 
// that is used to identify the image in cloudinary API calls. It is passed the 
// full URL as well as the static part of the URL so it can be removed.
const cloudinaryPublicIDFromURL = (fullURL, staticURL) => {
    // Removing the static part of the URL
    const URLArray = fullURL.split(staticURL);
    // Assigning the path and version part of URL to the file key
    const fileKey = URLArray[1];
    // Removing the image version from the file key
    const versionlessFileKey = fileKey.substring(fileKey.indexOf("/") + 1) || fileKey;
    // Last, the extension will be removed to provide the public ID of the image
    const publicID = removeTypeExt(versionlessFileKey);

    // Returning the public ID tot he caller
    return publicID;
}


// Exporting the desired modules
module.exports = cloudinaryPublicIDFromURL;