import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const publicPaths = [
  "/token/",
  "/token/refresh/",
  "/forgot-password/",
  "/reset-password/",
];

const isPublicRequest = (url) => {
  const requestPath = (url || "").startsWith("/") ? url : `/${url || ""}`;
  return publicPaths.some((path) => requestPath.startsWith(path));
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  if (!refreshToken) {
    throw new Error("No refresh token");
  }
  const response = await axios.post(`${api.defaults.baseURL}token/refresh/`, {
    refresh: refreshToken,
  });
  localStorage.setItem(ACCESS_TOKEN, response.data.access);
  return response.data.access;
};

api.interceptors.request.use(
  async (config) => {
    if (isPublicRequest(config.url)) {
      return config;
    }

    let token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          token = await refreshToken();
        }
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.log(error);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
