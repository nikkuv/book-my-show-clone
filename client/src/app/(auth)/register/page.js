"use client";

import { Form, Formik } from "formik";
import Link from "next/link";
import { Input, Card, Typography, Flex, Button, notification } from "antd";
import * as Yup from "yup";
import styles from "../auth.module.css";
import { RegisterUser } from "../../../../services/user";

const { Text } = Typography;

const Register = () => {
  const initialValues = {
    name: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const handleSubmit = async (values) => {
    try {
      const res = await RegisterUser(values);
      if (res.success) {
        notification.success({
          message: res.message,
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (err) {
      notification.error({
        message: err.message,
      });
    }
  };

  return (
    <Card className={styles.registerForm}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Flex vertical gap={16} align="center" justify="center">
              <Typography.Title level={3}>
                Register to your account
              </Typography.Title>
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
                <Text strong>Email</Text>
                <Input
                  name="email"
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

              <Flex vertical gap={8} className={styles.fullWidth}>
                <Text strong>Password</Text>
                <Input.Password
                  name="password"
                  placeholder="Password"
                  value={values.password}
                  onChange={handleChange}
                  className={
                    errors.password && touched.password ? styles.error : null
                  }
                />
                {errors.password && touched.password && (
                  <Text type="danger">{errors.password}</Text>
                )}
              </Flex>

              <Button block type="primary" htmlType="submit">
                Register
              </Button>
              <Text>
                Already have an account?
                <Link href="/login"> Login</Link>
              </Text>
            </Flex>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default Register;
