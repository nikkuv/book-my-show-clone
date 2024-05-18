"use client";

import { useState } from "react";
import { Tabs, Flex, Button } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import Container from "@/components/Container/Container";
import AddMovieModal from "@/components/Admin/AdminModal";

const tabItems = [
  {
    key: "1",
    label: "Movies",
    children: "Content of Tab Pane 1",
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
        <Flex align="start" justify="space-between" gap={8}>
          <Tabs
            defaultActiveKey="1"
            items={tabItems}
            onChange={handleTabsChange}
          />
          <Button onClick={() => setModalOpen(true)}>Add Movie</Button>
        </Flex>
      </Container>
      <AddMovieModal isModalOpen={isModalOpen} handleOk={() => {}} handleCancel={handleCancel} />
    </ProtectedRoute>
  );
};

export default Admin;
