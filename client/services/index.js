import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5001",
  // TODO: read about this parameter for CORS
  // automatically sends cookies with every request
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  }
});

export default axiosInstance;
