// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - FloatingCity.js
// February 3, 2022
// Last Edited (Initials, Date, Edits):
//  (TJI, 03/29/2022 - Added in character limits to match database)

// Using React library in order to build components 
// for the app and importing needed components
import React from 'react'
import { Form, FloatingLabel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'

/**
 * A React-Bootstrap formatted floating form text input is
 * returned with all needed basic functionality. It will 
 * allow CRUD operations to be performed on a City.
 * 
 * @param { city, onChangeCity } props 
 * @returns 
 */
function FloatingCity(props) {
    // The form component specific props will be assigned and 
    // used to process the form element
    const { city, onChangeCity } = props;

    return (
        <Form.Floating className="mb-3 justify-content-center">
            <FloatingLabel 
                controlId="floatingCity" 
                label="City">
                    <Form.Control
                        type="text"
                        placeholder="City"
                        required
                        value={city}
                        onChange={onChangeCity}
                        maxLength="20"
                    />
                </FloatingLabel>
        </Form.Floating>
    )  
}

// Exporting the component
export default FloatingCity;