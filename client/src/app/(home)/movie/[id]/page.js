"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Typography,
    Row,
    Col,
    Card,
    DatePicker,
    notification,
    Spin,
    Tag,
    Button,
    Divider,
} from "antd";
import {
    ClockCircleOutlined,
    CalendarOutlined,
    GlobalOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { GetMovieById } from "../../../../../services/movies";
import { GetAllTheatresByMovie } from "../../../../../services/theatre";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import styles from "./movie.module.css";

const { Title, Text, Paragraph } = Typography;

export default function MoviePage() {
    const params = useParams();
    const router = useRouter();
    const [movie, setMovie] = useState(null);
    const [theatres, setTheatres] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [loading, setLoading] = useState(true);

    const fetchMovie = async () => {
        try {
            const response = await GetMovieById(params.id);
            if (response.success) {
                setMovie(response.data);
            } else {
                notification.error({ message: response.message });
            }
        } catch (error) {
            notification.error({ message: error.message });
        }
    };

    const fetchTheatres = async (date) => {
        try {
            setLoading(true);
            const response = await GetAllTheatresByMovie({
                movie: params.id,
                date: date.format("YYYY-MM-DD"),
            });
            if (response.success) {
                setTheatres(response.data);
            } else {
                setTheatres([]);
            }
        } catch (error) {
            notification.error({ message: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovie();
    }, [params.id]);

    useEffect(() => {
        if (selectedDate) {
            fetchTheatres(selectedDate);
        }
    }, [selectedDate, params.id]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleShowClick = (showId) => {
        router.push(`/book/${showId}`);
    };

    if (!movie && loading) {
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
                {movie && (
                    <>
                        {/* Movie Details Section */}
                        <div className={styles.movieHeader}>
                            <Row gutter={[24, 24]}>
                                <Col xs={24} sm={8} md={6}>
                                    <img
                                        src={movie.poster}
                                        alt={movie.title}
                                        className={styles.poster}
                                    />
                                </Col>
                                <Col xs={24} sm={16} md={18}>
                                    <Title level={2}>{movie.title}</Title>
                                    <div className={styles.movieMeta}>
                                        <Tag color="blue" icon={<ClockCircleOutlined />}>
                                            {movie.duration} mins
                                        </Tag>
                                        <Tag color="green">{movie.genre}</Tag>
                                        <Tag color="purple" icon={<GlobalOutlined />}>
                                            {movie.language}
                                        </Tag>
                                        <Tag color="orange" icon={<CalendarOutlined />}>
                                            {dayjs(movie.releaseDate).format("MMM DD, YYYY")}
                                        </Tag>
                                    </div>
                                    <Paragraph className={styles.description}>
                                        {movie.description}
                                    </Paragraph>
                                </Col>
                            </Row>
                        </div>

                        <Divider />

                        {/* Date Selection */}
                        <div className={styles.dateSection}>
                            <Title level={4}>Select Date</Title>
                            <DatePicker
                                value={selectedDate}
                                onChange={handleDateChange}
                                disabledDate={(current) =>
                                    current && current < dayjs().startOf("day")
                                }
                                format="ddd, MMM DD"
                                size="large"
                            />
                        </div>

                        <Divider />

                        {/* Theatres & Shows */}
                        <div className={styles.theatreSection}>
                            <Title level={4}>Available Theatres</Title>
                            {loading ? (
                                <div className={styles.loadingContainer}>
                                    <Spin />
                                </div>
                            ) : theatres.length === 0 ? (
                                <Text type="secondary">
                                    No shows available for this date. Please select another date.
                                </Text>
                            ) : (
                                <div className={styles.theatreList}>
                                    {theatres.map((theatre) => (
                                        <Card key={theatre._id} className={styles.theatreCard}>
                                            <div className={styles.theatreInfo}>
                                                <Title level={5}>{theatre.name}</Title>
                                                <Text type="secondary">{theatre.address}</Text>
                                            </div>
                                            <div className={styles.showTimes}>
                                                {theatre.shows?.map((show) => (
                                                    <Button
                                                        key={show._id}
                                                        type="default"
                                                        className={styles.showButton}
                                                        onClick={() => handleShowClick(show._id)}
                                                    >
                                                        {show.time}
                                                        <span className={styles.price}>
                                                            ₹{show.ticketPrice}
                                                        </span>
                                                    </Button>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </ProtectedRoute>
    );
}
