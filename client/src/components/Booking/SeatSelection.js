import { useState } from "react";
import { Typography, Row, Col as AntCol } from "antd";
import styles from "./SeatSelection.module.css";

const { Text } = Typography;

const SeatSelection = ({
    totalSeats,
    bookedSeats = [],
    selectedSeats,
    onSeatSelect,
    columns = 12, // Default to 12 columns for cinema look
}) => {
    const totalRows = Math.ceil(totalSeats / columns);

    const handleSeatClick = (seatNumber) => {
        if (bookedSeats.includes(seatNumber)) {
            return;
        }

        if (selectedSeats.includes(seatNumber)) {
            onSeatSelect(selectedSeats.filter((s) => s !== seatNumber));
        } else {
            onSeatSelect([...selectedSeats, seatNumber]);
        }
    };

    const getSeatStatus = (seatNumber) => {
        if (bookedSeats.includes(seatNumber)) return "booked";
        if (selectedSeats.includes(seatNumber)) return "selected";
        return "available";
    };

    const renderSeats = () => {
        const rows = [];
        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            const rowLabel = String.fromCharCode(65 + rowIndex); // A, B, C...
            const seatsInRow = [];

            for (let col = 1; col <= columns; col++) {
                const seatNumber = `${rowLabel}${col}`;
                const seatIndex = rowIndex * columns + col;

                // Don't render seats beyond total count
                if (seatIndex > totalSeats) break;

                seatsInRow.push(
                    <button
                        key={seatNumber}
                        className={`${styles.seat} ${styles[getSeatStatus(seatNumber)]}`}
                        onClick={() => handleSeatClick(seatNumber)}
                        disabled={bookedSeats.includes(seatNumber)}
                        title={`Seat ${seatNumber}`}
                    >
                        {col}
                    </button>
                );
            }

            rows.push(
                <div key={rowIndex} className={styles.seatRow}>
                    <div className={styles.rowLabel}>{rowLabel}</div>
                    <div className={styles.rowSeats}>{seatsInRow}</div>
                </div>
            );
        }
        return rows;
    };

    return (
        <div className={styles.container}>
            <div className={styles.screen}>
                <div className={styles.screenCurve}></div>
                <Text type="secondary">SCREEN THIS WAY</Text>
            </div>

            <div className={styles.seatContainer}>
                {renderSeats()}
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendBox} ${styles.available}`}></div>
                    <Text>Available</Text>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendBox} ${styles.selected}`}></div>
                    <Text>Selected</Text>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.legendBox} ${styles.booked}`}></div>
                    <Text>Booked</Text>
                </div>
            </div>
        </div>
    );
};

export default SeatSelection;
