// Devin Brueberg
// CSC450 Capstone
// Restaurant Club - isLoading.js
// April 4, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 4/13/2022, Added in Friends isLoading reducer)
//  (DAB, 4/14/2022, Added End Loading All)

// Importing constants so there is no mistype
import C from '../constants';

// The loading reducer will allow the isLoading state to be 
// altered
export const isLoading = (state = {}, action) => {
    switch (action.type) {
        case C.START_LOADING_USERS:
            return {
                ...state,
                isLoadingUsers: action.isLoadingUsers
            }
        case C.END_LOADING_USERS:
            return {
                ...state,
                isLoadingUsers: action.isLoadingUsers
            }
        case C.START_LOADING_RESTAURANTS:
            return {
                ...state,
                isLoadingRestaurants: action.isLoadingRestaurants
            }
        case C.END_LOADING_RESTAURANTS:
            return {
                ...state,
                isLoadingRestaurants: action.isLoadingRestaurants
            }
        case C.START_LOADING_REVIEWS:
            return {
                ...state,
                isLoadingReviews: action.isLoadingReviews
            }
        case C.END_LOADING_REVIEWS:
            return {
                ...state,
                isLoadingReviews: action.isLoadingReviews
            }
        case C.START_LOADING_MESSAGES:
            return {
                ...state,
                isLoadingMessages: action.isLoadingMessages
            }
        case C.END_LOADING_MESSAGES:
            return {
                ...state,
                isLoadingMessages: action.isLoadingMessages
            }
        case C.START_LOADING_FRIENDS:
            return {
                ...state,
                isLoadingFriends: action.isLoadingFriends
            }
        case C.END_LOADING_FRIENDS:
            return {
                ...state,
                isLoadingFriends: action.isLoadingFriends
            }
        case C.END_LOADING_ALL:
            return {
                ...state,
                isLoadingUsers: action.isLoadingUsers,
                isLoadingRestaurants: action.isLoadingRestaurants,
                isLoadingReviews: action.isLoadingReviews,
                isLoadingMessages: action.isLoadingMessages,
                isLoadingFriends: action.isLoadingFriends
            }
        default:
            return state;
    }
}