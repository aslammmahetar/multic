import { io } from "socket.io-client"

<<<<<<< HEAD
const socket = io("https://mt-backend-ni50.onrender.com/", {
=======
const socket = io("https://mt-backend-ni50.onrender.com", {
>>>>>>> 8e3b45c44ed230b64231d03510bc133d9d5386f2
    withCredentials: true,
    autoConnect: true
});

export default socket;
