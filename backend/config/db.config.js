// Initially Created by: Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - db.config.js
// February 14, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 04/13/2025, Chaning env variables for Railway deployment)

const fs = require('fs');
const path = require("path");
const checkEnv = require("../helperFunction/checkEnvironment")

// Check if we are on the prod environment
const isProd = checkEnv();

module.exports = {
  HOST: isProd ? process.env.MYSQLHOST : "localhost",
  PORT: isProd ? process.env.MYSQLPORT : 3306,
  USER: isProd ? process.env.MYSQLUSER : "root",
  PASSWORD: isProd ? process.env.MYSQLPASSWORD : "password",
  DB: isProd ? process.env.MYSQL_DATABASE : "restaurantDB",
  ssl: {
    ca: isProd ? process.env.CA_CERT : "",
    rejectUnauthorized: true
  },
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
