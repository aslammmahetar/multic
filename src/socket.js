import { io } from "socket.io-client"

const socket = io("https://mt-backend-ni50.onrender.com/", {
    withCredentials: true,
    autoConnect: true
});

export default socket;