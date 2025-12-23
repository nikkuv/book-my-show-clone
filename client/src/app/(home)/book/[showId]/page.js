"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Typography,
    Card,
    Button,
    notification,
    Spin,
    Divider,
    Tag,
    Modal,
    Result,
} from "antd";
import {
    ClockCircleOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { GetShowById } from "../../../../../services/theatre";
import { BookSeats } from "../../../../../services/booking";
import SeatSelection from "@/components/Booking/SeatSelection";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import styles from "./book.module.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/Booking/CheckoutForm";

const { Title, Text } = Typography;

// Initialize Stripe
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
            notification.error({ message: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShow();
    }, [params.showId]);

    const handleBookClick = () => {
        if (selectedSeats.length === 0) {
            notification.warning({ message: "Please select at least one seat" });
            return;
        }
        setIsPaymentModalOpen(true);
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
                setIsPaymentModalOpen(false);
            } else {
                notification.error({ message: response.message });
            }
        } catch (error) {
            notification.error({ message: error.message });
        } finally {
            setBooking(false);
        }
    };

    const totalAmount = selectedSeats.length * (show?.ticketPrice || 0);

    if (loading) {
        return (
            <ProtectedRoute>
                <Header />
                <div className={styles.loadingContainer}>
                    <Spin size="large" />
                </div>
            </ProtectedRoute>
        );
    }

    if (bookingSuccess) {
        return (
            <ProtectedRoute>
                <Header />
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
                                onClick={() => router.push("/profile")}
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
            <Header />
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
                            bookedSeats={show.bookedSeats || []}
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
                                className={styles.bookButton}
                                onClick={handleBookClick}
                                disabled={selectedSeats.length === 0}
                            >
                                Book Now
                            </Button>
                        </Card>

                        <Modal
                            title="Complete Payment"
                            open={isPaymentModalOpen}
                            onCancel={() => setIsPaymentModalOpen(false)}
                            footer={null}
                        >
                            <Elements stripe={stripePromise}>
                                <CheckoutForm
                                    totalAmount={totalAmount}
                                    onSuccess={onPaymentSuccess}
                                />
                            </Elements>
                        </Modal>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}
