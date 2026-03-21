"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Typography, notification, Spin } from "antd";
import {
  ClockCircleOutlined,
  GlobalOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useSearch } from "@/components/Header/SearchContext";
import { GetAllMovies } from "../../../services/movies";
import {
  isNetworkErrorMessage,
  notifyNetworkError,
} from "../../../utils/notifyApiError";
import styles from "./home.module.css";

const { Title, Text } = Typography;

export default function BookMyShow() {
  const router = useRouter();
  const { query: searchQuery } = useSearch();
  const [movies, setMovies] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await GetAllMovies();
        if (cancelled) return;
        if (response.success) {
          setMovies(response.data);
        } else {
          const msg = response.message || "Could not load movies";
          if (isNetworkErrorMessage(msg)) notifyNetworkError(msg);
          else notification.error({ message: msg });
        }
      } catch (error) {
        if (cancelled) return;
        if (isNetworkErrorMessage(error?.message)) notifyNetworkError(error.message);
        else notification.error({ message: error.message });
      } finally {
        if (!cancelled) setMoviesLoading(false);
      }
    })();

    return () => { cancelled = true; };
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
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <Title level={4} className={styles.sectionTitle}>
          Recommended Movies
        </Title>
        {movies.length > 0 && (
          <a className={styles.seeAll}>
            See All <RightOutlined />
          </a>
        )}
      </div>

      {moviesLoading ? (
        <div className={styles.loadingState}>
          <Spin size="large" />
        </div>
      ) : (
        <div className={styles.movieGrid}>
          {filteredMovies.map((movie) => (
            <div
              key={movie._id}
              className={styles.movieCard}
              onClick={() => handleMovieClick(movie._id)}
            >
              <div className={styles.posterContainer}>
                <img
                  alt={movie.title}
                  src={movie.poster}
                  className={styles.poster}
                />
                <div className={styles.posterOverlay}>
                  <div className={styles.movieMeta}>
                    <span><GlobalOutlined /> {movie.language}</span>
                    <span><ClockCircleOutlined /> {movie.duration} min</span>
                  </div>
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.movieTitle}>{movie.title}</h3>
                <span className={styles.genre}>{movie.genre}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!moviesLoading && filteredMovies.length === 0 && (
        <div className={styles.emptyState}>
          <Text type="secondary">
            {searchQuery
              ? "No movies found matching your search."
              : "No movies available right now."}
          </Text>
        </div>
      )}
    </div>
  );
}
