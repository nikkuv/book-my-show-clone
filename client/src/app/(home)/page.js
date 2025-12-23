"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Card, Typography, notification, Input, Tag } from "antd";
import {
  ClockCircleOutlined,
  SearchOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import Loader from "@/components/Loader/Loader";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import { GetAllMovies } from "../../../services/movies";
import { showLoading, hideLoading } from "@/redux/loaderSlice";
import styles from "./home.module.css";

const { Title, Text } = Typography;
const { Search } = Input;

export default function BookMyShow() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.loader);
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMovies = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllMovies();
      if (response.success) {
        setMovies(response.data);
      } else {
        notification.error({ message: response.message });
      }
    } catch (error) {
      notification.error({ message: error.message });
    } finally {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMovieClick = (movieId) => {
    router.push(`/movie/${movieId}`);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <ProtectedRoute>
          <Header />
          <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
              <Title level={2}>Now Showing</Title>
              <Text type="secondary">
                Book your favorite movies at the best theatres
              </Text>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
              <Search
                placeholder="Search movies by title, genre, or language..."
                prefix={<SearchOutlined />}
                size="large"
                allowClear
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Movies Grid */}
            <Row gutter={[24, 24]}>
              {filteredMovies.map((movie) => (
                <Col xs={12} sm={8} md={6} lg={4} key={movie._id}>
                  <Card
                    hoverable
                    className={styles.movieCard}
                    cover={
                      <div className={styles.posterContainer}>
                        <img
                          alt={movie.title}
                          src={movie.poster}
                          className={styles.poster}
                        />
                        <div className={styles.overlay}>
                          <button
                            className={styles.bookButton}
                            onClick={() => handleMovieClick(movie._id)}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    }
                    onClick={() => handleMovieClick(movie._id)}
                  >
                    <Card.Meta
                      title={movie.title}
                      description={
                        <div className={styles.movieMeta}>
                          <div className={styles.tags}>
                            <Tag color="blue" size="small">
                              {movie.genre}
                            </Tag>
                          </div>
                          <div className={styles.info}>
                            <span>
                              <GlobalOutlined /> {movie.language}
                            </span>
                            <span>
                              <ClockCircleOutlined /> {movie.duration} min
                            </span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {filteredMovies.length === 0 && (
              <div className={styles.noResults}>
                <Text type="secondary">
                  No movies found matching your search.
                </Text>
              </div>
            )}
          </div>
        </ProtectedRoute>
      )}
    </>
  );
}
