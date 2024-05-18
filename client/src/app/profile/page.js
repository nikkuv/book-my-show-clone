import ProtectedRoute from "@/components/ProtectedRoute";

const Profile = () => {
  return (
    <ProtectedRoute>
      <h1>Hello Profile</h1>
    </ProtectedRoute>
  );
};

export default Profile;
