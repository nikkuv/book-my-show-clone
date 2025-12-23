import { axiosInstance } from ".";

export const UploadImage = async (payload) => {
    try {
        const response = await axiosInstance.post(
            "/app/v1/common/upload-movie-poster",
            payload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        return error.response;
    }
};
