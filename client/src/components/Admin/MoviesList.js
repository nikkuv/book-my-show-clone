"use client";

import { Table, notification, Flex, Button, Typography } from "antd";
import { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { showLoading, hideLoading } from "@/redux/loaderSlice";
import { GetAllMovies, DeleteMovie } from "../../../services/movies";
import { useDispatch } from "react-redux";
import MovieForm from "./MovieForm";
import moment from "moment";

const { Text, Title } = Typography;

const MoviesList = () => {
  const [showMovieFormModal, setShowMovieFormModal] = useState(false);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formType, setFormType] = useState("add");
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await GetAllMovies();
      if (response.success) {
        setMovies(response.data);
      } else {
        notification.error({ message: response.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      notification.error({ message: error.message });
    }
  };

  const handleDelete = async (movieId) => {
    try {
      dispatch(showLoading());
      const response = await DeleteMovie(movieId);
      if (response.success) {
        notification.success({ message: response.message });
        getData();
      } else {
        notification.error({ message: response.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      notification.error({ message: error.message });
    }
  };

  const columns = [
    {
      title: "Poster",
      dataIndex: "poster",
      render: (_, record) => {
        return <img src={record?.poster} alt="Poster" height="60" width="80" />;
      },
    },
    {
      title: "Name",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
    },
    {
      title: "Release Date",
      dataIndex: "releaseDate",
      render: (_, record) => {
        return moment(record?.releaseDate).format("DD-MM-YYYY");
      },
      key: "releaseDate",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => {
        return (
          <Flex gap={8}>
            <Button
              type="text"
              onClick={() => {
                setSelectedMovie(record);
                setFormType("edit");
                setShowMovieFormModal(true);
              }}
            >
              <EditOutlined />
            </Button>
            <Button type="text" onClick={() => handleDelete(record._id)}>
              <DeleteOutlined />
            </Button>
          </Flex>
        );
      },
      key: "action",
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <Flex align="start" justify="space-between">
        <Title level={4}>Latest Movies</Title>
        <Button
          onClick={() => {
            setShowMovieFormModal(true);
            setFormType("add");
          }}
        >
          Add Movie
        </Button>
      </Flex>
      <Table dataSource={movies} columns={columns} />
      {showMovieFormModal && (
        <MovieForm
          showMovieFormModal={showMovieFormModal}
          setShowMovieFormModal={setShowMovieFormModal}
          selectedMovie={selectedMovie}
          getData={getData}
          formType={formType}
        />
      )}
    </div>
  );
};

export default MoviesList;
