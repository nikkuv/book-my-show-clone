"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Typography,
    Card,
    Row,
    Col,
    Tag,
    Button,
    notification,
    Spin,
    Empty,
    Popconfirm,
} from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { GetBookingsByUser, CancelBooking } from "../../../../services/booking";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import styles from "./bookings.module.css";

const { Title, Text } = Typography;

export default function BookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await GetBookingsByUser();
            if (response.success) {
                setBookings(response.data);
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
        fetchBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        try {
            const response = await CancelBooking({ bookingId });
            if (response.success) {
                notification.success({ message: "Booking cancelled successfully" });
                fetchBookings(); // Refresh the list
            } else {
                notification.error({ message: response.message });
            }
        } catch (error) {
            notification.error({ message: error.message });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "confirmed":
                return "success";
            case "cancelled":
                return "error";
            case "pending":
                return "warning";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "confirmed":
                return <CheckCircleOutlined />;
            case "cancelled":
                return <CloseCircleOutlined />;
            default:
                return null;
        }
    };

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

    return (
        <ProtectedRoute>
            <Header />
            <div className={styles.container}>
                <Title level={2}>My Bookings</Title>

                {bookings.length === 0 ? (
                    <Empty
                        description="No bookings found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" onClick={() => router.push("/")}>
                            Browse Movies
                        </Button>
                    </Empty>
                ) : (
                    <Row gutter={[16, 16]}>
                        {bookings.map((booking) => (
                            <Col xs={24} sm={24} md={12} lg={8} key={booking._id}>
                                <Card className={styles.bookingCard} hoverable>
                                    <div className={styles.cardHeader}>
                                        <img
                                            src={booking.show?.movie?.poster}
                                            alt={booking.show?.movie?.title}
                                            className={styles.poster}
                                        />
                                        <div className={styles.movieDetails}>
                                            <Title level={5}>{booking.show?.movie?.title}</Title>
                                            <Tag
                                                color={getStatusColor(booking.status)}
                                                icon={getStatusIcon(booking.status)}
                                            >
                                                {booking.status?.toUpperCase()}
                                            </Tag>
                                        </div>
                                    </div>

                                    <div className={styles.bookingDetails}>
                                        <div className={styles.detailRow}>
                                            <EnvironmentOutlined />
                                            <Text>{booking.show?.theatre?.name}</Text>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <CalendarOutlined />
                                            <Text>
                                                {dayjs(booking.show?.date).format("ddd, MMM DD, YYYY")}
                                            </Text>
                                        </div>
                                        <div className={styles.detailRow}>
                                            <ClockCircleOutlined />
                                            <Text>{booking.show?.time}</Text>
                                        </div>
                                    </div>

                                    <div className={styles.seatsInfo}>
                                        <Text type="secondary">Seats: </Text>
                                        <Text strong>
                                            {booking.seats?.sort((a, b) => a - b).join(", ")}
                                        </Text>
                                    </div>

                                    <div className={styles.footer}>
                                        <div className={styles.amount}>
                                            <Text type="secondary">Total: </Text>
                                            <Text strong className={styles.price}>
                                                ₹{booking.seats?.length * (booking.show?.ticketPrice || 0)}
                                            </Text>
                                        </div>

                                        {booking.status === "confirmed" && (
                                            <Popconfirm
                                                title="Cancel Booking"
                                                description="Are you sure you want to cancel this booking?"
                                                onConfirm={() => handleCancelBooking(booking._id)}
                                                okText="Yes, Cancel"
                                                cancelText="No"
                                            >
                                                <Button danger size="small">
                                                    Cancel
                                                </Button>
                                            </Popconfirm>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </ProtectedRoute>
    );
}
