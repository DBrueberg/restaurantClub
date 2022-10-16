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
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const checkEnv = require("../helperFunction/checkEnvironment")

// Cloudinary for image uploads
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

let storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        console.log("Req in cloudinary storage", req);
        console.log("File in cloudinary storage", file);
        return {
            folder: `${req.body.type}/${req.body.id}/`
        }
    }
})

// let uploadFileMiddleware = (req) => {
//     try {
//         let uploadFile = multer({
//         storage: storage,
//         limits: { fileSize: maxSize },
//         }).single("file");
//     console.log("In upload", req.body)
//     console.log("In upload file", file)
//     console.log("In upload file name", file.originalname)

//     let uploadFileMiddleware = cloudinary.uploader.upload(file)
//         .then(result => {
//             console.log(result)
//             return result;
//         }).catch(error => {
//             console.log(error)
//             return error;
//         });
// } catch (err) {
//     console.log(err);
// }
// }

// Check if we are on the prod environment
const isProd = checkEnv();

// Max upload file size 5MB
const maxSize = 5 * 1024 * 1024;

// OLD AWS CODE
// Set S3 endpoint to DigitalOcean Spaces
// const spacesEndpoint = new aws.Endpoint('nyc3.digitaloceanspaces.com');
// const s3 = new aws.S3({
//     accessKeyId: isProd ? process.env.S3_KEY : process.env.aws_access_key_id,
//     secretAccessKey: isProd ? process.env.S3_SECRET : process.env.aws_secret_access_key,
//     endpoint: spacesEndpoint
// });

// Digital Ocean spaces cloud storage using s3 api
// let storage = multerS3({
//     s3: s3,
//     bucket: 'restaurantclub',
//     acl: 'public-read',
//     key: function (req, file, cb) {
//         console.log(file);
//         console.log("req: ", req.body);

//         // Alter filename to be unique but preserve extension
//         const fileName = file.originalname.toLowerCase().split(' ').join('-');

//         // Create path based on type{users, restaurants, etc.} and id
//         const path = `${req.body.type}/${req.body.id}/`; 

//         cb(null, path + uuidv4() + '-' + fileName)
//     }
// })

let uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;
