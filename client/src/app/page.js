"use client";

import Header from "@/components/Header/Header";
import Loader from "@/components/Loader/Loader";
import { useSelector } from "react-redux";
import ProtectedRoute from "@/components/ProtectedRoute";
import styles from "./page.module.css";

export default function Home() {
  const { loading } = useSelector((state) => state.loader);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <ProtectedRoute>
          <Header />
          <main className={styles.main}>
            <h1>Hello</h1>
          </main>
        </ProtectedRoute>
      )}
    </>
  );
}
