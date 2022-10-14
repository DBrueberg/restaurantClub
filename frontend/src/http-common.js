// Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - http-common.js
// February 14, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 10/13/2022, Changed backend to new Railway location)

import axios from "axios";
import checkEnv from "./helperFunction/checkEnvironment";

// Check if we are on the prod environment
const isProd = checkEnv();

export default axios.create({
  // baseURL: "http://localhost:5000",
  // baseURL: "https://restaurant-club-backend.herokuapp.com",
  baseURL: isProd ?
    "https://restaurantclub-production.up.railway.app/" :
    "http://localhost:5000",
  headers: {
    "Content-type": "application/json"
  }
});
