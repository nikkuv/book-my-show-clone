import { Tabs } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import Container from "@/components/Container/Container";
import MoviesList from "@/components/Admin/MoviesList";
import TheatreList from "@/components/Admin/TheatreList";

const Admin = () => {

  const tabItems = [
    {
      key: "1",
      label: "Movies",
      children: <MoviesList />,
    },
    {
      key: "2",
      label: "Theatres",
      children: <TheatreList />,
    },
  ];

  return (
    <ProtectedRoute>
      <Header />
      <Container>
        <Tabs
          defaultActiveKey="1"
          items={tabItems}
        />
      </Container>
    </ProtectedRoute>
  );
};

export default Admin;
