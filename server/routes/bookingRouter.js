const express = require("express");
const bookingRouter = express.Router();
const {
    blockSeats,
    bookSeats,
    getBookingsByUser,
    cancelBooking,
    makePayment,
    verifyPayment,
} = require("../controller/bookingController");
const { validateJWTToken } = require("../middleware/authmiddleware");

// Block seats temporarily (10 minutes) - called when user selects seats
bookingRouter.post("/block", validateJWTToken, blockSeats);

// Book seats for a show - called after payment is completed
bookingRouter.post("/book-seats", validateJWTToken, bookSeats);

// Get all bookings for current user
bookingRouter.get("/get-bookings", validateJWTToken, getBookingsByUser);

// Cancel a booking
bookingRouter.post("/cancel-booking", validateJWTToken, cancelBooking);

// Make Payment
bookingRouter.post("/make-payment", validateJWTToken, makePayment);
bookingRouter.post("/verify-payment", validateJWTToken, verifyPayment);

module.exports = bookingRouter;
