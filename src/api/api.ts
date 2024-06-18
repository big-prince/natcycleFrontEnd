// configure axios for api calls
import axios from "axios";

const API_URL_RAW = import.meta.env.VITE_APP_API_URL_RAW;

const api = axios.create({
  baseURL: `${API_URL_RAW}/api`,
});

api.defaults.withCredentials = true;

// add token to request header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      if (error?.response?.status === 401) {
        console.log("redirecting to signin page");
        if (typeof window !== "undefined") {
          if (window.location.pathname.includes("/admin")) {
            window.location.href = "/admin/login";
          } else {
            window.location.href = "/account/signin";
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
    return Promise.reject(error);
  }
);

export default api;
