// Initially Created by: Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - user.controller.js
// February 14, 2022
// Last Edited (Initials, Date, Edits):
//  (CPD, 2/26, #154 Completed multi table updates to user controller)
//  (CPD, 2/27, re-wrote the update handler to hopefully give correct response now)
//  (CPD, 2/28, Removed historyId in create because history table is going away)
//  (CPD, 2/28, Added friend methods to users controller)
//  (DAB, 3/06/2022, Added in findByNameOffsetLimit that returns the needed user attributes
//  to load a state into redux. Safe data with no passwords)
//  (TJI, 03/28/2022 - Added in password hashing)
//  (DAB, 3/27/2022, Added the friends table results to return with get as friendsOne)
//  (DAB, 4/12/2022, Error Handling Audit - failed)
//  (DAB, 4/12/2022, Double checked and added error handling to every query)
//  (CPD, 4/12/2022, Refactored update method to check for existing usernames and clean up)
//  (DAB, 4/17/2022, fixed a uncaught error where a destructure was causing the backend to 
//  crash in update)
//  (DAB, 4/17/2022, Fixed a bug in the delete call where the restaurant data was not 
//  being updated when a user and their reviews were deleted)
//  (DAB, 10/16/2022, When deleting a user, all their images in the cloud now get deleted)

const { authentication, review } = require("../models");
const db = require("../models");
const { Op } = db.Sequelize;
const User = db.users;
const Authentication = db.authentication;
const Permission = db.permission;
const Address = db.address;
const Friend = db.friend;
const Review = db.review;
const Rating = db.rating;
const Restaurant = db.restaurants;

// Password hashing utility
const bcrypt = require('bcrypt');
const deleteUserDirectory = require("../middleware/deleteUserDirectory");

// Create and Save a new User
// Asynchronous method to create a user with the parameters passed from the frontend.
// Alters the user, address, and authentication tables (and eventually history)
exports.create = async (req, res) => {
    // Validate request
    if ((!req.body.userEmail) || (!req.body.userName) || !req.body.userPassword) {
        res.status(400).send({
            message: "Required fields are userEmail, address, and userName"
        });
        return;
    }

    // Check username does not already exist
    const userName = req.body.userName;
    const userNameAvailable = await Authentication.findOne({
        where: {
            userName: userName
        }
    })
        .then(data => {
            // Debug code
            // console.log("data: " + data);
            // console.log(data instanceof Authentication);

            // If where condition has a match the username already exists
            if (data instanceof Authentication) {
                return "Username not available";
            } else {
                return "Available";
            }
        })
        .catch(err => {
            return "Error checking username";
        });
    // Debug code
    console.log("user name is: " + userNameAvailable);

    // If the userName is available, proceed with creating a new account
    if (userNameAvailable === "Available") {

        // Build parameters for address table insert
        const address = {
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
        };

        // Wait for the address to be created, then copy to a const
        const newAddress = await Address.create(address)
            .then(newAddress => {
                return newAddress;
            })
            .catch(err => {
                return "Some error occurred while creating the Address.";
            });

        // Debug code
        // console.log("new address: " + newAddress);

        // Build parameters for user table insert
        const user = {
            addressId: newAddress.addressId,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userEmail: req.body.userEmail,
        };

        // Wait for a user to be created, then copy to a const
        const newUser = await User.create(user)
            .then(newUser => {
                return newUser;
            })
            .catch(err => {
                return "Some error occurred while creating the User.";
            });

        // Debug code
        // console.log("new user: " + JSON.stringify(newUser));

        // Build parameters for authentication table insert
        const authentication = {
            userId: newUser.userId,
            // Default permissionId level is 1 for members
            permissionId: 1, // FK constraint with Permission table
            userName: req.body.userName,
            userPassword: req.body.userPassword
        }

        // Hashes the submitted password using BCrypt's minor a modal going through 2^10 rounds
        if (authentication.userPassword) {
            // Attempting to encrypt the password
            try {
                const salt = await bcrypt.genSaltSync(10, 'a');
                authentication.userPassword = bcrypt.hashSync(authentication.userPassword, salt);
            }
            // Password was not encrypted so a console message is sent
            catch (err) {
                console.log("Password not encrypted");
            }

        }

        // Save Authentication in the database
        Authentication.create(authentication)
            .then(newAuth => {
                // Send the response JSON with both objects
                res.json({ newUser, newAddress, newAuth });
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the User."
                });
            });
    } else {

        // Else the userName already exists, do nothing
        res.status(400).send({
            message: "Username not available"
        });
    }
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
    User.findAll({ include: [Address, Authentication] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        });
};

// Find a single User with an id
exports.findOne = (req, res) => {
    // Saving the userId to params
    const id = req.params.id;

    // Querying the database for the user with the param id
    User.findByPk((id), {
        include: [Address, Authentication,
            {
                model: Friend, as: "friendOne",
                include: [{
                    model: User, as: "friendTwo", attributes: ["userId"],
                    include: {
                        model: Authentication, attributes: ["userName"]
                    }
                },
                ]
            }
        ]
    })
        .then(data => {
            // If there is data, it is sent 
            if (data) {
                res.send(data);
            }
            // Else a 404 error message is sent
            else {
                res.status(404).send({
                    message: `Cannot find User with id=${id}.`
                });
            }
        })
        .catch(err => {
            // If there is another kind of error the requester is notified
            res.status(500).send({
                message:
                    err.message || "Error retrieving User with id=" + id
            });
        });
};

// Update a User by the id in the request
exports.update = async (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content body can not be empty!"
        });
        return;
    }
    const id = req.params.id;
    const newName = req.body.userName;
    let userName = false;

    // Check current user name
    await Authentication.findOne(
        {
            where: {
                userId: id,
            }
        })
        .then(res => {
            userName = res.dataValues.userName;
        })
        .catch(err => {
            return err;
        });


    // Function to check for new username and check for duplicates
    const newUserName = async () => {
        // If the userName is different, this implies a change request
        if (userName && userName !== newName) {

            // Check username does not already exist
            const userNameAvailable = await Authentication.findOne({
                where: {
                    userName: newName
                }
            })
                .then(data => {
                    // If where condition has a match the username already exists
                    if (data) {
                        console.log("Username not available");
                        return false;
                    } else {
                        console.log("Available");
                        return true;
                    }
                })
                .catch(err => {
                    return err;
                });

            // console.log("User name is: " + userNameAvailable);
            return userNameAvailable;

            // Else there was not a new userName given
        } else {
            console.log("User name not updated");
            return true;
        }
    }

    // console.log("###################");
    // console.log("update status: ", await newUserName());

    // If the userName is available, proceed with updating account
    if (await newUserName()) {
        // We find the associated addressId from the user table
        const addressId = await User.findByPk(id)
            .then(user => {
                // If the user exists the data is updated
                if (user) {
                    // Destructure address from the user
                    const { addressId } = user;
                    return addressId
                } else {
                    // This negative value indicates there has been an error
                    return -1
                }
            })
            .catch(err => {
                return -1;
            });

        // Try to update users table
        const userUpdateStatus = await User.update(req.body, {
            where: { userId: id }
        })
            .then(status => {
                // This will contain a 1 if successful
                return status;
            })
            .catch(err => {
                // Return -1 to indicate an error occurred 
                return -1;
            });

        // Try to update auth table if newUserName is available
        const authUpdateStatus = await Authentication.update(req.body, {
            where: { userId: id }
        })
            .then(status => {
                // This will contain a 1 if successful
                return status;
            })
            .catch(err => {
                // Return -1 to indicate an error occurred 
                return -1
            });

        // Try to update address table
        const addressUpdateStatus = await Address.update(req.body, {
            where: { addressId: addressId }
        })
            .then(status => {
                // This will contain a 1 if successful
                return status;
            })
            .catch(err => {
                // Return -1 to indicate an error occurred 
                return -1;
            });

        // Any one of these values being equal to 1 indicates success updating a row
        if (userUpdateStatus == 1 ||
            authUpdateStatus == 1 ||
            addressUpdateStatus == 1) {
            res.send({
                message: "User was updated successfully!"
            });
        } else {
            res.status(500).send({
                message: `Cannot update user. Maybe user was not found!`
            });
        }
    } else {
        // Else the userName already exists, do nothing
        res.status(400).send({
            message: "Username not available"
        });
    }
};

// Delete a User with the specified id in the request and adjusting 
// the restaurant table to account for their deleted reviews
exports.delete = async (req, res) => {
    const id = req.params.id;
    let addressId = "";

    // We find the associated addressId from the user table
    const currentUser = await User.findByPk(id)
        .then(user => {
            // If the user exists the data is updated
            if (user) {
                // Destructure address from the user
                // const { addressId } = user;
                addressId = user.dataValues.addressId;
                return user;
            } else {
                return "User not found";
            }
        })
        .catch(err => {
            return "User not found";
        });

    // If a user was found in the query, all the reviews 
    // they have written are added to an array so they can 
    // be removed from the restaurant data
    if (currentUser) {
        // The users review data will be saved in the array
        let userReviewData = []

        // Querying the database for all the reviews associated 
        // with the user
        await Review.findAll({
            include: [Rating],
            where: { userId: currentUser.userId }
        })
            .then(reviews => {
                // If there are reviews, ones with the 
                // same restaurantId are added up into 
                // one object for the restaurant update
                if (reviews) {
                    // Iterating through the review results and organizing them 
                    // into relative objects
                    reviews.map(review => {
                        // The data values that will be used in the iterations are 
                        // declared here for easy reference
                        const { restaurantId } = review;
                        const reviewDataValues = review.dataValues;
                        const ratingDataValues = review.dataValues.rating.dataValues;

                        // The index will hold the index of the restaurantId in the 
                        // userReviewData list
                        const index = userReviewData.findIndex(current => current.restaurantId === restaurantId);

                        // If the index was returned, the data is added to the current 
                        // elements
                        if (index > -1) {
                            // The currentReview references the data in the current review
                            const currentReview = userReviewData[index];

                            // Updating the userReviewData with the current data
                            userReviewData[index] = {
                                ...userReviewData[index],
                                reviewTotals: {
                                    totalReviews: currentReview.reviewTotals.totalReviews + 1,
                                    tasteRating: currentReview.reviewTotals.tasteRating + ratingDataValues.tasteRating,
                                    serviceRating: currentReview.reviewTotals.serviceRating + ratingDataValues.serviceRating,
                                    cleanlinessRating: currentReview.reviewTotals.cleanlinessRating + ratingDataValues.cleanlinessRating,
                                    overallRating: currentReview.reviewTotals.overallRating + ratingDataValues.overallRating
                                }
                            }
                        }
                        // Else the index was not returned so a fresh element is added to the list
                        else {
                            userReviewData.push(
                                {
                                    restaurantId: restaurantId,
                                    reviewTotals: {
                                        totalReviews: 1,
                                        tasteRating: ratingDataValues?.tasteRating,
                                        serviceRating: ratingDataValues?.serviceRating,
                                        cleanlinessRating: ratingDataValues?.cleanlinessRating,
                                        overallRating: ratingDataValues?.overallRating
                                    }
                                }
                            )
                        }
                    })
                }
            })
            .catch(err => console.log(err));

        try {
            // If the user had review data it will be removed from the corresponding 
            // restaurant entries
            if (userReviewData && userReviewData?.length > 0) {
                // Iterating through the userReviewData and updating the 
                // restaurants one at a time
                await userReviewData.forEach(async data => {
                    // Important update data are assigned to their own 
                    // variables
                    const restaurantId = data?.restaurantId;
                    const reviewCount = data?.reviewTotals?.totalReviews;

                    // Querying the restaurant data so the correct ratingId
                    // can be used
                    const currentRestaurant = await Restaurant.findByPk(restaurantId)
                        .catch(err => console.log(err));

                    // Assigning the ratingId to its own variable to prevent errors
                    const ratingId = currentRestaurant?.ratingId;

                    const currentRating = await Rating.findByPk(ratingId)
                        .catch(err => console.log(err));

                    // Destructuring the existing review ratings
                    const {
                        tasteRating: reviewTasteRating,
                        serviceRating: reviewServiceRating,
                        cleanlinessRating: reviewCleanlinessRating,
                        overallRating: reviewOverallRating
                    } = currentRating;

                    // Destructuring the existing restaurant review ratings
                    const {
                        tasteRating: restaurantTasteRating,
                        serviceRating: restaurantServiceRating,
                        cleanlinessRating: restaurantCleanlinessRating,
                        overallRating: restaurantOverallRating
                    } = data.reviewTotals;

                    // Calculating the new restaurant rating based off the new review rating values
                    const newRestaurantTasteRating = reviewTasteRating - restaurantTasteRating;
                    const newRestaurantServiceRating = reviewServiceRating - restaurantServiceRating;
                    const newRestaurantCleanlinessRating = reviewCleanlinessRating - restaurantCleanlinessRating;
                    const newRestaurantOverallRating = reviewOverallRating - restaurantOverallRating;

                    // Updating the restaurant's rating table
                    await Rating.update({
                        tasteRating: newRestaurantTasteRating,
                        serviceRating: newRestaurantServiceRating,
                        cleanlinessRating: newRestaurantCleanlinessRating,
                        overallRating: newRestaurantOverallRating
                    }, {
                        where: { ratingId: ratingId }
                    })
                        .catch(err => console.log(err));

                    // Decrementing the restaurants reviewCount by reviewCount since 
                    // the users reviews are to be deleted
                    await Restaurant.decrement('reviewCount', {
                        by: reviewCount,
                        where: { restaurantId: restaurantId }
                    })
                        .catch(err => console.log(err));
                })
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    // Attempting to delete the user now that all their other data was 
    // removed
    const deletedUserStatus = await User.destroy({
        where: { userId: id }
    })
        .then(deletedStatus => {
            return deletedStatus;
        })
        .catch(err => {
            return "User not found";
        });

    // If a user was deleted without errors, also delete the address and cloud images
    if (deletedUserStatus == 1) {
        // Deleting user images in the cloud
        await deleteUserDirectory(id)
            .then(result => console.log("User images successfully deleted"))
            .catch(error => console.log("There was an error deleting user images"));

        // Deleting the user address
        await Address.destroy({
            where: { addressId: addressId }
        })
            .then(num => {
                // If there was no error in the deleting the success response is sent back
                if (num == 1) {
                    res.send({
                        message: "User was deleted successfully!"
                    });
                }
                // If there was an error, a response is sent to notify the requester
                else {
                    res.status(500).send({
                        message: `Cannot delete user. Maybe user was not found!`
                    });
                }
            })
            .catch(err => {
                // If there is an error, a response is sent to notify the requester
                res.status(500).send({
                    message: err.message || `Could not delete user with id=${id}.`
                });
            });
    } else {
        res.status(500).send({
            message: `Cannot delete user. Maybe user was not found!`
        });
    }
};

// Create and Save a new Friend in the req.body for the user specified in the req.params.id
exports.addFriend = async (req, res) => {
    // Validate request
    if (!req.body.friendTwoId) {
        res.status(400).send({
            message: "You must supply a userId paramater and userId for friend in the body!"
        });
        return;
    }

    // Collect userId from parameter
    const id = req.params.id;
    const friendTwoId = req.body.friendTwoId;

    // Create a Friend
    const friend = {
        friendOneId: id,
        friendTwoId: friendTwoId
    };

    // Check that you are not already friends
    const alreadyFriends = await Friend.findOne({
        where: {
            friendOneId: id,
            friendTwoId: friendTwoId
        }
    })
        .catch(err => {
            return false;
        });

    // console.log("already friend!", alreadyFriends);

    if (alreadyFriends) {
        res.status(500).send({
            message: "Already friends with user " + id
        });
    } else {

        // Save Friend in the database
        Friend.create(friend)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the Friend."
                });
            });
    }


};

// Returns a list of friends for the user specified in the req.params.id
exports.getAllFriends = async (req, res) => {
    const id = req.params.id;

    Friend.findAll({
        where: {
            friendOneId: id
        },
        // We include only attributes that we need, which are none from the Friends table
        // except for friendTwoId which we use for debugging
        // attributes: ['friendTwoId'],
        attributes: [],
        include: [
            {
                model: User, as: 'friendTwo',
                include: {
                    model: Authentication, attributes: ['userName']
                },
                // Should match the friendTwoId from above
                attributes: ['userId']
            }
        ]
    })
        .then(data => {
            // console.log("friend data: ", data);

            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Friend with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({ err });
        });
};

// Deletes a friend from the req.body for the user specified in the req.params.id
exports.deleteFriend = async (req, res) => {
    // Validate request
    if (!req.body.friendTwoId) {
        res.status(400).send({
            message: "You must supply a friend to delete!"
        });
        return;
    }

    // The id of the user who will be removing the friend
    const id = req.params.id;

    // The id of the friend to be deleted
    const friendTwoId = req.body.friendTwoId;

    // Destroy the Friend record where the friend exists to delete friend
    await Friend.destroy({
        where: {
            friendOneId: id,
            friendTwoId: friendTwoId
        }
    })
        .then(num => {
            // No errors implies success
            if (num == 1) {
                res.send({
                    message: "Friend was deleted successfully!"
                });
            } else {
                res.status(500).send({
                    message: `Cannot delete Friend with id=${id}. Maybe Friend was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Friend with id=" + id
            });
        });
};

// Retrieve all User entries from the database whose userName is like the search param. Returns 
// results up to the set offset and limit values
exports.findByNameOffsetLimit = async (req, res) => {
    // Checking that offset and limit are numbers, if not a default value will be used
    const searchOffset = isNaN(req.params.offset) ? 0 : parseInt(req.params.offset);
    const searchLimit = isNaN(req.params.limit) ? 999999999999 : parseInt(req.params.limit);
    // The userName is pulled from params to be used in the query
    const searchName = req.params.userName;

    // Searching for all User data that matches the name and returning the results with 
    // the offset/limit
    await User.findAll({
        subQuery: false,
        include: [Address,
            {
                model: Friend, as: 'friendOne'
            },
            {
                model: Authentication, attributes: [
                    'authId', 'userName', 'createdAt', 'updatedAt'
                ],
                include: {
                    model: Permission
                }
            }
        ],
        where: { '$authentication.userName$': { [Op.like]: `%${searchName}%` } },
        order: [[Authentication, 'userName', 'ASC']],
        offset: searchOffset,
        limit: searchLimit
    })
        .then(user => {

            // If users are found the data is returned
            res.send(user);
        })
        .catch(err => {
            // Else a message indicating the user was not found is sent
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        });
}
