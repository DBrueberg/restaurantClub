// Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - delete.js
// March 11, 2022
// Last Edited (Initials, Date, Edits):

const aws = require('aws-sdk');
const checkEnv = require("../helperFunction/checkEnvironment")

// Cloudinary for image uploads
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');

// let storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: async (req, file) => {
//         console.log("Req in cloudinary storage", req);
//         console.log("File in cloudinary storage", file);
//         return {
//             folder: `${req.body.type}/${req.body.id}/`
//         }
//     }
// })

// Check if we are on the prod environment
const isProd = checkEnv();

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new aws.S3({
    accessKeyId: isProd ? process.env.S3_KEY : process.env.aws_access_key_id,
    secretAccessKey: isProd ? process.env.S3_SECRET : process.env.aws_secret_access_key,
    endpoint: spacesEndpoint
});

const deleteFile = async (location) => {
    // Split the file key from our full URL path
    const data = location.split('https://restaurantclub.nyc3.digitaloceanspaces.com/')
    const key = data[1];

    const params = {
        Bucket: 'restaurantclub',
        Key: key
    };

    // S3 does not return if a file was deleted so we have to check it exists first
    try {
        await s3.headObject(params).promise()
        console.log("File Found in S3")

        // If the file was found we will try to delete it
        try {
            await s3.deleteObject(params).promise()
            console.log("file deleted Successfully")
            return 1;
        }
        // Something went wrong trying to delete the file
        catch (err) {
            console.log("ERROR in file Deleting : " + JSON.stringify(err))
            return -2;
        }
        // Else the file was not found
    } catch (err) {
        console.log("File not Found ERROR : " + err.code)
        return -1;
    }
};

module.exports = deleteFile;