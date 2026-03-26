"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
    Typography,
    Card,
    Button,
    notification,
    Spin,
    Divider,
    Tag,
    Result,
} from "antd";
import {
    ClockCircleOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { GetShowById } from "../../../../../services/theatre";
import {
    BlockSeats,
    BookSeats,
    MakePayment,
    VerifyPayment,
} from "../../../../../services/booking";
import SeatSelection from "@/components/Booking/SeatSelection";
import ProtectedRoute from "@/components/ProtectedRoute";
import styles from "./book.module.css";
import {
    isNetworkErrorMessage,
    notifyNetworkError,
} from "../../../../../utils/notifyApiError";

const { Title, Text } = Typography;

const BLOCK_DURATION_MINUTES = 10;

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useSelector((state) => state.users);
    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const fetchShow = async () => {
        try {
            setLoading(true);
            const response = await GetShowById({ showId: params.showId });
            if (response.success) {
                setShow(response.data);
            } else {
                notification.error({ message: response.message });
            }
        } catch (error) {
            if (isNetworkErrorMessage(error?.message)) {
                notifyNetworkError(error.message);
            } else {
                notification.error({ message: error.message });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShow();
    }, [params.showId]);

    const loadRazorpayScript = () =>
        new Promise((resolve) => {
            if (typeof window === "undefined") return resolve(false);
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handleBookClick = async () => {
        if (selectedSeats.length === 0) {
            notification.warning({ message: "Please select at least one seat" });
            return;
        }
        if (!user?._id) {
            notification.error({ message: "Please log in to continue" });
            return;
        }
        try {
            setBooking(true);
            const blockResponse = await BlockSeats({
                showId: params.showId,
                seats: selectedSeats,
                userId: user._id,
            });
            if (!blockResponse.success) {
                notification.error({
                    message: blockResponse.message || "Could not reserve seats",
                    description: blockResponse.unavailableSeats
                        ? `Seats ${blockResponse.unavailableSeats.join(", ")} are no longer available.`
                        : undefined,
                });
                return;
            }

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                notification.error({
                    message: "Unable to load Razorpay checkout. Please try again.",
                });
                return;
            }

            const paymentResponse = await MakePayment({
                amount: totalAmount * 100, // INR to paise
            });

            if (!paymentResponse.success) {
                notification.error({
                    message: paymentResponse.message || "Could not initiate payment",
                });
                return;
            }

            setBooking(false);
            const options = {
                key: paymentResponse.data.key,
                amount: paymentResponse.data.amount,
                currency: paymentResponse.data.currency,
                order_id: paymentResponse.data.orderId,
                name: "BookMyShow Clone",
                description: `${show?.movie?.title || "Movie"} tickets`,
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: { color: "#f84464" },
                modal: {
                    ondismiss: () => {
                        notification.info({
                            message:
                                "Payment cancelled. Seats are blocked for up to 10 minutes.",
                        });
                    },
                },
                handler: async (response) => {
                    const verifyResponse = await VerifyPayment(response);
                    if (!verifyResponse.success) {
                        notification.error({
                            message:
                                verifyResponse.message || "Payment verification failed",
                        });
                        return;
                    }
                    await onPaymentSuccess(response.razorpay_payment_id);
                },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            const m = err.message || "Failed to block seats";
            if (isNetworkErrorMessage(m)) notifyNetworkError(m);
            else notification.error({ message: m });
        } finally {
            setBooking(false);
        }
    };

    const onPaymentSuccess = async (transactionId) => {
        try {
            setBooking(true);
            const response = await BookSeats({
                showId: params.showId,
                seats: selectedSeats,
                transactionId,
            });

            if (response.success) {
                setBookingSuccess(true);
            } else {
                notification.error({ message: response.message });
            }
        } catch (error) {
            if (isNetworkErrorMessage(error?.message)) {
                notifyNetworkError(error.message);
            } else {
                notification.error({ message: error.message });
            }
        } finally {
            setBooking(false);
        }
    };

    const totalAmount = selectedSeats.length * (show?.ticketPrice || 0);

    const unavailableSeats = useMemo(() => {
        if (!show) return [];
        const booked = show.bookedSeats || [];
        const blockedByOthers = (show.blockedSeats || [])
            .filter((b) => {
                const blockedAt = new Date(b.blockedAt).getTime();
                const expiry = BLOCK_DURATION_MINUTES * 60 * 1000;
                const isExpired = Date.now() - blockedAt > expiry;
                const isCurrentUser = user && b.userId && String(b.userId) === String(user._id);
                return !isExpired && !isCurrentUser;
            })
            .map((b) => b.seat);
        return [...new Set([...booked, ...blockedByOthers])];
    }, [show, user]);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                </div>
            </ProtectedRoute>
        );
    }

    if (bookingSuccess) {
        return (
            <ProtectedRoute>
                <div className={styles.container}>
                    <Result
                        status="success"
                        title="Booking Confirmed!"
                        subTitle={`Your seats ${selectedSeats.join(
                            ", "
                        )} have been booked successfully.`}
                        extra={[
                            <Button
                                type="primary"
                                key="bookings"
                                onClick={() => router.push("/bookings")}
                            >
                                View My Bookings
                            </Button>,
                            <Button key="home" onClick={() => router.push("/")}>
                                Go Home
                            </Button>,
                        ]}
                    />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                {show && (
                    <>
                        {/* Show Info Header */}
                        <Card className={styles.showInfo}>
                            <div className={styles.showHeader}>
                                <div className={styles.movieInfo}>
                                    <Title level={3}>{show.movie?.title}</Title>
                                    <div className={styles.tags}>
                                        <Tag color="blue">{show.movie?.language}</Tag>
                                        <Tag color="green">{show.movie?.genre}</Tag>
                                    </div>
                                </div>
                                <div className={styles.showDetails}>
                                    <div className={styles.detailItem}>
                                        <EnvironmentOutlined />
                                        <Text>{show.theatre?.name}</Text>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <CalendarOutlined />
                                        <Text>
                                            {dayjs(show.date).format("ddd, MMM DD, YYYY")}
                                        </Text>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <ClockCircleOutlined />
                                        <Text>{show.time}</Text>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Divider />

                        {/* Seat Selection */}
                        <Title level={4}>Select Your Seats</Title>
                        <SeatSelection
                            totalSeats={show.totalSeats}
                            bookedSeats={unavailableSeats}
                            selectedSeats={selectedSeats}
                            onSeatSelect={setSelectedSeats}
                        />

                        <Divider />

                        {/* Booking Summary */}
                        <Card className={styles.summary}>
                            <div className={styles.summaryContent}>
                                <div className={styles.summaryRow}>
                                    <Text>Selected Seats:</Text>
                                    <Text strong>
                                        {selectedSeats.length > 0
                                            ? selectedSeats.sort((a, b) => a - b).join(", ")
                                            : "None"}
                                    </Text>
                                </div>
                                <div className={styles.summaryRow}>
                                    <Text>Number of Tickets:</Text>
                                    <Text strong>{selectedSeats.length}</Text>
                                </div>
                                <div className={styles.summaryRow}>
                                    <Text>Price per Ticket:</Text>
                                    <Text strong>₹{show.ticketPrice}</Text>
                                </div>
                                <Divider />
                                <div className={styles.summaryRow}>
                                    <Title level={4}>Total Amount:</Title>
                                    <Title level={4} type="success">
                                        ₹{totalAmount}
                                    </Title>
                                </div>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                block
                                loading={booking}
                                className={styles.bookButton}
                                onClick={handleBookClick}
                                disabled={selectedSeats.length === 0 || booking}
                            >
                                Book Now
                            </Button>
                        </Card>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}
