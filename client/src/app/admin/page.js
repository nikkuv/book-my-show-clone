"use client";

import { Tabs } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import Container from "@/components/Container/Container";
import MoviesList from "@/components/Admin/MoviesList";

const Admin = () => {

  const handleTabsChange = (key) => {
    console.log(key);
  };

  const tabItems = [
    {
      key: "1",
      label: "Movies",
      children: <MoviesList />,
    },
    {
      key: "2",
      label: "Theatres",
      children: "Content of Tab Pane 2",
    },
  ];

  return (
    <ProtectedRoute>
      <Header />
      <Container>
        <Tabs
          defaultActiveKey="1"
          items={tabItems}
          onChange={handleTabsChange}
        />
      </Container>
    </ProtectedRoute>
  );
};

export default Admin;
