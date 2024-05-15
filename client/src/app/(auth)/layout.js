import styles from "./auth.module.css";

export default function AuthLayout({ children }) {
  return <section className={styles.authLayoutStyles}>{children}</section>;
}
