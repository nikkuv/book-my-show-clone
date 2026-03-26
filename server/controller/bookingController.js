const bookingModel = require("../models/bookingModal");
const showModel = require("../models/showModal");
const crypto = require("crypto");
const Razorpay = require("razorpay");

// Helper function to clean expired blocks (older than 10 minutes)
const cleanExpiredBlocks = async (showId) => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const show = await showModel.findById(showId);
    
    if (!show) return;

    // Filter out expired blocks
    const validBlocks = show.blockedSeats.filter(
        (block) => block.blockedAt > tenMinutesAgo
    );
    
    // Remove expired temporary blocks only
    if (show.blockedSeats.length !== validBlocks.length) {
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
        
        // Add new temporary blocks only (do not mark as booked yet)
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

        await showModel.findByIdAndUpdate(showId, {
            blockedSeats: updatedBlockedSeats,
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

        // Remove temporary blocks for these seats and confirm into bookedSeats
        const updatedBlockedSeats = show.blockedSeats.filter(
            (block) => !(block.userId.toString() === userId && seats.includes(block.seat))
        );

        // Atomic update and verify seats are still blocked by this user
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
                blockedSeats: updatedBlockedSeats,
                $addToSet: { bookedSeats: { $each: seats } },
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

// cancelBooking - Cancel a booking and release seats (only upcoming shows)
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await bookingModel.findById(bookingId).populate("show", "date time");
        if (!booking) {
            return res.status(404).send({ success: false, message: "Booking not found" });
        }

        // Only allow cancelling upcoming shows
        const showDateTime = new Date(booking.show.date);
        const [timeMatch, hour, min, period] = (booking.show.time || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i) || [];
        if (timeMatch) {
            let h = parseInt(hour, 10);
            const m = parseInt(min, 10);
            if (period && period.toUpperCase() === "PM" && h < 12) h += 12;
            if (period && period.toUpperCase() === "AM" && h === 12) h = 0;
            showDateTime.setHours(h, m, 0, 0);
        }
        if (showDateTime <= new Date()) {
            return res.status(400).send({
                success: false,
                message: "Cannot cancel a past show",
            });
        }

        // Update booking status
        await bookingModel.findByIdAndUpdate(bookingId, { status: "cancelled" });

        // Release seats from the show and clear any stale blocks for those seats
        const showDoc = await showModel.findById(booking.show);
        const updatedBlockedSeats = (showDoc?.blockedSeats || []).filter(
            (block) => !booking.seats.includes(block.seat)
        );
        await showModel.findByIdAndUpdate(booking.show, {
            $pull: { bookedSeats: { $in: booking.seats } },
            blockedSeats: updatedBlockedSeats,
        });

        res.send({ success: true, message: "Booking cancelled successfully" });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// makePayment - Create Razorpay Order
const makePayment = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) {
            return res.status(400).send({
                success: false,
                message: "Valid amount is required",
            });
        }

        if (!process.env.RAZORPAY_API_KEY || !process.env.RAZORPAY_API_SECRET) {
            return res.status(500).send({
                success: false,
                message: "Razorpay keys are not configured. Please set RAZORPAY_API_KEY and RAZORPAY_API_SECRET.",
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_API_KEY,
            key_secret: process.env.RAZORPAY_API_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: Math.round(Number(amount)),
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        });

        res.send({
            success: true,
            message: "Razorpay order created",
            data: {
                key: process.env.RAZORPAY_API_KEY,
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
            },
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// verifyPayment - Verify Razorpay payment signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).send({
                success: false,
                message: "Payment verification fields are required",
            });
        }

        if (!process.env.RAZORPAY_API_SECRET) {
            return res.status(500).send({
                success: false,
                message: "Razorpay secret is not configured",
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const isValid = expectedSignature === razorpay_signature;
        if (!isValid) {
            return res.status(400).send({
                success: false,
                message: "Invalid payment signature",
            });
        }

        return res.send({
            success: true,
            message: "Payment verified successfully",
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    blockSeats,
    bookSeats,
    getBookingsByUser,
    cancelBooking,
    makePayment,
    verifyPayment,
};
