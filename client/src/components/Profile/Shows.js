"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Divider,
  Flex,
  Modal,
  Typography,
  notification,
  Table,
  Row,
  Col,
  Input,
  Select,
} from "antd";
import { Form, Formik } from "formik";
import { useDispatch } from "react-redux";
import {
  GetAllShowsByTheatre,
  AddShow,
  DeleteShow,
} from "../../../services/theatre";
import { GetAllMovies } from "../../../services/movies";
import { showLoading, hideLoading } from "@/redux/loaderSlice";
import { DeleteOutlined } from "@ant-design/icons";
import styles from "../../app/(auth)/auth.module.css";
import moment from "moment";

import * as Yup from "yup";
import clsx from "clsx";

const { Text, Title } = Typography;

const Shows = ({ openShowsModal, setOpenShowsModal, theatre }) => {
  let [view, setView] = useState("table");
  let [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);

  const dispatch = useDispatch();

  const initialValues = {
    name: "",
    date: null,
    time: null,
    movie: "",
    ticketPrice: null,
    totalSeats: null,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Show name is required"),
    date: Yup.date().required("Show date is required"),
    time: Yup.string().required("Show time is required"),
    movie: Yup.string().required("Please select movie!"),
    ticketPrice: Yup.number()
      .required("Ticket price is required")
      .positive()
      .integer(),
    totalSeats: Yup.number()
      .required("Total seats is required")
      .positive()
      .integer(),
  });

  const getData = async () => {
    try {
      dispatch(showLoading());
      const moviesResponse = await GetAllMovies();
      if (moviesResponse.success) {
        setMovies(moviesResponse.data);
      } else {
        notification.error({ message: moviesResponse.message });
      }

      const showsResponse = await GetAllShowsByTheatre({
        theatreId: theatre._id,
      });
      if (showsResponse.success) {
        setShows(showsResponse.data);
      } else {
        notification.error({ message: showsResponse.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      notification.error({ message: error.message });
      dispatch(hideLoading());
    }
  };

  const handleAddShow = async (values) => {
    try {
      dispatch(showLoading());
      const response = await AddShow({
        ...values,
        theatre: theatre._id,
      });

      if (response.success) {
        notification.success({ message: response.message });
        getData();
        setView("table");
      } else {
        notification.error({ message: response.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      notification.error({ message: error.message });
      dispatch(hideLoading());
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(showLoading());
      const response = await DeleteShow({ showId: id });
      if (response.success) {
        notification.success({ message: response.message });
        getData();
      } else {
        notification.error({ message: response.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      notification.error({ message: error.message });
      dispatch(hideLoading());
    }
  };

  const columns = [
    {
      title: "Show Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => {
        return moment(text).format("MMM DD YYYY");
      },
      key: "date",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Movie",
      dataIndex: "movie",
      render: (text, record) => {
        return record.movie.title;
      },
      key: "movie",
    },
    {
      title: "Ticket Price",
      dataIndex: "ticketPrice",
      key: "ticketPrice",
    },
    {
      title: "Total Seats",
      dataIndex: "totalSeats",
      key: "totalSeats",
    },
    {
      title: "Available Seats",
      dataIndex: "availableSeats",
      render: (text, record) => {
        return record.totalSeats - record.bookedSeats.length;
      },
      key: "availableSeats",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <>
            {record.bookedSeats.length === 0 && (
              <Button type="text" onClick={() => handleDelete(record._id)}>
                <DeleteOutlined />
              </Button>
            )}
          </>
        );
      },
      key: "action",
    },
  ];

  useEffect(() => {
    getData();
  }, []);

  return (
    <Modal
      open={openShowsModal}
      onCancel={() => setOpenShowsModal(false)}
      width={1400}
      footer={null}
    >
      <Title level={4}>Theatre : {theatre?.name}</Title>

      <Divider />

      <Flex gap={8} align="center" justify="space-between">
        <Title level={4}>{view === "table" ? "Shows" : "Add Show"}</Title>
        <Button onClick={() => setView("form")}>Add show</Button>
      </Flex>

      {view === "table" && <Table columns={columns} dataSource={shows} />}
      {view === "form" && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleAddShow}
        >
          {({ errors, touched, values, handleChange, setFieldValue }) => (
            <Form>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Name</Text>
                    <Input
                      name="name"
                      placeholder="Name"
                      value={values.name}
                      onChange={handleChange}
                      className={
                        errors.name && touched.name ? styles.error : null
                      }
                    />
                    {errors.name && touched.name && (
                      <Text type="danger">{errors.name}</Text>
                    )}
                  </Flex>
                </Col>
                <Col span={8}>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Date</Text>
                    <Input
                      type="date"
                      name="date"
                      placeholder="Date"
                      value={values.date}
                      onChange={handleChange}
                      className={
                        errors.date && touched.date ? styles.error : null
                      }
                      format="YYYY-MM-DD"
                    />
                  </Flex>
                </Col>

                <Col span={8}>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Time</Text>
                    <Input
                      type="time"
                      name="time"
                      placeholder="Time"
                      value={values.time}
                      onChange={handleChange}
                      className={
                        errors.time && touched.time ? styles.error : null
                      }
                    />
                  </Flex>
                </Col>

                <Col span={8}>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Movie</Text>
                    <Select
                      name="movie"
                      placeholder="movie"
                      value={values.movie}
                      onChange={(value) => setFieldValue("movie", value)}
                      className={
                        errors.movie && touched.movie ? styles.error : null
                      }
                    >
                      {movies.map((movie) => (
                        <option key={movie._id} value={movie._id}>{movie.title}</option>
                      ))}
                    </Select>
                    {errors.movie && touched.movie && (
                      <Text type="danger">{errors.movie}</Text>
                    )}
                  </Flex>
                </Col>

                <Col span={8}>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Ticker Price</Text>
                    <Input
                      name="ticketPrice"
                      type="number"
                      placeholder="Ticket Price"
                      value={values.ticketPrice}
                      onChange={handleChange}
                      className={
                        errors.ticketPrice && touched.ticketPrice
                          ? styles.error
                          : null
                      }
                    />
                    {errors.ticketPrice && touched.ticketPrice && (
                      <Text type="danger">{errors.ticketPrice}</Text>
                    )}
                  </Flex>
                </Col>

                <Col span={8}>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Total Seats</Text>
                    <Input
                      name="totalSeats"
                      type="number"
                      placeholder="Total Seats"
                      value={values.totalSeats}
                      onChange={handleChange}
                      className={
                        errors.totalSeats && touched.totalSeats
                          ? styles.error
                          : null
                      }
                    />
                    {errors.totalSeats && touched.totalSeats && (
                      <Text type="danger">{errors.totalSeats}</Text>
                    )}
                  </Flex>
                </Col>
              </Row>

              <Flex
                gap={8}
                className={clsx(styles.fullWidth, styles.marginTop)}
                align="end"
                justify="end"
              >
                <Button
                  onClick={() => {
                    setView("table");
                  }}
                >
                  Cancel
                </Button>
                <Button htmlType="submit" type="primary">
                  Save
                </Button>
              </Flex>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
};
export default Shows;
