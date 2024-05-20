"use client";

import Loader from "@/components/Loader/Loader";
import { useSelector } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";

export default function BookMyShow() {
  const { loading } = useSelector((state) => state.loader);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <ProtectedRoute>
          <Header />
          <h1>Home</h1>
        </ProtectedRoute>
      )}
    </>
  );
}
