import { axiosInstance } from "./index";

export const RegisterUser = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/app/v1/users/register",
      payload
    );
    return response.data;
  } catch (err) {
    return err?.response?.data || err;
  }
};

export const LoginUser = async (payload) => {
  try {
    const response = await axiosInstance.post("/app/v1/users/login", payload);
    return response.data;
  } catch (err) {
    return err?.response?.data || err;
  }
};

export const GetCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/app/v1/users/get-current-user");
    return response?.data;
  } catch (err) {
    return err?.response?.data || err;
  }
};

export const LogoutUser = async () => {
  try {
    const response = await axiosInstance.post("/app/v1/users/logout");
    return response.data;
  } catch (err) {
    return err?.response?.data || err;
  }
};
