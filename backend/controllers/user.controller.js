// Initially Created by: Coleman Dietsch
// CSC450 Capstone
// Restaurant Club - user.controller.js
// February 14, 2022
// Last Edited (Initials, Date, Edits):

const db = require("../models");
const User = db.users;
const Authentication = db.authentication;
const Address = db.address;

// Create and Save a new User
exports.create = (req, res) => {
    // Validate request
    if (!req.body.userEmail) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    // Build parameters for user table insert
    const user = {
        addressId: req.body.addressId,
        fName: req.body.fName,
        lName: req.body.lName,
        userEmail: req.body.userEmail,
    };

    // Save User in the database
    User.create(user)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User."
            });
        });
};

// Asynchronous method to create a user with the parameters passed from the frontend.
// Alters the user, address, and authentication tables (and eventually history)
exports.addUser = async (req, res) => {
    // Validate request
    if ((!req.body.userEmail) || (!req.body.address)) {
        res.status(400).send({
            message: "Required fields are userEmail and address"
        });
        return;
    }

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
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Address."
            });
        });

    // Debug code
    console.log("new address: " + newAddress);

    // Build parameters for user table insert
    const user = {
        addressId: newAddress.addressId,
        fName: req.body.fName,
        lName: req.body.lName,
        userEmail: req.body.userEmail,
    };

    // Wait for a user to be created, then copy to a const
    const newUser = await User.create(user)
        .then(newUser => {
            return newUser;
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the User."
            });
        });

    // Debug code
    // console.log("new user: " + JSON.stringify(newUser));

    // Build parameters for authentication table insert
    const authentication = {
        userId: newUser.userId,
        permissionId: "1",
        userName: req.body.userName,
        userPassword: req.body.userPassword,
        historyId: req.body.historyId,
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
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
    User.findAll()
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
    const id = req.params.id;
    User.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find User with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving User with id=" + id
            });
        });
};

// Update a User by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    User.update(req.body, {
        where: { userId: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "User was updated successfully."
                });
            } else {
                res.status(500).send({
                    message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating User with id=" + id
            });
        });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    User.destroy({
        where: { userId: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "User was deleted successfully!"
                });
            } else {
                res.status(500).send({
                    message: `Cannot delete User with id=${id}. Maybe User was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete User with id=" + id
            });
        });
};
