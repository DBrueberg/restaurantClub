// Devin Brueberg
// CSC450 Capstone
// Restaurant Club - restaurants.js
// February 13, 2022
// Last Edited (Initials, Date, Edits):

// Using React library in order to build components 
// for the app and importing needed components
import C from '../constants';
// The address reducer from users is the same as used in restaurants
import { address } from '/users';

// The restaurants reducer will allow the restaurants [] state to be 
// altered
export const restaurants = (state = [], action) => {
    switch (action.type) {
    }
}

// The restaurant reducer will allow the restaurant {} state to be 
// altered
export const restaurant = (state = {}, action) => {
    switch (action.type) {
    }
}

// The author reducer will allow the author {} state to be 
// altered
export const author = (state = {}, action) => {
    switch (action.type) {
    }
}

// The restaurants reducer will allow the restaurants [] state to be 
// altered. ADDRESS IS THE SAME FOR USERS AND RESTAURANTS
export const restaurantAddress = (state = [], action) => address(state, action);

// The rating reducer will allow the rating {} state to be 
// altered
export const rating = (state = {}, action) => {
    switch (action.type) {
    }
}

// The images reducer will allow the images [] state to be 
// altered
export const images = (state = [], action) => {
    switch (action.type) {
    }
}

// The image reducer will allow the image {} state to be 
// altered
export const image = (state = {}, action) => {
    switch (action.type) {
    }
}