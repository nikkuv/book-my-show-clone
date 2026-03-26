"use client";

import { Tabs } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import Container from "@/components/Container/Container";
import BookingsList from "@/components/Booking/BookingsList";

const Profile = () => {
  const tabItems = [
    {
      key: "1",
      label: "Bookings",
      children: <BookingsList />,
    },
  ];

  return (
    <ProtectedRoute>
      <Container>
        <Tabs
          defaultActiveKey="1"
          items={tabItems}
        />
      </Container>
    </ProtectedRoute>
  );
};

export default Profile;
