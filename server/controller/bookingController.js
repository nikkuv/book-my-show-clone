const bookingModel = require("../models/bookingModal");
const showModel = require("../models/showModal");

// bookSeats - Book seats with overbooking prevention
const bookSeats = async (req, res) => {
    try {
        // userId comes from JWT middleware, seats & showId from frontend
        const { showId, seats, transactionId, userId } = req.body;

        // 2. Atomic Update: Check and Book in one go
        // This prevents race conditions where two users book the same seat
        const updatedShow = await showModel.findOneAndUpdate(
            {
                _id: showId,
                bookedSeats: { $nin: seats }, // Condition: requested seats must NOT be in bookedSeats
            },
            {
                $push: { bookedSeats: { $each: seats } }, // Update: push new seats
            },
            { new: true }
        );

        if (!updatedShow) {
            return res.status(400).send({
                success: false,
                message: "One or more seats you selected were just booked by another user. Please select distinct seats.",
            });
        }

        // 3. Create booking record (only if step 2 succeeded)
        const booking = new bookingModel({
            user: userId,
            show: showId,
            seats,
            transactionId,
            status: "confirmed",
        });
        await booking.save();


        res.send({
            success: true,
            message: "Seats booked successfully",
            data: booking,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// getBookingsByUser - Get all bookings for a user
const getBookingsByUser = async (req, res) => {
    try {
        const bookings = await bookingModel
            .find({ user: req.body.userId })
            .populate("show")
            .populate({
                path: "show",
                populate: {
                    path: "movie",
                    model: "movies",
                },
            })
            .populate({
                path: "show",
                populate: {
                    path: "theatre",
                    model: "theatre",
                },
            });

        res.send({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// cancelBooking - Cancel a booking and release seats
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await bookingModel.findById(bookingId);
        if (!booking) {
            return res.status(404).send({ success: false, message: "Booking not found" });
        }

        // Update booking status
        await bookingModel.findByIdAndUpdate(bookingId, { status: "cancelled" });

        // Release seats from the show
        await showModel.findByIdAndUpdate(booking.show, {
            $pull: { bookedSeats: { $in: booking.seats } },
        });

        res.send({ success: true, message: "Booking cancelled successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// makePayment - Create Stripe Payment Intent
const makePayment = async (req, res) => {
    try {
        // Lazy initialization of Stripe - only when makePayment is called
        if (!process.env.STRIPE_SECRET_KEY) {
            return res.status(500).send({
                success: false,
                message: "Stripe API key is not configured. Please set STRIPE_SECRET_KEY in your environment variables.",
            });
        }

        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "inr",
        });
        const transactionId = paymentIntent.client_secret;
        res.send({
            success: true,
            message: "Payment Intent created",
            data: transactionId,
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    bookSeats,
    getBookingsByUser,
    cancelBooking,
    makePayment,
};
