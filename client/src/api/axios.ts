import axios from "axios";

const api = axios.create({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

export default api;
