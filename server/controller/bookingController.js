const bookingModel = require("../models/bookingModal");
const showModel = require("../models/showModal");

// Helper function to clean expired blocks (older than 10 minutes)
const cleanExpiredBlocks = async (showId) => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const show = await showModel.findById(showId);
    
    if (!show) return;

    // Filter out expired blocks
    const validBlocks = show.blockedSeats.filter(
        (block) => block.blockedAt > tenMinutesAgo
    );
    
    // Get seats that were in expired blocks
    const expiredBlockSeats = show.blockedSeats
        .filter((block) => block.blockedAt <= tenMinutesAgo)
        .map((block) => block.seat);

    // Remove expired blocks and their seats from bookedSeats
    if (expiredBlockSeats.length > 0) {
        await showModel.findByIdAndUpdate(showId, {
            blockedSeats: validBlocks,
            $pull: { bookedSeats: { $in: expiredBlockSeats } },
        });
    } else if (show.blockedSeats.length !== validBlocks.length) {
        // Update blockedSeats even if no seats to remove from bookedSeats
        await showModel.findByIdAndUpdate(showId, {
            blockedSeats: validBlocks,
        });
    }
};

// blockSeats - Temporarily block seats for 10 minutes
const blockSeats = async (req, res) => {
    try {
        const { showId, seats, userId } = req.body;

        if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).send({
                success: false,
                message: "showId and seats array are required",
            });
        }

        // Clean expired blocks first
        await cleanExpiredBlocks(showId);

        const show = await showModel.findById(showId);
        if (!show) {
            return res.status(404).send({
                success: false,
                message: "Show not found",
            });
        }

        // Check if any of the requested seats are already booked or blocked
        const unavailableSeats = [];
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

        for (const seat of seats) {
            // Check if seat is already booked
            if (show.bookedSeats.includes(seat)) {
                // Check if it's blocked by someone else (not expired)
                const block = show.blockedSeats.find(
                    (b) => b.seat === seat && b.blockedAt > tenMinutesAgo
                );
                if (block && block.userId.toString() !== userId) {
                    unavailableSeats.push(seat);
                } else if (!block) {
                    // Seat is permanently booked
                    unavailableSeats.push(seat);
                }
            }
        }

        if (unavailableSeats.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Some seats are no longer available",
                unavailableSeats,
            });
        }

        // Remove existing blocks for these seats by this user (if any)
        const existingBlocks = show.blockedSeats.filter(
            (block) => block.userId.toString() === userId && seats.includes(block.seat)
        );
        
        // Add new blocks and update bookedSeats
        const newBlocks = seats.map((seat) => ({
            seat,
            userId,
            blockedAt: now,
        }));

        // Remove old blocks for these seats and add new ones
        const updatedBlockedSeats = show.blockedSeats.filter(
            (block) => !(block.userId.toString() === userId && seats.includes(block.seat))
        );
        updatedBlockedSeats.push(...newBlocks);

        // Add seats to bookedSeats if not already there
        const seatsToAdd = seats.filter((seat) => !show.bookedSeats.includes(seat));

        await showModel.findByIdAndUpdate(showId, {
            blockedSeats: updatedBlockedSeats,
            $addToSet: { bookedSeats: { $each: seatsToAdd } },
        });

        res.send({
            success: true,
            message: "Seats blocked successfully. You have 10 minutes to complete payment.",
            data: {
                showId,
                seats,
                blockedUntil: new Date(now.getTime() + 10 * 60 * 1000),
            },
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// bookSeats - Book seats with overbooking prevention (called after payment)
const bookSeats = async (req, res) => {
    try {
        // userId comes from JWT middleware, seats & showId from frontend
        const { showId, seats, transactionId, userId } = req.body;

        // Clean expired blocks first
        await cleanExpiredBlocks(showId);

        // Verify that seats are blocked by this user and not expired
        const show = await showModel.findById(showId);
        if (!show) {
            return res.status(404).send({
                success: false,
                message: "Show not found",
            });
        }

        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

        // Check if all seats are blocked by this user and not expired
        const invalidSeats = [];
        for (const seat of seats) {
            const block = show.blockedSeats.find(
                (b) => b.seat === seat && b.userId.toString() === userId && b.blockedAt > tenMinutesAgo
            );
            
            if (!block) {
                // Check if seat is already permanently booked
                if (show.bookedSeats.includes(seat)) {
                    const existingBlock = show.blockedSeats.find((b) => b.seat === seat);
                    if (!existingBlock || existingBlock.userId.toString() !== userId) {
                        invalidSeats.push(seat);
                    }
                } else {
                    invalidSeats.push(seat);
                }
            }
        }

        if (invalidSeats.length > 0) {
            return res.status(400).send({
                success: false,
                message: "One or more seats are no longer blocked or available. Please select seats again.",
                invalidSeats,
            });
        }

        // Remove blocks for these seats (they're being confirmed)
        // The seats are already in bookedSeats from the block operation, so we just remove the blocks
        const updatedBlockedSeats = show.blockedSeats.filter(
            (block) => !(block.userId.toString() === userId && seats.includes(block.seat))
        );

        // Atomic Update: Remove from blockedSeats (seats already in bookedSeats from blocking)
        // Also verify that seats are still blocked by this user (not taken by someone else)
        const seatsStillBlockedByUser = seats.every((seat) => {
            const block = show.blockedSeats.find(
                (b) => b.seat === seat && b.userId.toString() === userId && b.blockedAt > tenMinutesAgo
            );
            return !!block;
        });

        if (!seatsStillBlockedByUser) {
            return res.status(400).send({
                success: false,
                message: "One or more seats are no longer blocked by you. Please select seats again.",
            });
        }

        const updatedShow = await showModel.findByIdAndUpdate(
            showId,
            {
                blockedSeats: updatedBlockedSeats, // Remove blocks - seats remain in bookedSeats
            },
            { new: true }
        );

        if (!updatedShow) {
            return res.status(400).send({
                success: false,
                message: "Failed to confirm booking. Please try again.",
            });
        }

        // Create booking record (only if step 2 succeeded)
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
    blockSeats,
    bookSeats,
    getBookingsByUser,
    cancelBooking,
    makePayment,
};
