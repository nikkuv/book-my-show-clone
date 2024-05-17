import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    credentials: "include",
    method: "POST",
    "Content-Type": "application/json",
    Authorization: `bearer ${
      localStorage?.getItem("token") || ""
    }`,
  },
});

export const RegisterUser = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/app/v1/users/register",
      payload
    );
    return response.data;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const LoginUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/app/v1/users/login", payload);
    return response.data;
  } catch (err) {
    return err;
  }
};

export const GetCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/app/v1/users/getCurrentUser");
    return response?.data;
  } catch (err) {
    return err?.response?.data || err;
  }
};
