// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - App.js
// January 24, 2022
// Last Edited (Initials, Date, Edits):
// TJI, 13 Feb 2022, Added pb-5 to stop sticky footer covering low content
//  (DAB, 3/05/2022, Added in search for restaurantName param)
//  (DAB, 3/06/2022, Added in routes for params with editRestaurant and userDashboard)
//  (DAB, 3/24/2022, Added in Route Authentication for Admin, UserDashboard, Chat, EditAccount, 
//  EditRestaurant, and Review)
//  (DAB, 3/24/2022, Added in enhanced UX by auto directing then redirecting a user to where they 
//  want to go)
//  (DAB, 4/02/2022, Wrapped editPassword in the appropriate authentication wrappers)
//  (DAB, 4/03/2022, Removed connect wrapper from App)
//  (DAB, 4/09/2022, Adjusted content for footer to hug bottom of page)
//  (DAB, 4/19/2022, Wrapped Welcome component in a AuthLoggedIn component for reroute)

// Using React library in order to build components 
// for the app and importing needed components
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Main from './components/views/Main';
import Whoops404 from './components/views/Whoops404';
import Restaurant from './components/views/Restaurant';
import Chat from './components/views/Chat';
import EditAccount from './components/views/EditAccount';
import EditRestaurant from './components/views/EditRestaurant';
import Login from './components/views/Login';
import Review from './components/views/Review';
import Search from './components/views/Search';
import UserDashboard from './components/views/UserDashboard';
import Admin from './components/views/Admin';
import AuthAdmin from './components/auth/AuthAdmin';
import AuthLoggedIn from './components/auth/AuthLoggedIn';
import AuthReview from './components/auth/AuthReview';
import AuthChat from './components/auth/AuthChat';
import EditPassword from './components/views/EditPassword';
import Welcome from './components/views/Welcome';

/**
 * The App Component handles all the navigation and security for the 
 * front end Components. They will load via the URL route at the 
 * time.
 * 
 * @param {*} props 
 * @returns 
 */
function App(props) {
    return (
        <div className="App" style={{ paddingBottom: "4rem" }}>
            <Routes>
                <Route exact path='/' element={<Main />} />
                <Route path='/restaurant' element={<Navigate replace to='/search' />} />
                <Route path='/restaurant/:restaurantId' element={<Restaurant />} />
                <Route path='/restaurant/:restaurantId/:authorId' element={<Restaurant />} />
                <Route path='/chat' element={<Navigate replace to='/userDashboard' />} />
                <Route path='/chat/:id' element={
                    <AuthChat>
                        <Chat />
                    </AuthChat>
                } />
                <Route path='/chat/:userId/:friendId' element={<Chat />} />
                <Route path='/editAccount' element={<EditAccount />} />
                <Route path='/editAccount/:userId' element={
                    <AuthAdmin>
                        <EditAccount />
                    </AuthAdmin>} />
                <Route path='/editPassword' element={
                    <AuthLoggedIn>
                        <EditPassword />
                    </AuthLoggedIn>
                } />
                <Route path='/editPassword/:userId' element={
                    <AuthAdmin>
                        <EditPassword />
                    </AuthAdmin>
                } />
                <Route path='/editRestaurant' element={
                    <AuthLoggedIn>
                        <EditRestaurant />
                    </AuthLoggedIn>
                } />
                <Route path='/editRestaurant/:restaurantId' element={
                    <AuthAdmin>
                        <EditRestaurant />
                    </AuthAdmin>} />
                <Route path='/login' element={<Login />} />
                <Route path='/review' element={<Navigate replace to='/search' />} />
                <Route path='/review/:restaurantId' element={
                    <AuthLoggedIn>
                        <Review />
                    </AuthLoggedIn>} />
                <Route path='/review/:restaurantId/:reviewId' element={
                    <AuthReview>
                        <Review />
                    </AuthReview>} />
                <Route path='/search' element={<Search />} />
                <Route path='/search/:restaurantName' element={<Search />} />
                <Route path='/search/:restaurantId/:authorId' element={<Search />} />
                <Route path='/userDashboard' element={
                    <AuthLoggedIn>
                        <UserDashboard />
                    </AuthLoggedIn>} />
                <Route path='/userDashboard/:userId' element={
                    <AuthAdmin>
                        <UserDashboard />
                    </AuthAdmin>} />
                <Route path="/welcome" element={
                    <AuthLoggedIn>
                        <Welcome />
                    </AuthLoggedIn>} />
                <Route path='/admin' element={
                    <AuthAdmin>
                        <Admin />
                    </AuthAdmin>
                } />
                <Route path="*" element={<Whoops404 />} />
            </Routes>
        </div>
    );
}

// Exporting the component
export default App;