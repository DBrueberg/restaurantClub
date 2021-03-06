// Initially Created by: Devin Brueberg
// CSC450 Capstone
// Restaurant Club - RestaurantReviewDetail.js
// February 6, 2022
// Last Edited (Initials, Date, Edits):
//  (DAB, 02/07/2022, Changed plain buttons variable to a buttonGroup function)
//  (DAB, 02/07/2022, Broke up into multiple reusable components)
//  (DAB, 02/12/2022, Refactored variables to match altered JSON array)
//  (TJI, 03/29/2022, Added alts to images)

// Using React library in order to build components 
// for the app and importing needed components
import React from 'react'
import { Card, Row, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import FullStarRatingRow from './FullStarRatingRow';
import ReviewTextCardBody from './ReviewTextCardBody';
import ReviewHeadingCardBody from './ReviewHeadingCardBody';

/**
 * A React-Bootstrap formatted component that shows the restaurant 
 * details will be generated. 
 * 
 * @param { reviews, restaurants, buttonGroup, modal } props 
 * @returns 
 */
function RestaurantReviewDetail(props) {
    // The form component specific props will be assigned and 
    // used to process the form element. 
    //**********NOTE: Feel free to add props but do not remove props you did not add
    // Also do not edit the styles in this component, only outside is allowed ******
    const { reviews, restaurants, buttonGroup, modal } = props;

    return (
        <Container fluid className="px-1">
            <Row>
                {reviews.length > 0 && reviews.map((review, index) => (
                    <Card className="mb-2 px-0" key={index} style={{ height: "100%", width: "100%", overflow: "hidden" }}>
                        <ReviewHeadingCardBody review={review} restaurants={restaurants} />
                        {review?.images[0].imageLocation &&
                            <div
                                className="d-flex mx-auto"
                                style={{ maxHeight: "20rem", maxWidth: "20rem", overflow: "hidden" }}>
                                <Card.Img
                                    style={{ width: "100%", height: "100%", overflow: "hidden" }}
                                    src={review.images[0].imageLocation}
                                    alt={review.restaurant.name} />
                            </div>}
                        <Card.Text className="text-center pt-1">
                            {review.author.userName}
                        </Card.Text>
                        <FullStarRatingRow key={review.reviewId} review={review} />
                        <ReviewTextCardBody key={review.reviewId} review={review} />
                        <Container
                            fluid className="px-0">
                            {/**Buttons to add function for this Container will generate here, add the 
                                 * buttons to the container by passing them as functional props*/}
                            {buttonGroup(review)}
                        </Container>
                    </Card>
                ))}
                {/** A modal can be generated here, add the modal to the container 
                     * by passing it as props*/}
                {modal}
            </Row>
        </Container>
    )
}

// Exporting the component
export default RestaurantReviewDetail;