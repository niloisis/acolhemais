import axios from "axios";

const serverURI = import.meta.env.VITE_BASE_URL || "http://localhost:3001";

const api = axios.create({
    baseURL: serverURI
});
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401 || error.response.status === 403) {
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export {api, serverURI};
