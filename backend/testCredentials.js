
const cloudinaryPublicIDFromURL = require('./helperFunction/utilityHelper');
const deleteUserDirectory = require('./middleware/deleteUserDirectory');

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// console.log(cloudinary.config().cloud_name)
// console.log(cloudinary.config().api_key)
// console.log(cloudinary.config().api_secret)

// cloudinary.uploader.destroy("users/5/z7jtfdn2wbonjasj3naq.jpg", {invalidate: true})
//         .then(result => {
//             console.log("Image deleted successfully", result);
//             return 1;
//         })
//         .catch(error => {
//             console.log("Error deleting image", error);
//             return -2;
//         });

// const rawURL = "https://res.cloudinary.com/slen/image/upload/v1665928436/users/5/ervsh9eh78mlt5hxhg7m.jpg";
// const formattedURL = (rawURL) => {
//     const locationArray = rawURL.split('https://res.cloudinary.com/slen/image/upload/')
//     const endURL = locationArray[1];
//     const removeKeyURL = endURL.substring(endURL.indexOf("/") + 1) || endURL;
//     console.log(removeKeyURL);
//     const finalRoute = removeKeyURL.substring(0, removeKeyURL.lastIndexOf(".")) || removedKeyURL;
//     console.log(finalRoute);
//     const test = cloudinaryPublicIDFromURL(rawURL, 'https://res.cloudinary.com/slen/image/upload/');
//     console.log(test);
// }

// formattedURL(rawURL);

// cloudinary.api.delete_resources_by_prefix("users/5", {invalidate: true, resource_type: "video"})
//     .then(result => console.log(result))
//     .catch(error => console.log(error));

const results = async(directory) => {
    approved = await deleteUserDirectory(directory);
    console.log("results of deleteUserDirectory", approved);
};

results(6);


