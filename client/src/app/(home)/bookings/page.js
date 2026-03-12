"use client";

import { Typography } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header/Header";
import BookingsList from "@/components/Booking/BookingsList";
import styles from "./bookings.module.css";

const { Title } = Typography;

export default function BookingsPage() {
    return (
        <ProtectedRoute>
            <Header />
            <div className={styles.container}>
                <Title level={2}>My Bookings</Title>
                <BookingsList />
            </div>
        </ProtectedRoute>
    );
}
