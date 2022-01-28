// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - Chat.js
// January 24, 2022
// Last Edited (Initials, Date, Edits):

// Using React library in order to build components 
// for the app and importing needed components
import React from 'react';
import { Link } from 'react-router-dom';

function Chat(props) {
    return (
        <div className="chat">
            <h1>
                Welcome to the Chat Page!
            </h1>
            <Link to="/">Back to Home</Link>
        </div>
    )
}

// Exporting the component
export default Chat;