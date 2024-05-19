"use client";

import { useState } from "react";
import { Tabs, Button } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import Container from "@/components/Container/Container";
import AddMovieModal from "@/components/Admin/AdminModal";
import MoviesList from "@/components/Admin/MoviesList";

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

const Admin = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const handleTabsChange = (key) => {
    console.log(key);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  return (
    <ProtectedRoute>
      <Header />
      <Container>
        <Button onClick={() => setModalOpen(true)}>Add Movie</Button>
        <Tabs
          defaultActiveKey="1"
          items={tabItems}
          onChange={handleTabsChange}
        />
      </Container>
      <AddMovieModal
        isModalOpen={isModalOpen}
        handleOk={() => {}}
        handleCancel={handleCancel}
      />
    </ProtectedRoute>
  );
};

export default Admin;
