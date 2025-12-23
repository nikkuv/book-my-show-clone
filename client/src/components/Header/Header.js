"use client";

import { useRouter } from "next/navigation";
import { Layout, Typography, notification, Flex, Avatar, Button } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { GetCurrentUser, LogoutUser } from "../../../services/user";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setUser } from "@/redux/usersSlice";
import styles from "./header.module.css";
import { hideLoading, showLoading } from "@/redux/loaderSlice";

const { Header } = Layout;

const AppHeader = () => {
  const router = useRouter();

  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const getUserInfo = async () => {
    try {
      // dispatch(showLoading());
      const response = await GetCurrentUser();
      if (response.success) {
        dispatch(setUser(response.data));
      } else {
        // notification.error({ message: response.message });
        dispatch(setUser(null)); // Clear user if session invalid
        router.push("/login");
      }
      // dispatch(hideLoading());
    } catch (err) {
      // dispatch(hideLoading());
      dispatch(setUser(null));
      notification.error({ message: err.message });
      router.push("/login");
    }
  };

  useEffect(() => {
    if (!user) {
      getUserInfo();
    }
  }, []); // Only run once on mount

  const onLogout = async () => {
    try {
      dispatch(showLoading());
      const response = await LogoutUser();
      dispatch(hideLoading());
      if (response.success) {
        dispatch(setUser(null));
        router.push("/login");
      } else {
        notification.error({ message: response.message });
      }
    } catch (error) {
      dispatch(hideLoading());
      notification.error({ message: error.message });
    }
  }

  return (
    user && (
      <Header className={styles.header}>
        <Typography.Link href="/" level={3}>
          Book My Show
        </Typography.Link>
        <Flex align="center" justify="center" gap={8}>
          <Flex align="center" justify="center" gap={8}>
            <Avatar
              style={{ backgroundColor: "#87d068" }}
              icon={<UserOutlined />}
            />
            <Typography.Link onClick={() => {
              if (user.isAdmin) {
                router.push("/admin");
              } else {
                router.push("/profile");
              }
            }}>{user.name}</Typography.Link>
          </Flex>
          <Button
            type="text"
            onClick={onLogout}
          >
            <LogoutOutlined />
          </Button>
        </Flex>
      </Header>
    )
  );
};

export default AppHeader;
