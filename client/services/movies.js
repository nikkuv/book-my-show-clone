import { axiosInstance } from "./index";

export const GetAllMovies = async () => {
  try {
    const response = await axiosInstance.get(
      "/app/v1/users/admin/getAllMovies"
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};

export const DeleteMovie = async (movieId) => {
  try {
    const response = await axiosInstance.post(
      "/app/v1/users/admin/deleteMovie",
      { _id: movieId },
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};

export const UpdateMovie = async (payload) => {
  try {
    const response = await axiosInstance.patch(
      "/app/v1/users/admin/updateMovie",
      payload
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};
