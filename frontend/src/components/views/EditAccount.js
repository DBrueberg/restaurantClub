// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - EditAccount.js
// January 24, 2022
// Last Edited (Initials, Date, Edits):
//  (CPD, 1/29/22, GitHub-#29-EditAccount View Layout)
//  (DAB, 2/13/2022, Added in react redux connect)
//  (CPD, 2/22/22, Connected frontend to backend with addUserThunk)
//  (CPD, 2/27/22, Got states working with redux so we can update values now)
//  (DAB, 3/28/22, Admin editAccount functionality implemented)
//  (DAB, 3/28/22, Cleaned up code and added comments)
//  (DAB, 3/28/22, Added in clear form modal)
//  (TJI, 03/29/2022 - Added in character limits to match database)
//  (TJI, 04/02/2022) - Moved the update password to a new page)
//  (DAB, 4/02/2022, Removed update password from EditAccount and moved the 
//  link into the userDashboard)
//  (DAB, 4/02/2022, Added Confirm Password field to create account)
//  (DAB, 4/10/2022, Button are now responsive and follow expanding theme)
//  (DAB, 4/10/2022, Adjusted form Char limits to googles maximum values)
//  (CPD, 4/12/2022, Modified updateAccount to handle duplicate username error from backend)
//  (CPD, 4/13/2022, Re-added logic for admin redirect and remove edited user from state) 
//  (CPD, 4/14/2022, Added isLoading state and spinner code to the submit buttons)
//  (DAB, 04/14/2022, added endLoadingAll action to page load in to clean 
//  up any skipped load ins)

// Using React library in order to build components 
// for the app and importing needed components
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Row, Col, Form, Container, Button, FloatingLabel, Alert, Spinner } from 'react-bootstrap';
import FormContainer from '../template/FormContainer';
import { formatZipCode } from '../../helperFunction/FormatString';
import { addUserThunk, updateUserThunk, findByUserIdThunk, deleteUser } from '../../actions/users';
import { checkLogin } from '../../helperFunction/CheckLogin'
import FloatingStateOptionList from '../form/floatingComponents/FloatingStateOptionList';
import ModalConfirmation from '../modal/ModalCancelConfirm';
import { endLoadingAll } from '../../actions/isLoading';

/**
 * The EditAccount View will allow a users account information to be 
 * edited. 'Members' can edit their own accounts only while admins 
 * can use this page to edit all users accounts if needed. This page 
 * responsively converts between a Create Account and Edit Account 
 * View that will either create a new account in the database or 
 * edit the existing referenced account.
 * 
 * @param {*} props 
 * @returns 
 */
function EditAccount(props) {
    // Destructuring out needed state and actions
    const {
        users,
        findByUserIdThunk,
        deleteUser,
        addUserThunk,
        updateUserThunk,
        isLoading,
        endLoadingAll
    } = props;

    // Destructuring out the param if there is one
    const { userId } = useParams();
    // Allows for the navigation to the specified webpage
    const navigate = useNavigate();

    // keeps track of if the form was submitted
    const [submitted, setSubmitted] = useState(false)

    // Confirm modal local state
    const [showClearFormConfirm, setShowClearFormConfirm] = useState(false);

    // Form field state
    const [userName, setUserName] = useState(
        users.length > 0 ? users[0].auth.userName : ""
    );
    const [firstName, setFirstName] = useState(
        users.length > 0 ? users[0].firstName : ""
    );
    const [lastName, setLastName] = useState(
        users.length > 0 ? users[0].lastName : ""
    );
    const [address, setAddress] = useState(
        users.length > 0 ? users[0].address.address : ""
    );
    const [city, setCity] = useState(
        users.length > 0 ? users[0].address.city : ""
    );
    const [zip, setZip] = useState(
        users.length > 0 ? users[0].address.zip : ""
    );
    const [state, setState] = useState(
        users.length > 0 ? users[0].address.state : ""
    );
    const [email, setEmail] = useState(
        users.length > 0 ? users[0].email : ""
    );
    // Password no longer stored in state so set to blank
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    // The formError local state will hold any errors found in the
    // form and their error message
    const [formError, setFormError] = useState({});

    // Check if user is logged in
    const isEditing = checkLogin(users);

    // This useEffect renders only once on the initial page load in
    useEffect(() => {
        // If a user is logged in the data is loaded in if needed
        if (users.length > 0) {
            loadData();
        }
        
        // Ending any unfinished load ins
        endLoadingAll(); 
    }, [])


    // This useEffect will trigger a rerender every time the users state array 
    // changes
    useEffect(() => {
        // If there is a param userId then that user will be used to
        // set the form data
        if (userId) {
            // Checking if the user is in state
            const checkUser = users.filter(currentUser => currentUser.id === Number(userId));

            // If the user is in state the form fields are set to their data
            if (checkUser.length > 0) {
                // Updating the form fields with the param userId data
                setForm(checkUser[0]);
            }
        }
    }, [users])


    // The clearForm function will clear the form data
    const clearForm = () => {
        setUserName("");
        setFirstName("");
        setLastName("");
        setAddress("");
        setCity("");
        setZip("");
        setState("");
        setEmail("");
        setPassword("");
    }


    // The close handler will close the clear form modal
    const closeClearFormHandler = () => setShowClearFormConfirm(false);


    // The formErrorCheck will hold the logic for checking the
    // form for errors and return them as an object
    const formErrorCheck = () => {
        // Initial empty currentError object
        const currentError = {};

        // If the file size is greater than allowed a max file error
        // will be returned
        if (!isEditing && password !== confirmPassword) {
            currentError.password = `Passwords must match!`;
            currentError.confirmPassword = `Passwords must match!`;
        }

        // Returning the error found object to the caller
        return currentError;
    };


    // The handleSubmit method will call either update account or 
    // save account depending on if the account is being edited 
    // or created
    const handleSubmit = (e) => {
        // Preventing default form submission
        e.preventDefault();


        // As long as submitted or isLoading is still false
        if (!submitted || !isLoading.isLoadingUsers) {
            // Checking if the form has any errors
            const currentFormError = formErrorCheck();

            // If the form has errors, the error messages are displayed
            if (Object.keys(currentFormError).length > 0) {
                setFormError(currentFormError);
            }
            else {
                // If editing the account is updated in 
                // the database
                if (isEditing) {
                    updateAccount();
                }
                // If not updating the account is saved 
                // to the database
                else {
                    saveAccount();
                }
            }
        } else {
            setErrorMessage(`Submit button already pressed!`)
        }
    }


    // The loadData function is async and will query the database if the 
    // param userId user was not found in state. If there is no user 
    // with the param userId, the user is rerouted to admin since only 
    // admins can access the enhanced editAccount view
    const loadData = async () => {
        // If there is a param userId
        if (userId) {
            // If the userId matches the logged in user they are rerouted 
            // to the non param editAccount
            if (Number(userId) === users[0].id) {
                navigate('/editAccount')
            }

            // Check if userId is in state
            const checkUser = users.filter(currentUser => currentUser.id === Number(userId));

            // If the userId user was not found in state, the database is queried
            if (checkUser.length <= 0) {
                // result will hold true if a result was found and false if a 
                // result was not found
                const result = await findByUserIdThunk(userId)

                // If a result was not found then the userId does no exist in 
                // the database and the user is rerouted to admin
                if (!result) {
                    // Navigating to the admin page to look for the correct user
                    clearForm();
                    navigate('/admin');
                }
            }
        }
    }


    // Handles the address form input
    const onChangeAddress = e => {
        const { value, maxLength } = e.target;
        const address = value.slice(0, maxLength);
        setAddress(address);
    }


    // Handles the city form input
    const onChangeCity = e => {
        const { value, maxLength } = e.target;
        const city = value.slice(0, maxLength);
        setCity(city);
    }


    // Handles the confirm password form input
    const onChangeConfirmPassword = e => {
        const { value, maxLength } = e.target;
        const password = value.slice(0, maxLength);
        setConfirmPassword(password);

        // If the form had an error it is reset
        if (formError.confirmPassword) {
            setFormError({
                ...formError,
                password: null,
                confirmPassword: null,
            });
        }
    }


    // Handles the email form input
    const onChangeEmail = e => {
        const { value, maxLength } = e.target;
        const email = value.slice(0, maxLength);
        setEmail(email);
    }


    // Handles the first name form input
    const onChangeFirstName = e => {
        const { value, maxLength } = e.target;
        const firstName = value.slice(0, maxLength);
        setFirstName(firstName);
    }


    // Handles the last name form input
    const onChangeLastName = e => {
        const { value, maxLength } = e.target;
        const lastName = value.slice(0, maxLength);
        setLastName(lastName);
    }


    // Handles the password form input
    const onChangePassword = e => {
        const { value, maxLength } = e.target;
        const password = value.slice(0, maxLength);
        setPassword(password);

        // If the form had an error it is reset
        if (formError.password) {
            setFormError({
                ...formError,
                password: null,
                confirmPassword: null
            });
        }
    }


    // Handles the state form input
    const onChangeState = e => {
        const state = e.target.value
        setState(state);
    }


    // Handles the user name form input
    const onChangeUserName = e => {
        const { value, maxLength } = e.target;
        const userName = value.slice(0, maxLength);
        setUserName(userName);

        if (errorMessage) {
            setErrorMessage(``)
        }

        // If the form had an error it is reset
        if (formError.userName) {
            setFormError({
                ...formError,
                userName: null,
            });
        }
    }


    // Handles the zip form input
    const onChangeZip = e => {
        const { value, maxLength } = e.target;
        const zip = formatZipCode(value);
        setZip(zip);
    }


    // The passwordConfirmation method checks to see that the two 
    // passwords match, if they do not an error message is set and 
    // false is returned. If they do, no message is set and true 
    // is returned
    const passwordConfirmation = () => {
        // If the passwords do not match and error message is set 
        // and false is returned
        if (password !== confirmPassword) {
            setErrorMessage("Passwords must match!");
            return false;
        }
        // If the passwords match, error message is set to empty string 
        // and true is returned
        else {
            setErrorMessage("");
            return true;
        }
    }


    // The saveAccount function will create a new user in the database and 
    // navigate to that users dashboard
    const saveAccount = async () => {
        // Checking that the passwords match before submitting the form
        if (passwordConfirmation()) {
            // Call to redux-thunk action -> call to service class -> call to backend -> call to DB
            const isAccountCreated = await addUserThunk(
                userName,
                firstName,
                lastName,
                address,
                city,
                state,
                zip,
                email,
                password
            )

            // If the account was created the user is navigated to the dashboard
            if (isAccountCreated) {
                // The form was submitted so local state is set to true
                setSubmitted(true);

                // Send the new user to their new dashboard
                navigate("../welcome");
            }
            // If the account was not created, the user is notified in the error message
            else {

                setErrorMessage(`${userName} is already taken, try another!`);
                setFormError({
                    ...formError,
                    userName: `${userName} is already taken, try another!`
                });
            }

        }
    }


    // The setForm method will fill out the form fields when given 
    // the param user data
    const setForm = (user) => {
        setUserName(user.auth.userName);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setAddress(user.address.address);
        setCity(user.address.city);
        setZip(user.address.zip);
        setState(user.address.state);
        setEmail(user.email);
        setPassword(user.auth.password);
    }


    // The show handler will show the close form modal
    const showClearFormHandler = () => setShowClearFormConfirm(true);


    // The updateAccount will allow the user to update an existing account. 
    // If a param userId exists the admin user will update that account, if not 
    // the user will update their own account
    const updateAccount = async () => {
        // Pulling the id of the logged in user to 
        // update their own account
        const id = users.length > 0 ? users[0].id : "";

        // Structuring the data for database update submission using 
        // local form state
        let data = {
            userName: userName,
            firstName: firstName,
            lastName: lastName,
            address: address,
            city: city,
            zip: zip,
            state: state,
            userEmail: email
        }

        // If the admin is editing userId will be true, use the userId to update
        // else the regular user is editing, use the id to update
        const isAccountUpdated = await updateUserThunk(userId ?? id, data);

        // console.log("Is account updated? ", isAccountUpdated)

        // If the account was updated without errors the user is navigated to the dashboard
        if (isAccountUpdated) {
            // The form was submitted so local state is set to true
            setSubmitted(true);

            // After update, navigate admin to the users updated userDashboard
            if (userId) {
                navigate(`/userDashboard/${userId}`);
                // The updated user does need to be deleted from state or it will be 
                // displayed on the Admin page with all the wrong information.
                deleteUser(userId);

                // Or navigates regular user back to their userDashboard   
            } else {
                navigate("../userDashboard");
            }
        }
        // If the account was not created, the user is notified in the error message
        else {
            setErrorMessage(`${userName} is already taken, try another!`)
            setFormError({
                ...formError,
                userName: `${userName} is already taken, try another!`
            });
        }
    }


    //*************************** RENDER FUNCTIONS  *********************************/


    // The displaySubmitButton will display the correct submit button and 
    // associated handlers so the correct operations can be performed
    const displaySubmitButton = () => (
        <div className="d-flex flex-column flex-sm-row justify-content-around pt-2">
            <Button className="m-1" style={{ minWidth: "10rem" }} type="submit">
                {isLoading.isLoadingUsers ? (
                    <Spinner
                        as="span"
                        variant="light"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        animation="border" />
                ) : isEditing ? (
                    "Update"
                ) : (
                    "Submit"
                )}
            </Button>

            <Button className="m-1" style={{ minWidth: "10rem" }} onClick={showClearFormHandler}>
                Clear
            </Button>
        </div>
    )

    // The displayPasswordFields will only display the password fields when the 
    // form is in create account mode
    const displayPasswordFields = () => (
        !isEditing && (
            <div>
                <Form.Floating className="mb-3 justify-content-center">
                    <FloatingLabel
                        controlId="floatingPassword"
                        label="Password">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={onChangePassword}
                            maxLength="64"
                            isInvalid={!!formError?.password}
                        />
                        <Form.Control.Feedback type="invalid">
                                {formError?.password}
                            </Form.Control.Feedback>
                    </FloatingLabel>
                </Form.Floating>

                <Form.Floating className="mb-3 justify-content-center">
                    <FloatingLabel
                        controlId="floatingConfirmPassword"
                        label="Confirm Password">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            required
                            value={confirmPassword}
                            onChange={onChangeConfirmPassword}
                            maxLength="64"
                            isInvalid={!!formError?.confirmPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                                {formError?.confirmPassword}
                            </Form.Control.Feedback>
                    </FloatingLabel>
                </Form.Floating>
            </div>)

    )

    return (
        <FormContainer>
            <Container as="header">
                <div className="text-center p-1">
                    <h1>{isEditing ? "Edit" : "Create"} Account</h1>
                </div>
            </Container>
            <Container fluid as="main" className="justify-content-center">
                <Form onSubmit={handleSubmit}>
                    <Form.Floating className="mb-3 justify-content-center">
                        <FloatingLabel
                            controlId="floatingUserId"
                            label="User Name">
                            <Form.Control
                                type="text"
                                placeholder="User Name"
                                required
                                value={userName}
                                onChange={onChangeUserName}
                                maxLength="40"
                                isInvalid={!!formError?.userName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formError?.userName}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Floating>

                    <Form.Floating className="mb-3 justify-content-center">
                        <FloatingLabel
                            controlId="floatingFirstName"
                            label="First Name">
                            <Form.Control
                                type="text"
                                placeholder="User Name"
                                value={firstName}
                                onChange={onChangeFirstName}
                                maxLength="35"
                            />
                        </FloatingLabel>
                    </Form.Floating>

                    <Form.Floating className="mb-3 justify-content-center">
                        <FloatingLabel
                            controlId="floatingLastName"
                            label="Last Name">
                            <Form.Control
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={onChangeLastName}
                                maxLength="35"
                            />
                        </FloatingLabel>
                    </Form.Floating>

                    <Form.Floating className="mb-3 justify-content-center">
                        <FloatingLabel
                            controlId="floatingAddress"
                            label="Address">
                            <Form.Control
                                type="text"
                                placeholder="Address"
                                value={address}
                                onChange={onChangeAddress}
                                maxLength="38"
                            />
                        </FloatingLabel>
                    </Form.Floating>

                    <Form.Floating className="mb-3 justify-content-center">
                        <FloatingLabel
                            controlId="floatingCity"
                            label="City">
                            <Form.Control
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={onChangeCity}
                                maxLength="20"
                            />
                        </FloatingLabel>
                    </Form.Floating>

                    <Row className="justify-content-center">

                        <FloatingStateOptionList state={state} onChangeState={onChangeState} />

                        <Form.Floating as={Col} sm={6} className="mb-3 justify-content-center">
                            <FloatingLabel
                                controlId="floatingZip"
                                label="Zip">
                                <Form.Control
                                    type="text"
                                    placeholder="Zip"
                                    value={zip}
                                    onChange={onChangeZip}
                                    maxLength={5}
                                    minLength={5}
                                    pattern="[0-9]*"
                                />
                            </FloatingLabel>
                        </Form.Floating>
                    </Row>

                    <Form.Floating className="mb-3 justify-content-center">
                        <FloatingLabel
                            controlId="floatingEmail"
                            label="Email">
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={onChangeEmail}
                                maxLength="40"
                            />
                        </FloatingLabel>
                    </Form.Floating>

                    {displayPasswordFields()}

                    {displaySubmitButton()}
                    {errorMessage && <Alert className="mb-0 text-center mt-1" variant="danger">{errorMessage}</Alert>}
                </Form>

            </Container>
            <ModalConfirmation
                show={showClearFormConfirm}
                closeHandler={closeClearFormHandler}
                clearForm={clearForm} />
        </FormContainer>
    )
}

// Mapping the redux store states to props
const mapStateToProps = state =>
({
    users: [...state.users],
    isLoading: { ...state.isLoading }
});

// Exporting the connect Wrapped EditAccount Component
export default connect(mapStateToProps, {
    addUserThunk,
    updateUserThunk,
    findByUserIdThunk,
    deleteUser,
    endLoadingAll
})(EditAccount);