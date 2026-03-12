# Implementation Documentation – Remaining Features

This document describes the features implemented to complete the BookMyShow clone beyond the initial scope. It covers seat blocking, cancel rules, profile bookings, UI fixes, and server startup.

---

## 1. Seat blocking in the booking flow

**Goal:** Avoid double-booking by temporarily blocking seats when the user proceeds to pay, then confirming after payment.

### Backend (unchanged)

- `POST /app/v1/bookings/block` – blocks seats for 10 minutes; validates availability and cleans expired blocks.
- `POST /app/v1/bookings/book-seats` – confirms booking after payment; checks that seats are still blocked by the same user.

### Frontend

- **`client/services/booking.js`**  
  - Added `BlockSeats(payload)` calling `POST /app/v1/bookings/block` with `{ showId, seats, userId }`.  
  - Uses the same axios instance (cookies sent); returns `response.data` or an error body.

- **`client/src/app/(home)/book/[showId]/page.js`**  
  - **Book Now:** `handleBookClick` is async. It calls `BlockSeats` with `showId`, `selectedSeats`, and `user._id` (from Redux).  
  - On failure: shows a notification (and `unavailableSeats` if returned); does not open the payment modal.  
  - On success: opens the payment modal.  
  - After payment success: still calls `BookSeats` with `showId`, `seats`, and `transactionId` as before.

**Flow:** Select seats → Book Now → Block seats (API) → Payment modal → Pay → Book seats (API) → Success.

---

## 2. Show blocked seats on the seat map

**Goal:** Seats blocked by other users (within 10 minutes) appear unavailable, same as booked.

### Backend (unchanged)

- `getShowById` returns the full show document, including `blockedSeats` (`{ seat, userId, blockedAt }`).

### Frontend

- **`client/src/app/(home)/book/[showId]/page.js`**  
  - **`unavailableSeats`** (useMemo):  
    - Base: `show.bookedSeats`.  
    - Add seats from `show.blockedSeats` where:  
      - `blockedAt` is within the last 10 minutes, and  
      - `userId` is not the current user (from Redux).  
  - This list is passed to `SeatSelection` as the `bookedSeats` prop so blocked-by-others are disabled and look unavailable.

- **`client/src/components/Booking/SeatSelection.js`**  
  - No change; it already disables any seat in `bookedSeats`.

---

## 3. Cancel only upcoming bookings

**Goal:** Users can cancel only upcoming shows; past shows cannot be cancelled.

### Backend

- **`server/controller/bookingController.js` – `cancelBooking`**  
  - Loads the booking with `show` populated (`date`, `time`).  
  - Builds show date/time from `show.date` and `show.time` (supports `HH:MM` and `HH:MM AM/PM`).  
  - If that datetime is in the past, returns **400** with message: `"Cannot cancel a past show"`.  
  - Otherwise: updates booking status to `cancelled` and releases seats on the show as before.

### Frontend

- **`client/src/components/Booking/BookingsList.js`**  
  - **`isShowPast(booking)`:** Uses `booking.show.date` and `booking.show.time` with dayjs to decide if the show is in the past.  
  - For **confirmed** bookings:  
    - If past: Cancel button is **disabled** with tooltip `"Past shows cannot be cancelled."`.  
    - If upcoming: Cancel uses the existing `Popconfirm` and `CancelBooking` API.

---

## 4. Profile Bookings tab

**Goal:** The Profile “Bookings” tab shows the same bookings list as the dedicated bookings page.

### New component

- **`client/src/components/Booking/BookingsList.js`**  
  - Reusable list: fetches bookings via `GetBookingsByUser`, shows loading and empty states.  
  - Renders booking cards (poster, movie, theatre, date, time, seats, total, status).  
  - Uses `isShowPast` and disables Cancel for past shows; otherwise calls `CancelBooking` and refetches.  
  - Reuses styles from `client/src/app/(home)/bookings/bookings.module.css`.

### Usage

- **`client/src/app/(home)/bookings/page.js`**  
  - Page layout: Header, title “My Bookings”, and `<BookingsList />`.

- **`client/src/app/(home)/profile/page.js`**  
  - First tab “Bookings” now renders `<BookingsList />` instead of the placeholder text.

---

## 5. CheckoutForm currency label

**Goal:** Show INR instead of USD on the payment button.

### Change

- **`client/src/components/Booking/CheckoutForm.js`**  
  - Button text changed from `Pay ${totalAmount}` to `Pay ₹{totalAmount}`.

---

## 6. Swagger docs so server starts

**Goal:** Prevent server crash when `swagger-docs.js` is missing (e.g. when it is gitignored).

### Change

- **`server/swagger-docs.js`** (new file)  
  - Minimal module so `require("./swagger-docs")` in `server.js` and the swagger config `apis` entry work.  
  - Exports an empty object; can be extended later with JSDoc for routes.

---

## File summary

| Area              | Files touched / added |
|-------------------|------------------------|
| Seat blocking     | `client/services/booking.js`, `client/src/app/(home)/book/[showId]/page.js` |
| Blocked on map    | `client/src/app/(home)/book/[showId]/page.js` |
| Cancel upcoming   | `server/controller/bookingController.js`, `client/src/components/Booking/BookingsList.js` |
| Profile Bookings  | `client/src/components/Booking/BookingsList.js` (new), `client/src/app/(home)/bookings/page.js`, `client/src/app/(home)/profile/page.js` |
| Currency          | `client/src/components/Booking/CheckoutForm.js` |
| Swagger           | `server/swagger-docs.js` (new) |

---

## Out of scope (per plan)

- **Admin reporting** (all reservations, capacity, revenue) – not implemented.  
- **Promote user to admin** – not implemented.

These can be added later if needed.
