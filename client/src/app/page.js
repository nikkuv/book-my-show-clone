import styles from "./page.module.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";

export default function Home() {
  return (
    <ProtectedRoute>
      <main className={styles.main}>
        <Header />
        <h1>Hello</h1>
      </main>
    </ProtectedRoute>
  );
}
