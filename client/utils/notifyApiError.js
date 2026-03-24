import { notification } from "antd";

const NETWORK_KEY = "bookmyshow-network-error";

export function isNetworkErrorMessage(msg) {
  if (typeof msg !== "string") return false;
  const m = msg.toLowerCase();
  return m.includes("network") || m === "failed to fetch";
}

/** One visible toast; later calls replace the same notification instead of stacking. */
export function notifyNetworkError(detail) {
  notification.error({
    key: NETWORK_KEY,
    message: "Can’t reach the server",
    description:
      detail ||
      "Start the API (e.g. npm start in /server) and check PORT matches the client (5001).",
    duration: 8,
  });
}
