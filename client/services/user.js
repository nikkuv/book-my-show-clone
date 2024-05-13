import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
    method: "POST",
    credentials: "include",
  }
})

export const RegisterUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/app/v1/users/register", payload);
    return response.json();
  } catch (err) {
    return err;
  }
}
