// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - address.controller.js
// February 20, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 4/12/2022, Error Handling Audit - Passed)

// Importing needed modules
const db = require("../models");
const Address = db.address;

// Create and Save a new Address
exports.create = (req, res) => {
    // Validate request
    if (!req.body.address) {
        res.status(400).send({
            message: "You must supply an address!"
        });
        return;
    }
    // Create a Address
    const address = {
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
    };
    // Save Address in the database
    Address.create(address)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Address."
            });
        });
};

// Retrieve all Addresss from the database.
exports.findAll = (req, res) => {
    Address.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving address."
            });
        });
};

// Find a single Address with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    Address.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Address with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Address with id=" + id
            });
        });
};

// Update a Address by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    Address.update(req.body, {
        where: { addressId: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Address was updated successfully."
                });
            } else {
                res.status(500).send({
                    message: `Cannot update Address with id=${id}. Maybe Address was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Address with id=" + id
            });
        });
};

// Delete a Address with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    Address.destroy({
        where: { addressId: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Address was deleted successfully!"
                });
            } else {
                res.status(500).send({
                    message: `Cannot delete Address with id=${id}. Maybe Address was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Address with id=" + id
            });
        });
};
