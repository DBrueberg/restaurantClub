// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - message.routes.js
// February 27, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 2/28/2022, Added in comments)
//  (DAB, 3/14/2022, Added in findAllAfterDateOffsetLimit)
//  (DAB, 3/28/2022, Updated the route name for findAllAfterDateOffsetLimit 
//  to describe its behavior of findAllByIdOffsetLimit)

module.exports = app => {
  const message = require("../controllers/message.controller.js");
  var router = require("express").Router();

  // Create a new message
  router.post("/", message.create);

  // Retrieve all messages
  router.get("/", message.findAll);

  // Retrieve a single message with id
  router.get("/:id", message.findOne);

  // Update a message with id
  router.put("/:id", message.update);

  // Delete a message with id
  router.delete("/:id", message.delete);

  // Retrieve all messages using the userFrom and To ids. Sorted newest to oldest with offset and limit
  router.get("/sorted/date/:userToId/:userFromId/:offset/:limit", message.findByConversationIdOffsetLimit);

  // Retrieve all messages using the userFrom and To ids written after the current messageId.
  // Sorted newest to oldest with offset and limit
  router.get("/sorted/byId/:messageId/:userToId/:userFromId/:offset/:limit", message.findAllByIdOffsetLimit);

  // URL to message for route
  app.use('/message', router);
};