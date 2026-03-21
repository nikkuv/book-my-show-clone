"use client";

import { Typography } from "antd";
import ProtectedRoute from "@/components/ProtectedRoute";
import BookingsList from "@/components/Booking/BookingsList";
import styles from "./bookings.module.css";

const { Title } = Typography;

export default function BookingsPage() {
    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <Title level={2}>My Bookings</Title>
                <BookingsList />
            </div>
        </ProtectedRoute>
    );
}
