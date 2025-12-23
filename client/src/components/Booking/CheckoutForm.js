"use client";

import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button, message } from "antd";
import { MakePayment } from "../../../services/booking";

const CheckoutForm = ({ totalAmount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {
            // 1. Create Payment Intent
            const response = await MakePayment({
                amount: totalAmount * 100, // Convert to paise
            });

            if (response.success) {
                // 2. Confirm Payment
                const result = await stripe.confirmCardPayment(response.data, {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    },
                });

                if (result.error) {
                    message.error(result.error.message);
                } else {
                    if (result.paymentIntent.status === "succeeded") {
                        message.success("Payment Successful!");
                        onSuccess(result.paymentIntent.id);
                    }
                }
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error(error.message);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ minWidth: "350px" }}>
            <div
                style={{
                    padding: "16px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "8px",
                    marginBottom: "24px",
                }}
            >
                <CardElement />
            </div>
            <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                disabled={!stripe}
            >
                Pay ${totalAmount}
            </Button>
        </form>
    );
};

export default CheckoutForm;
