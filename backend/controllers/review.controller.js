// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - review.controller.js
// February 20, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 2/26/2022, Completed find all and find by pk operations)
//  (DAB, 2/27/2022, Added in the enhanced controllers such as 
//  offset/limit findAll as well as search by restaurant name and 
//  author Id)
//  (DAB, 3/5/2022, findAllOffsetLimit changed to be ordered by history not 
//  restaurant name. Also beautified the format)
//  (DAB, 3/5/2022, findByRestaurantAuthorIdOffsetLimit added to allow for 
//  retrieval of reviews using both the author and restaurant Ids)
//  (DAB, 4/12/2022, Error Handling Audit - Passed)
//  (DAB, 4/14/2022, Updated findByAuthorId to return ordered newest modified to 
//  oldest modified)

const db = require("../models");
const { Op } = db.Sequelize;
const Review = db.review;
const History = db.history;
const ReviewImage = db.reviewImage;
const Image = db.image;
const Rating = db.rating;
const Restaurant = db.restaurants;
const User = db.users;
const Authentication = db.authentication;

// Create and save a new review
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.restaurantId) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    // console.log("review details:", req.body);

    // Creating an array to hold the needed table ideas as the adjoining 
    // restaurant tables are created
    const reviewData = {
        userId: req.body.userId,
        restaurantId: req.body.restaurantId,
        ratingId: null,
        reviewTitle: req.body.reviewTitle,
        reviewText: req.body.reviewText,
        historyId: null
    };

    // Creating new timestamps for the the review creation
    const historyData = {
        modified: new Date(),
        created: new Date()
    }

    // Searching the database to verify a restaurant exists to write the review for
    await Restaurant.findByPk(reviewData.restaurantId)
        .then(async (restaurant) => {
            // If a restaurant was found the rating will be created
            if (restaurant) {
                // A new history entry is added for the rating
                const newHistory = await History.create(historyData)
                    .then(history => {
                        // The reviewData array is updated with the historyId
                        reviewData.historyId = history.historyId;

                        // The history object is returned to the caller
                        return history;
                    });

                // A new rating is created for the review
                const newRating = await Rating.create(req.body)
                    .then(rating => {
                        // The ratingId is updated in the reviewData array
                        reviewData.ratingId = rating.ratingId;

                        // Returning the rating query instance
                        return rating;
                    });

                // A new image row in the image table is created for the review
                const newImage = await Image.create(req.body)
                    .then(image => {
                        // Returning the image instance to the caller
                        return image;
                    });

                // Creating the review table for the new review
                const newReview = await Review.create(reviewData)
                    .then(newReview => {
                        // The new review object is returned to the caller
                        return newReview;
                    });

                // Searching for the restaurant rating to update
                await Rating.findByPk(restaurant.ratingId)
                    .then(async rating => {
                        // Updating the restaurant rating by adding in the new rating to the 
                        // restaurants rating table
                        await rating.update({
                            tasteRating: rating.tasteRating + req.body.tasteRating,
                            serviceRating: rating.serviceRating + req.body.serviceRating,
                            cleanlinessRating: rating.cleanlinessRating + req.body.cleanlinessRating,
                            overallRating: rating.overallRating + req.body.overallRating
                        });

                        // Incrementing the restaurants reviewCount by 1 since there is one new review
                        await restaurant.increment('reviewCount', { by: 1 });
                    });

                // Connecting the review and image tables for the new review image
                await ReviewImage.create({
                    imageId: newImage.imageId,
                    reviewId: newReview.reviewId
                })
                    .then(() => {
                        // Sending the newly created review data values back to the requester
                        res.json({ ...newReview.dataValues, newHistory, newRating, newImage })
                    });
            }
            // Else the restaurant does not exist so a review cannot be created for it
            else {
                res.status(500).send({
                    // Letting the requester know the review could not be created
                    message: `Cannot create a review. No restaurant with id=${restaurantId}.`
                });
            }
        })
        .catch(err => {
            // If there is an error, a response is sent to notify the requester
            res.status(500).send({
                message: err.message || "Error creating the review."
            });
        });
};


// Retrieve all reviews from the database.
exports.findAll = async (req, res) => {
    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ]
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
};


// Find a single review with an id
exports.findOne = async (req, res) => {
    // Pulling the reviewId from the param
    const { id: reviewId } = req.params;

    // Async searching the database and returning a review by id. The 
    // search includes all joined tables and attributes
    await Review.findByPk(reviewId, {
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ]
    })
        .then(data => {
            // If reviews are found they are sent back to the requester
            res.send(data);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving the review."
            });
        });
};


// Update a review by the id in the request
exports.update = async (req, res) => {
    // Validate request
    if (!req.body.tasteRating ||
        !req.body.serviceRating ||
        !req.body.cleanlinessRating ||
        !req.body.overallRating) {
        res.status(400).send({
            message: "Content needs required fields!"
        });
        return;
    }

    // Id needed to update the tables
    const { id: reviewId } = req.params;

    // First will search the database to find the review so that valid id's 
    // can be used in the update and to verify review exists
    await Review.findByPk(reviewId, {
        include: [
            Rating, History,
            { model: Image, through: { where: { reviewId: reviewId } } },
            {
                model: Restaurant,
                include: {
                    model: Rating
                }
            }
        ]
    })
        .then(async (review) => {
            // If the review exists the data is updated
            if (review) {
                // Destructuring the existing review ratings
                const {
                    tasteRating: reviewTasteRating,
                    serviceRating: reviewServiceRating,
                    cleanlinessRating: reviewCleanlinessRating,
                    overallRating: reviewOverallRating
                } = review.rating;

                // Destructuring the existing restaurant review ratings
                const {
                    tasteRating: restaurantTasteRating,
                    serviceRating: restaurantServiceRating,
                    cleanlinessRating: restaurantCleanlinessRating,
                    overallRating: restaurantOverallRating
                } = review.restaurant.rating;

                // Calculating the new restaurant rating based off the new review rating values
                const newRestaurantTasteRating = restaurantTasteRating - reviewTasteRating + req.body.tasteRating;
                const newRestaurantServiceRating = restaurantServiceRating - reviewServiceRating + req.body.serviceRating;
                const newRestaurantCleanlinessRating = restaurantCleanlinessRating - reviewCleanlinessRating + req.body.cleanlinessRating;
                const newRestaurantOverallRating = restaurantOverallRating - reviewOverallRating + req.body.overallRating;

                // Destructuring the needed table id's for the full review update
                const { ratingId: reviewRatingId } = review;
                const { ratingId: restaurantRatingId } = review.restaurant.rating;
                const { imageId: reviewImageId } = review.images[0];
                const { historyId: reviewHistoryId } = review;

                // Creating the new modified date for history
                const historyData = {
                    modified: new Date()
                }

                // Updating the review table
                await review.update(req.body);

                // Updating the review's rating table
                await Rating.update(req.body, {
                    where: { ratingId: reviewRatingId }
                });

                // Updating the restaurant's rating table
                await Rating.update({
                    tasteRating: newRestaurantTasteRating,
                    serviceRating: newRestaurantServiceRating,
                    cleanlinessRating: newRestaurantCleanlinessRating,
                    overallRating: newRestaurantOverallRating
                }, {
                    where: { ratingId: restaurantRatingId }
                });

                // Updating the reviews image table
                await Image.update(req.body, { where: { imageId: reviewImageId } });

                // Adding the new modified date to the review's history table
                await History.update(historyData, { where: { historyId: reviewHistoryId } })
                    .then(num => {
                        // If the review was updated a success response is sent
                        if (num == 1) {
                            res.send({
                                message: "Review was updated successfully."
                            });
                        }
                        // If there was an error, a response is sent to notify the requester
                        else {
                            res.status(500).send({
                                message: `Cannot update Review with id=${reviewId}. Maybe Review was not found or req.body is empty!`
                            });
                        }
                    });
            }
            // If the review was not found, the requester is notified
            else {
                res.status(500).send({
                    message: `Cannot update Review with id=${reviewId}. Maybe Review was not found!`
                });
            }
        })
        .catch(err => {
            // If there is an error, a response is sent to notify the requester
            res.status(500).send({
                message: err.message || "Error updating Review with id=" + reviewId
            });
        });
};


// Delete a Restaurant with the specified id in the request
exports.delete = async (req, res) => {
    // Id's needed to update the address, image, and restaurant tables
    const { id: reviewId } = req.params;

    // First will search the database to find the restaurant so that valid id's 
    // can be used in the delete and to verify review exists
    await Review.findByPk(reviewId, {
        include: [
            Rating, History, Image,
            {
                model: Restaurant,
                include: {
                    model: Rating
                }
            }
        ]
    })
        .then(async (review) => {
            // If the review exists the data will be deleted
            if (review) {
                // Destructuring the existing review ratings
                const {
                    tasteRating: reviewTasteRating,
                    serviceRating: reviewServiceRating,
                    cleanlinessRating: reviewCleanlinessRating,
                    overallRating: reviewOverallRating
                } = review.rating;
                // Destructuring the existing restaurant review ratings
                const {
                    tasteRating: restaurantTasteRating,
                    serviceRating: restaurantServiceRating,
                    cleanlinessRating: restaurantCleanlinessRating,
                    overallRating: restaurantOverallRating
                } = review.restaurant.rating;

                // Calculating the new restaurant rating based off the new review rating values
                const newRestaurantTasteRating = restaurantTasteRating - reviewTasteRating;
                const newRestaurantServiceRating = restaurantServiceRating - reviewServiceRating;
                const newRestaurantCleanlinessRating = restaurantCleanlinessRating - reviewCleanlinessRating;
                const newRestaurantOverallRating = restaurantOverallRating - reviewOverallRating;

                // Destructuring the needed table id's for the full review update
                const { ratingId: reviewRatingId, historyId: reviewHistoryId, restaurantId } = review;
                const { ratingId: restaurantRatingId } = review.restaurant.rating;
                const { imageId: reviewImageId } = review.images[0];

                // Deleting the review table
                await review.destroy();

                // Updating the review's rating table
                await Rating.destroy({ where: { ratingId: reviewRatingId } });

                // Updating the restaurant's rating table
                await Rating.update({
                    tasteRating: newRestaurantTasteRating,
                    serviceRating: newRestaurantServiceRating,
                    cleanlinessRating: newRestaurantCleanlinessRating,
                    overallRating: newRestaurantOverallRating
                }, {
                    where: { ratingId: restaurantRatingId }
                });

                // Decrementing the restaurants reviewCount by 1 since there is one less review
                await Restaurant.decrement('reviewCount', { by: 1, where: { restaurantId: restaurantId } });

                // Deleting the image row
                await Image.destroy({ where: { imageId: reviewImageId } });

                // Deleting the history row
                await History.destroy({ where: { historyId: reviewHistoryId } })
                    .then(num => {
                        // If the review was updated a success response is sent
                        if (num == 1) {
                            res.send({
                                message: "Review was deleted successfully."
                            });
                        }
                        // If there was an error, a response is sent to notify the requester
                        else {
                            res.status(500).send({
                                message: `Cannot delete Review with id=${reviewId}. Maybe Review was not found!`
                            });
                        }
                    });
            }
            // If the review was not found, the requester is notified
            else {
                res.status(500).send({
                    message: `Cannot delete Review with id=${reviewId}. Maybe Review was not found!`
                });
            }
        })
        .catch(err => {
            // If there is an error, a response is sent to notify the requester
            res.status(500).send({
                message: err.message || "Error deleting Review with id=" + reviewId
            });
        });
};


// Retrieve all Reviews from the database that have the same author id
exports.findByAuthorId = async (req, res) => {
    // Checking for to be searched for, if null is passed null becomes the id
    const userCreatorId = req.params.id === "null" ? null : req.params.id;

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        where: { userId: userCreatorId },
        order: [
            [History, 'modified', 'DESC'], 
            [Restaurant, 'restaurantName', 'ASC'], 
            [User, Authentication, 'userName', 'ASC']
        ]
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}


// Retrieve all Reviews from the database that have the same author id. Results 
// have set offset and limit values
exports.findByAuthorIdOffsetLimit = async (req, res) => {
    // Checking that offset and limit are numbers, if not a default value will be used
    const searchOffset = isNaN(req.params.offset) ? 0 : parseInt(req.params.offset);
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);
    // Checking for to be searched for, if null is passed null becomes the id
    const userCreatorId = req.params.id === "null" ? null : req.params.id;

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        subQuery: false,
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        where: { userId: userCreatorId },
        order: [[History, 'modified', 'DESC'], [User, Authentication, 'userName', 'ASC']],
        offset: searchOffset,
        limit: searchLimit
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}


// Retrieve all Reviews from the database that have the same restaurant id. Results 
// have set offset and limit values
exports.findByRestaurantIdOffsetLimit = async (req, res) => {
    // Checking that offset and limit are numbers, if not a default value will be used
    const searchOffset = isNaN(req.params.offset) ? 0 : parseInt(req.params.offset);
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);
    // Checking for to be searched for, if null is passed null becomes the id
    const restaurantId = req.params.id === "null" ? null : req.params.id;

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        where: { restaurantId: restaurantId },
        order: [[Restaurant, 'restaurantName', 'ASC'], [User, Authentication, 'userName', 'ASC']],
        offset: searchOffset,
        limit: searchLimit
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}

// Retrieve all Reviews from the database that have the same author and restaurant ids. 
// Results have set offset and limit values
exports.findByRestaurantAuthorIdOffsetLimit = async (req, res) => {
    // Checking that offset and limit are numbers, if not a default value will be used
    const searchOffset = isNaN(req.params.offset) ? 0 : parseInt(req.params.offset);
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);
    // Checking for to be searched for, if null is passed null becomes the id
    const userCreatorId = req.params.authorId === "null" ? null : req.params.authorId;
    // Checking for to be searched for, if null is passed null becomes the id
    const restaurantId = req.params.restaurantId === "null" ? null : req.params.restaurantId;

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        subQuery: false,
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        where: { 
            [Op.and]: [
                { userId: userCreatorId },
                { restaurantId: restaurantId },
            ],
        },
        order: [[History, 'modified', 'DESC'], [User, Authentication, 'userName', 'ASC']],
        offset: searchOffset,
        limit: searchLimit
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}


// Retrieve all Reviews from the database in the amount of the limit value
exports.findAllLimit = async (req, res) => {
    // If the req limit param is a number it is used, otherwise all results are returned
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        order: [[Restaurant, 'restaurantName', 'ASC'], [User, Authentication, 'userName', 'ASC']],
        limit: searchLimit
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}


// Retrieve all Reviews from the database. Results have a set offset and limit values. Orderd 
// by History modified
exports.findAllOffsetLimit = async (req, res) => {
    // Checking that offset and limit are numbers, if not a default value will be used
    const searchOffset = isNaN(req.params.offset) ? 0 : parseInt(req.params.offset);
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        order: [[History, 'modified', 'DESC'], [User, Authentication, 'userName', 'ASC']],
        offset: searchOffset,
        limit: searchLimit
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}


// Retrieve all Reviews from the database whose name is like the search param. Returns 
// results up to the set offset and limit values
exports.findByNameOffsetLimit = async (req, res) => {
    // Checking that offset and limit are numbers, if not a default value will be used
    const searchOffset = isNaN(req.params.offset) ? 0 : parseInt(req.params.offset);
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);
    // The restaurant name is pulled from params to be used in the query
    const searchName = req.params.name;

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        subQuery: false,
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                },
                attributes: ['userId']
            }
        ],
        where: { '$restaurant.restaurantName$': { [Op.like]: `${searchName}%` } },
        order: [[Restaurant, 'restaurantName', 'ASC'], [User, Authentication, 'userName', 'ASC']],
        offset: searchOffset,
        limit: searchLimit
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}


// Retrieve all Reviews from the database. Results have a set offset and limit values and 
// are returned newest to oldest
exports.findAllSortedByDate = async (req, res) => {
    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        order: [
            [History, 'modified', 'ASC'],
            [Restaurant, 'restaurantName', 'ASC'],
            [User, Authentication, 'userName', 'ASC']
        ]
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}


// Retrieve all Reviews from the database. Results have a set offset and limit values and 
// are returned newest to oldest
exports.findAllSortedByDateOffsetLimit = async (req, res) => {
    // Checking that offset and limit are numbers, if not a default value will be used
    const searchOffset = isNaN(req.params.offset) ? 0 : parseInt(req.params.offset);
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);

    // Async searching the database and returning all reviews. The 
    // search includes all joined tables and attributes
    await Review.findAll({
        attributes: {
            exclude: ['userId', 'restaurantId', 'ratingId', 'historyId']
        },
        include: [
            Rating, History,
            { model: Image, attributes: ['imageId', 'imageLocation'] },
            { model: Restaurant, attributes: ['restaurantId', 'restaurantName'] },
            {
                model: User,
                include: {
                    model: Authentication, attributes: ['userName']
                }, attributes: ['userId']
            }
        ],
        order: [
            [History, 'modified', 'ASC'],
            [Restaurant, 'restaurantName', 'ASC'],
            [User, Authentication, 'userName', 'ASC']
        ],
        offset: searchOffset,
        limit: searchLimit
    })
        .then(review => {
            // If reviews are found they are sent back to the requester
            res.send(review);
        })
        .catch(err => {
            // If there is an error the requester will be notified
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving reviews."
            });
        });
}