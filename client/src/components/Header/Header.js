"use client";

import { useRouter } from "next/navigation";
import { Layout, Typography, notification, Flex, Avatar, Button } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { GetCurrentUser } from "../../../services/user";
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
        notification.error({ message: response.message });
      }
      // dispatch(hideLoading());
    } catch (err) {
      // dispatch(hideLoading());
      // dispatch(setUser(null));
      notification.error({ message: err.message });
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUserInfo();
    } else {
      router.push("/login");
    }
  }, []);

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
              if(user.isAdmin) {  
                router.push("/admin");
              }else {
                router.push("/profile");
              }
            }}>{user.name}</Typography.Link>
          </Flex>
          <Button
            type="text"
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
          >
            <LogoutOutlined />
          </Button>
        </Flex>
      </Header>
    )
  );
};

export default AppHeader;
