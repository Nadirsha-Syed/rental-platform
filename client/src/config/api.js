// 🌍 Dynamically toggle between your local machine and your future live cloud URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_BASE_URL;