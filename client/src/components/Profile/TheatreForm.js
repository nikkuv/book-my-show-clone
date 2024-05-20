"use client";

import { Form, Formik } from "formik";
import { Input, Typography, Flex, Button, notification, Modal } from "antd";
import * as Yup from "yup";
import styles from "../../app/(auth)/auth.module.css";
import { AddTheatre, UpdateTheatre } from "../../../services/theatre";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "@/redux/loaderSlice";

const { Text, Title } = Typography;

const TheatreForm = ({
  showTheatreFormModal,
  setShowTheatreFormModal,
  selectedTheatre,
  getData,
  formType,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);

  const initialValues =
    formType === "edit"
      ? selectedTheatre
      : {
          name: "",
          address: "",
          phone: "",
          email: "",
          owner: "",
        };

  const validationSchema = Yup.object({
    name: Yup.string()
      .test("isValidName", "Invalid Name", (value) =>
        value ? /^[a-zA-Z\s]*$/i.test(value) : true
      )
      .required("Name is required"),
    address: Yup.string().required("Address is required"),
    phone: Yup.string()
      .test("isValidPhone", "Invalid Phone", (value) =>
        value
          ? /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i.test(value)
          : true
      )
      .required("Phone is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (values) => {
    values.owner = user._id;

    try {
      dispatch(showLoading());
      let response = null;

      if (formType === "add") {
        response = await AddTheatre(values);
      } else {
        response = await UpdateTheatre({
          ...values,
          theatreId: selectedTheatre._id,
        });
      }

      if (response.success) {
        getData();
        notification.success({ message: response.message });
        setShowTheatreFormModal(false);
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
      title={formType === "add" ? "Add Theatre" : "Edit Theatre"}
      open={showTheatreFormModal}
      onCancel={() => {
        setShowTheatreFormModal(false);
      }}
      footer={null}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values, handleChange }) => (
          <Form>
            <Flex vertical gap={16} align="center" justify="center">
              <Flex vertical gap={8} className={styles.fullWidth}>
                <Text strong>Name</Text>
                <Input
                  name="name"
                  placeholder="Name"
                  value={values.name}
                  onChange={handleChange}
                  className={errors.name && touched.name ? styles.error : null}
                />
                {errors.name && touched.name && (
                  <Text type="danger">{errors.name}</Text>
                )}
              </Flex>

              <Flex vertical gap={8} className={styles.fullWidth}>
                <Text strong>Address</Text>
                <Input.TextArea
                  name="address"
                  placeholder="Address"
                  value={values.address}
                  onChange={handleChange}
                  className={
                    errors.address && touched.address ? styles.error : null
                  }
                />
                {errors.address && touched.address && (
                  <Text type="danger">{errors.address}</Text>
                )}
              </Flex>

              <Flex vertical gap={8} className={styles.fullWidth}>
                <Text strong>Phone</Text>
                <Input
                  name="phone"
                  type="text"
                  placeholder="Phone"
                  value={values.phone}
                  onChange={handleChange}
                  className={
                    errors.phone && touched.phone ? styles.error : null
                  }
                />
                {errors.phone && touched.phone && (
                  <Text type="danger">{errors.phone}</Text>
                )}
              </Flex>

              <Flex vertical gap={8} className={styles.fullWidth}>
                <Text strong>Email</Text>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={values.email}
                  onChange={handleChange}
                  className={
                    errors.email && touched.email ? styles.error : null
                  }
                />
                {errors.email && touched.email && (
                  <Text type="danger">{errors.email}</Text>
                )}
              </Flex>
              <Button block type="primary" htmlType="submit">
                {formType === "add" ? "Add Theatre" : "Update Theatre"}
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default TheatreForm;
