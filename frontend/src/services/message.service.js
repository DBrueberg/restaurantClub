// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - message.service.js
// February 28, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 3/14/2022, Added service for findAllAfterDateOffsetLimit)
//  (DAB, 3/28/2022, Updated the service name for findAllAfterDateOffsetLimit 
//  to describe its behavior of findAllByIdOffsetLimit)

// Importing the Axios default settings
import http from "../http-common";

class MessageDataService {

    /**
     * Creates a new message and conversation entry if one is not 
     * already in the database.
     * 
     * @param { userToId, userFromId, message } data 
     * @returns - message if created
     */
    create(data) {
        return http.post("/message/", data);
    }

    /**
     * Retrieves all messages.
     * 
     * @returns - an array of all messages found
     */
    getAll() {
        return http.get("/message");
    }

    /**
     * Get the message if it exists by providing a message id.
     * 
     * @param { messageId } id 
     * @returns - message data if found matching the message id
     */
    get(id) {
        return http.get(`/message/${id}`);
    }

    /**
     * NOT TO BE IMPLEMENTED UNTIL MILESTONE 4
     * 
     * @param {*} id 
     * @param {*} data 
     * @returns - 404
     */
    update(id, data) {
        return http.put(`/message/${id}`, data);
    }

    /**
     * NOT TO BE IMPLEMENTED UNTIL MILESTONE 4
     * 
     * @param {*} id 
     * @returns - 404
     */
    delete(id) {
        return http.delete(`/message/${id}`);
    }

    /**
     * The findByConversationIdOffsetLimit will connect to the back end server method.
     * 
     * @param {*} userToId - userId of the sender
     * @param {*} userFromId - userId of the receiver
     * @param {*} offset 
     * @param {*} limit 
     * @returns - All messages found between the two users in ASC modifiedAt order
     */
    findByConversationIdOffsetLimit(userToId, userFromId, offset, limit) {
        return http.get(`/message/sorted/date/${userToId}/${userFromId}/${offset}/${limit}`);
    }

    /**
     * The findAllAfterDateOffsetLimit will connect to the back end server method.
     * 
     * @param {*} createdAt - results will return all messages after this dateTime
     * @param {*} userToId - userId of the sender
     * @param {*} userFromId - userId of the receiver
     * @param {*} offset 
     * @param {*} limit 
     * @returns - All messages found between the two users in ASC modifiedAt order
     */
    findAllByIdOffsetLimit(messageId, userToId, userFromId, offset, limit) {
        return http.get(`/message/sorted/byId/${messageId}/${userToId}/${userFromId}/${offset}/${limit}`);
    }
}

// Exporting DataService
export default new MessageDataService();