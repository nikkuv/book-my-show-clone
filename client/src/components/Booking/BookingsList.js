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
import { GetBookingsByUser, CancelBooking } from "../../../services/booking";
import styles from "@/app/(home)/bookings/bookings.module.css";

const { Title, Text } = Typography;

const BookingsList = () => {
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
                fetchBookings();
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

    const isShowPast = (booking) => {
        if (!booking?.show?.date) return false;
        const showDate = dayjs(booking.show.date);
        const timeStr = booking.show.time || "";
        const [, hour, min, period] = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i) || [];
        let showDateTime = showDate;
        if (hour !== undefined) {
            let h = parseInt(hour, 10);
            const m = parseInt(min || "0", 10);
            if (period && period.toUpperCase() === "PM" && h < 12) h += 12;
            if (period && period.toUpperCase() === "AM" && h === 12) h = 0;
            showDateTime = showDate.hour(h).minute(m).second(0).millisecond(0);
        }
        return showDateTime.isBefore(dayjs());
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <Empty
                description="No bookings found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
                <Button type="primary" onClick={() => router.push("/")}>
                    Browse Movies
                </Button>
            </Empty>
        );
    }

    return (
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

                            {booking.status === "confirmed" &&
                                (isShowPast(booking) ? (
                                    <Button
                                        danger
                                        size="small"
                                        disabled
                                        title="Past shows cannot be cancelled."
                                    >
                                        Cancel
                                    </Button>
                                ) : (
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
                                ))}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default BookingsList;
