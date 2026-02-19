import axios from "axios";
// import { isTokenExpired } from "";
import { isTokenExpired } from "./APIs";
import { refreshTokenEndpoint } from "./APIs";
const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
});

api.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem('token');

        if (!token) {
            localStorage.removeItem('profile');
            localStorage.removeItem('token');
            window.location.href = "/";
            return Promise.reject("No token");
        }

        if (isTokenExpired(token)) {
            try {
                const data = await refreshTokenEndpoint();
                token = data.accessToken;
                // console.log("JWT is work!")

                localStorage.setItem('token', token);
            } catch (err) {
                localStorage.removeItem('profile');
                localStorage.removeItem('token');
                window.location.href = "/";
                return Promise.reject("Session expired");
            }
        }

        config.headers.Authorization = `Bearer ${token}`;
        config.headers["Content-Type"] = "application/json";
        // console.log(token)
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
