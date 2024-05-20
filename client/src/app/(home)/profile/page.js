import { Tabs } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import Container from "@/components/Container/Container";
import TheatreList from "@/components/Profile/TheatreList";

const Profile = () => {
 
  const tabItems = [
    {
      key: "1",
      label: "Bookings",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Apply for theatre",
      children: <TheatreList />,
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
