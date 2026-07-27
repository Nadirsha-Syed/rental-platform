import { io } from "socket.io-client";
import API_BASE_URL from "../config/api.js";

const socket = io(API_BASE_URL, {
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
