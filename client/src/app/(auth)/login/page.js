"use client";

import { Suspense } from "react";
import { Form, Formik } from "formik";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Card, Typography, Flex, Button, notification, Spin } from "antd";
import * as Yup from "yup";
import styles from "../auth.module.css";
import { LoginUser } from "../../../../services/user";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/usersSlice";

const { Text } = Typography;

function safeRedirectPath(raw) {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("://")) return null;
  return t;
}

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

  const handleLogin = async (values) => {
    try {
      const res = await LoginUser(values);
      if (res.success) {
        notification.success({
          message: res.message,
        });
        dispatch(setUser(res.data));
        const next = safeRedirectPath(searchParams.get("redirect"));
        if (next) {
          router.push(next);
        } else if (res.data.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (err) {
      notification.error({
        message: err?.message || "Something went wrong",
      });
    }
  };

  return (
    <Card className={styles.registerForm}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ errors, touched, values, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Flex vertical gap={16} align="center" justify="center">
              <Typography.Title level={3}>
                Login to your account
              </Typography.Title>
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
                Login
              </Button>
              <Text>
                Don't have an account?
                <Link href="/register"> Register</Link>
              </Text>
            </Flex>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
