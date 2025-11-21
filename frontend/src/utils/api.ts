import axios from "axios";

const serverURI = import.meta.env.VITE_BASE_URL || "http://localhost:3001";

const api = axios.create({
    baseURL: serverURI,
    withCredentials: true // Importante para enviar/receber Cookies
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
        // Se o erro for 401/403 E NÃO FOR na tentativa de login, redireciona
        // Isso evita que o site recarregue quando o usuário apenas erra a senha
        if (error.config.url !== "/login" && (error.response?.status === 401 || error.response?.status === 403)) {
            localStorage.removeItem("token");
            localStorage.removeItem("ongId");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export {api, serverURI};