// Initially Created by: Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - server.js
// February 14, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 2/20/2022, Added routes for image, rating, review, and reviewImage)
//  (DAB, 2/27/2022, Added message route)
//  (DAB, 04/13/2025, Chaning env variables for Railway deployment)

const express = require("express");
const cors = require("cors");
const testData = require('./data/TestData');
const app = express();
const checkEnv = require("./helperFunction/checkEnvironment")

// Check if we are on the prod environment
const isProd = checkEnv();

// CORS related settings
var corsOptions = {
  // origin: "http://localhost:3000"
  // origin: "https://restaurant-club.netlify.app"
  origin: isProd ? process.env.MYSQL_URL : "http://localhost:3000"
};

app.use(cors(corsOptions));
// Parse requests of content-type - application/json
app.use(express.json());
// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Database configuration
const db = require("./models");

// Always Test DB connection
const testConnection = (async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

/// Create tables from sequelize models if they do not exist
db.sequelize.sync()

// USEFUL DEVELOPMENT CODE -- Comment out the above db.sequelize.sync() to use the code below
// Because the database quickly fills up with junk during testing we drop and re-sync on express start
// db.sequelize.sync({ force: true })
// .then(() => {
//   console.log("Database has been dropped and re-synced.");
//   console.log(`Server is running on port ${PORT}.`);
// })
// .then(() => {
//   // Loading test data into database
//    testData.loadTestData();
// });

// // Set welcome message for application
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Restaurant Club backend application." });
});

// Set app routes
require("./routes/user.routes")(app);
require("./routes/restaurant.routes")(app);
require("./routes/authentication.routes")(app);
require("./routes/address.routes")(app);
require("./routes/image.routes")(app);
require("./routes/rating.routes")(app);
require("./routes/review.routes")(app);
require("./routes/reviewImage.routes")(app);
require("./routes/message.routes")(app);
require("./routes/friend.routes")(app);

// Use env port if it is configured (it is on prod), dev port 5000 otherwise
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log(`server is listening at http://${host}:${port}`);
});
