import { axiosInstance } from "./index";

export const GetAllMovies = async () => {
  try {
    const response = await axiosInstance.get(
      "/app/v1/users/admin/get-all-movies"
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};

export const DeleteMovie = async (movieId) => {
  try {
    const response = await axiosInstance.post(
      "/app/v1/users/admin/delete-movie",
      { _id: movieId },
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};

export const AddMovie = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/app/v1/users/admin/add-movie",
      payload
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};

export const UpdateMovie = async (payload) => {
  try {
    const response = await axiosInstance.patch(
      "/app/v1/users/admin/update-movie",
      payload
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};

export const GetMovieById = async (movieId) => {
  try {
    const response = await axiosInstance.get(
      `/app/v1/users/admin/get-movie-by-id/${movieId}`
    );
    return response.data;
  } catch (err) {
    return err.message;
  }
};

