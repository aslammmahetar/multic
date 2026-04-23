import { io } from "socket.io-client"

const socket = io(process.env.SERVER_URL, {
    withCredentials: true,
    autoConnect: true
});

export default socket;