"use client";

import { Table, notification, Flex, Button } from "antd";
import { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { showLoading, hideLoading } from "@/redux/loaderSlice";
import { GetAllMovies, DeleteMovie } from "../../../services/movies";
import { useDispatch } from "react-redux";
import moment from "moment";

const MoviesList = () => {
  const [movies, setMovies] = useState([]);

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
        return (
          <img
            src={record?.poster}
            alt="Poster"
            height="60"
            width="80"
          />
        );
      },
    },
    {
      title: "Name",
      dataIndex: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Duration",
      dataIndex: "duration",
    },
    {
      title: "Genre",
      dataIndex: "genre",
    },
    {
      title: "Language",
      dataIndex: "language",
    },
    {
      title: "Release Date",
      dataIndex: "releaseDate",
      render: (_, record) => {
        return moment(record?.releaseDate).format("DD-MM-YYYY");
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => {
        return (
          <Flex gap={8}>
            <Button type="text" >
              <EditOutlined />
            </Button>
            <Button type="text" onClick={() => handleDelete(record._id)} >
              <DeleteOutlined />
            </Button>
          </Flex>
          // <div className="flex gap-1">
          //   <i
          //     className="ri-pencil-line"
          //     onClick={() => {
          //       setSelectedMovie(record);
          //       setFormType("edit");
          //       setShowMovieFormModal(true);
          //     }}
          //   ></i>
          // </div>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return <Table dataSource={movies} columns={columns} />;
};

export default MoviesList;
