"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input, notification, Avatar, Button, Dropdown } from "antd";
import {
  LogoutOutlined,
  UserOutlined,
  SearchOutlined,
  SettingOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { LogoutUser } from "../../../services/user";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/usersSlice";
import styles from "./header.module.css";
import { hideLoading, showLoading } from "@/redux/loaderSlice";
import {
  isNetworkErrorMessage,
  notifyNetworkError,
} from "../../../utils/notifyApiError";
import { useSearch } from "./SearchContext";

const AppHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const { query: searchQuery, setQuery: setSearchQuery } = useSearch();

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
      if (isNetworkErrorMessage(error?.message)) {
        notifyNetworkError(error.message);
      } else {
        notification.error({ message: error.message });
      }
    }
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: user?.isAdmin ? "Admin Dashboard" : "My Profile",
      onClick: () => router.push(user?.isAdmin ? "/admin" : "/profile"),
    },
    {
      key: "bookings",
      icon: <CalendarOutlined />,
      label: "My Bookings",
      onClick: () => router.push("/bookings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: onLogout,
    },
  ];

  const showSearch = pathname === "/" || pathname === "";

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <a className={styles.logo} onClick={() => router.push("/")}>
          <span className={styles.logoBook}>book</span>
          <span className={styles.logoMy}>my</span>
          <span className={styles.logoShow}>show</span>
        </a>

        {/* Search bar — only on home */}
        {showSearch && (
          <div className={styles.searchWrapper}>
            <Input
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              prefix={<SearchOutlined style={{ color: "#bbb" }} />}
              allowClear
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        )}

        {/* Right controls */}
        <div className={styles.controls}>
          {user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
              <button className={styles.userBtn}>
                <Avatar
                  size="small"
                  style={{ backgroundColor: "#f84464" }}
                  icon={<UserOutlined />}
                />
                <span className={styles.userName}>Hi, {user.name?.split(" ")[0]}</span>
              </button>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              className={styles.signInBtn}
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
