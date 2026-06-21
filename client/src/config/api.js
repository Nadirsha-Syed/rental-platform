// client/src/config/api.js
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://rental-platform-api.onrender.com"; // 

export default API_BASE_URL;