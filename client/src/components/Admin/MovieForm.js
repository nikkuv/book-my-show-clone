"use client";

import { Form, Formik } from "formik";
import {
  Input,
  Typography,
  Flex,
  Button,
  notification,
  Col,
  Row,
  Modal,
  Select
} from "antd";
import * as Yup from "yup";
import moment from "moment";
import styles from "../../app/(auth)/auth.module.css";
import { AddMovie, UpdateMovie } from "../../../services/movies";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "@/redux/loaderSlice";

const { Text, Title } = Typography;

const MovieForm = ({
  showMovieFormModal,
  setShowMovieFormModal,
  selectedMovie,
  getData,
  formType,
}) => {

  const dispatch = useDispatch();

  const initialValues = formType === "edit"
    ? {
        ...selectedMovie,
        releaseDate: selectedMovie.releaseDate ? moment(selectedMovie.releaseDate).format("YYYY-MM-DD") : null,
      }
    : {
        title: "",
        description: "",
        duration: "",
        genre: "",
        language: "",
        releaseDate: null,
        poster: "",
      };

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    duration: Yup.number()
      .required("Duration is required")
      .positive()
      .integer(),
    genre: Yup.string().required("Genre is required"),
    language: Yup.string().required("Language is required"),
    releaseDate: Yup.string().required("Release Date is required"),
    poster: Yup.string().required("Poster URL is required").url("Invalid URL"),
  }); 

  const handleSubmit = async (values) => {
    console.log(values);
    try {
      dispatch(showLoading());
      let response = null;

      if (formType === "add") {
        response = await AddMovie(values);
      } else {
        response = await UpdateMovie({
          ...values,
          _id: selectedMovie._id,
        });
      }

      if (response.success) {
        getData();
        notification.success({ message: response.message });
        setShowMovieFormModal(false);
      } else {
        notification.error({ message: response.message });
      }
      dispatch(hideLoading());
    } catch (error) {
      dispatch(hideLoading());
      notification.error({ message: error.message });
    }
  };

  return (
    <Modal
      title={formType === "add" ? "ADD MOVIE" : "EDIT MOVIE"}
      open={showMovieFormModal}
      onCancel={() => {
        setShowMovieFormModal(false);
      }}
      footer={null}
      width={800}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          values,
          handleChange,
          setFieldValue,
          handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Flex vertical gap={16} align="center" justify="center">
              <Row className={styles.fullWidth}>
                <Col className={styles.fullWidth}>
                  <Flex vertical gap={8} >
                    <Text strong>Title</Text>
                    <Input
                      name="title"
                      placeholder="Title"
                      value={values.title}
                      onChange={handleChange}
                      className={
                        errors.title && touched.title ? styles.error : null
                      }
                    />
                    {errors.title && touched.title && (
                      <Text type="danger">{errors.title}</Text>
                    )}
                  </Flex>
                </Col>
              </Row>

              <Row className={styles.fullWidth}>
                <Col className={styles.fullWidth}>
                  <Flex vertical gap={8} >
                    <Text strong>Description</Text>
                    <Input.TextArea
                      name="description"
                      placeholder="Description"
                      value={values.description}
                      onChange={handleChange}
                      className={
                        errors.description && touched.description
                          ? styles.error
                          : null
                      }
                    />
                    {errors.description && touched.description && (
                      <Text type="danger">{errors.description}</Text>
                    )}
                  </Flex>
                </Col>
              </Row>

              <Row className={styles.fullWidth} gutter={16}>
                <Col >
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Duration (minutes)</Text>
                    <Input
                      name="duration"
                      type="number"
                      placeholder="Duration"
                      value={values.duration}
                      onChange={handleChange}
                      className={
                        errors.duration && touched.duration
                          ? styles.error
                          : null
                      }
                    />
                    {errors.duration && touched.duration && (
                      <Text type="danger">{errors.duration}</Text>
                    )}
                  </Flex>
                </Col>
                <Col>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Genre</Text>
                    <Select
                      name="genre"
                      placeholder="Genre"
                      value={values.genre}
                      onChange={(value) => setFieldValue("genre", value)}
                      className={
                        errors.genre && touched.genre ? styles.error : null
                      }
                    >
                      <Option value="">Select Genre</Option>
                      <Option value="Action">Action</Option>
                      <Option value="Adventure">Adventure</Option>
                      <Option value="Animation">Animation</Option>
                      <Option value="Comedy">Comedy</Option>
                      <Option value="Crime">Crime</Option>
                      <Option value="Documentary">Documentary</Option>
                      <Option value="Drama">Drama</Option>
                      <Option value="Fantasy">Fantasy</Option>
                      <Option value="History">History</Option>
                      <Option value="Horror">Horror</Option>
                      <Option value="Music">Music</Option>
                      <Option value="Mystery">Mystery</Option>
                      <Option value="Romance">Romance</Option>
                      <Option value="Science Fiction">Science Fiction</Option>
                      <Option value="Thriller">Thriller</Option>
                      <Option value="War">War</Option>
                      <Option value="Western">Western</Option>
                    </Select>
                    {errors.genre && touched.genre && (
                      <Text type="danger">{errors.genre}</Text>
                    )}
                  </Flex>
                </Col>
                <Col>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Language</Text>
                    <Select
                      name="language"
                      placeholder="Language"
                      value={values.language}
                      onChange={(value) => setFieldValue("language", value)}
                      className={
                        errors.language && touched.language
                          ? styles.error
                          : null
                      }
                    >
                      <Option value="">Select language</Option>
                      <Option value="English">English</Option>
                      <Option value="Hindi">Hindi</Option>
                      <Option value="French">French</Option>
                      <Option value="Spanish">Spanish</Option>
                    </Select>
                    {errors.language && touched.language && (
                      <Text type="danger">{errors.language}</Text>
                    )}
                  </Flex>
                </Col>
              </Row>

              <Row className={styles.fullWidth} gutter={16}>
                <Col>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Release Date</Text>
                    <Input
                      type="date"
                      name="releaseDate"
                      placeholder="Release Date"
                      value={values.releaseDate}
                      onChange={handleChange}
                      className={
                        errors.releaseDate && touched.releaseDate
                          ? styles.error
                          : null
                      }
                      format="YYYY-MM-DD"
                    />
                    {errors.releaseDate && touched.releaseDate && (
                      <Text type="danger">{errors.releaseDate}</Text>
                    )}
                  </Flex>
                </Col>
                <Col>
                  <Flex vertical gap={8} className={styles.fullWidth}>
                    <Text strong>Poster URL</Text>
                    <Input
                      name="poster"
                      placeholder="Poster URL"
                      value={values.poster}
                      onChange={handleChange}
                      className={
                        errors.poster && touched.poster ? styles.error : null
                      }
                    />
                    {errors.poster && touched.poster && (
                      <Text type="danger">{errors.poster}</Text>
                    )}
                  </Flex>
                </Col>
              </Row>
              <Button block type="primary" htmlType="submit">
                {formType === "add" ? "Add Movie" : "Update Movie"}
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default MovieForm;
