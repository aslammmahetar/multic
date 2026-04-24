import React, { useEffect, useRef, useState } from "react";
import {
  UNSAFE_createClientRoutesWithHMRRevalidationOptOut,
  data,
  useNavigate,
} from "react-router-dom";
import socket from "../socket";
import { toast } from "react-hot-toast";
import { getGeoLocation } from "../common/BasePage";

const generateRoomCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const Home = () => {
  const navigate = useNavigate();
  const roomCodeRef = useRef();
  const userNameRef = useRef();
  const [roomData, setRoomData] = useState({});
  const [symbol, setSymbol] = useState("X");
  const [latLong, setLatLong] = useState({});
  const [loading, setLoading] = useState({
    createRoom: false,
    joinRoom: false,
  });

  //Create Room
  const handleCreateRoom = () => {
    try {
      setLoading((prev) => ({ ...prev, createRoom: true }));
      const roomCode = generateRoomCode();
      socket.emit("create-room", {
        roomCode,
        symbol,
        userName: userNameRef.current.value.trim(),
        creatorGL: latLong,
      });
      socket.on("room-created", (roomData) => {
        setRoomData(roomData);
        setLoading((prev) => ({ ...prev, createRoom: false }));
      });

      setTimeout(() => {
        navigate(`/room/${roomCode}#`, {
          state: { isCreator: true },
        });
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading((prev) => ({ ...prev, createRoom: false }));
    }
  };

  //Join Room
  const handleJoinRoom = () => {
    try {
      const roomCode = roomCodeRef.current.value.trim().toUpperCase();
      if (!roomCode) {
        toast.error("Please Enter Room Code!");
        return;
      }

      setLoading((prev) => ({ ...prev, joinRoom: true }));

      socket.emit("join-room", {
        roomCode,
        oppUserName: userNameRef.current.value,
        joinerGL: latLong,
      });

      socket.on("room-joined", (roomData) => {
        console.log("Got the room data :", roomData);
        setRoomData(roomData);
        setLoading((prev) => ({ ...prev, joinRoom: false }));
      });

      setTimeout(() => {
        navigate(`/room/${roomCode}`, {
          state: { isCreator: false },
        });
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading((prev) => ({ ...prev, joinRoom: false }));
    }
  };

  useEffect(() => {
    const fetchGeoocation = async () => {
      const latLong = await getGeoLocation();
      setLatLong(latLong);
    };
    fetchGeoocation();
  }, []);
  useEffect(() => {
    localStorage.setItem("roomData", JSON.stringify(roomData));
  }, [roomData]);

  return (
    <>
      {/* <AnimatedBackground /> */}
      <div className="h-screen flex flex-col items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-5xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Multic <br /> Tic Tac Toe
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                ref={userNameRef}
                placeholder="Enter Your Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="bg-blue-50/50 p-4 rounded-lg">
              <div className="">
                <label className="block text-grey-700 text-sm font-medium mb-1">
                  Play As
                </label>
                <div className="flex-1">
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="X">X</option>
                    <option value="O">O</option>
                  </select>
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading.createRoom}
                    className="mt-5 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition-all duration-300 flex-shrink-0"
                  >
                    {loading.createRoom ? "Creating..." : "Create Room"}
                  </button>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-gray-500 text-sm">OR</span>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Join Existing Room
              </label>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  ref={roomCodeRef}
                  placeholder="Enter Room Code"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={loading.joinRoom}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:from-green-700 to-green-600 transition-all duration-300"
                >
                  {loading.joinRoom ? "Joining..." : "Join Room"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
