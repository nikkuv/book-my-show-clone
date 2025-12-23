const express = require("express");
const bookingRouter = express.Router();
const {
    bookSeats,
    getBookingsByUser,
    cancelBooking,
    makePayment,
} = require("../controller/bookingController");
const { validateJWTToken } = require("../middleware/authmiddleware");

// Book seats for a show
bookingRouter.post("/book-seats", validateJWTToken, bookSeats);

// Get all bookings for current user
bookingRouter.get("/get-bookings", validateJWTToken, getBookingsByUser);

// Cancel a booking
bookingRouter.post("/cancel-booking", validateJWTToken, cancelBooking);

// Make Payment
bookingRouter.post("/make-payment", validateJWTToken, makePayment);

module.exports = bookingRouter;
