import { axiosInstance } from ".";

// Block seats temporarily (10 min) - call before opening payment
export const BlockSeats = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/app/v1/bookings/block",
            payload
        );
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message };
    }
};

// Book seats for a show (after payment success)
export const BookSeats = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/app/v1/bookings/book-seats",
            payload
        );
        return response.data;
    } catch (error) {
        return error.response;
    }
};

// Get all bookings for current user
export const GetBookingsByUser = async () => {
    try {
        const response = await axiosInstance.get("/app/v1/bookings/get-bookings");
        return response.data;
    } catch (error) {
        return error.response;
    }
};

// Cancel a booking
export const CancelBooking = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/app/v1/bookings/cancel-booking",
            payload
        );
        return response.data;
    } catch (error) {
        return error.response;
    }
};

// Make Payment
export const MakePayment = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/app/v1/bookings/make-payment",
            payload
        );
        return response.data;
    } catch (error) {
        return error.response;
    }
};
