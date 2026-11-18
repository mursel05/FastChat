import axios from "axios";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
  validateStatus: function (status) {
    const acceptableStatuses = [200, 201];
    return acceptableStatuses.includes(status);
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    if (response?.data?.message) {
      Swal.fire({
        title: response.data.message,
        icon: "success",
        confirmButtonText: "OK",
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post("/users/refresh-tokens");
        if (res.status === 200) {
          return axiosInstance(originalRequest);
        } else {
          window.location.href = "/login";
        }
      } catch (refreshError) {
        window.location.href = "/login";
      }
    } else {
      if (error?.response?.data?.message) {
        Swal.fire({
          title: error.response.data.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
