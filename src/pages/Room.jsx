import React, { useEffect, useLayoutEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import GameHeader from "../components/GameHeader";
import AnimatedBackground from "../components/AnimatedBackground";
import { getGeoLocation } from "../common/BasePage";

const Room = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const state = location.state;
  const [roomData, setRoomData] = useState({});
  const [mySymbol, setMySymbol] = useState(null);
  const [roomState, setRoomState] = useState({
    board: Array(9).fill(""),
    turn: "X",
    players: [],
  });
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(params?.roomCode);
      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("roomData"));
    if (storedData) {
      setRoomData(storedData);
    }
  }, []);

  useLayoutEffect(() => {
    if (state.isCreator && roomData?.creator?.Name) {
      toast.success(`Welcome to the room ${roomData?.creator?.Name}`);
    }
  }, [roomData]);
  useLayoutEffect(() => {
    if (!state.isCreator && roomData?.joiner?.Name) {
      toast.success(`Welcome to the room ${roomData?.joiner?.Name}`);
    }
    const handleRoomJoined = (state) => {
      try {
        setRoomState(state);
        const pIndex = state.players.indexOf(socket.id);

        if (pIndex === 0) {
          if (state.oppUserName) {
            toast(`${state.oppUserName} just Joined room!`, {
              icon: "👋",
              duration: 3000,
            });
          }
        }
        const symbol =
          pIndex === 0
            ? state.creatorSymbol || "X"
            : (state.creatorSymbol || "X") === "X"
            ? "O"
            : "X";

        setMySymbol(symbol);
        setIsMyTurn(state.turn == symbol);
        setConnectionStatus("connected");
      } catch (error) {
        console.log(error);
      }
    };
    socket.on("room-joined", handleRoomJoined);
    return () => {
      socket.off("room-joined", handleRoomJoined);
    };
  }, [roomData]);

  useEffect(() => {
    //Room events handlers
    const handleRoomUpdate = (state) => {
      try {
        setRoomState(state);
        const pIndex = roomData.players.indexOf(socket.id);
        if (pIndex >= 0) {
          const creatorSymbol = state.creatorSymbol || "X";
          const symbol =
            pIndex === 0 ? creatorSymbol : creatorSymbol === "X" ? "O" : "X";
          setMySymbol(symbol);
          setIsMyTurn(state.turn === symbol);
          setConnectionStatus("connected");

          if (!state.winner && state.board.every((cell) => cell === "")) {
            setShowPlayAgain(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    socket.on("game-over", ({ winner, winnerName }) => {
      if (winner === "draw") {
        toast("Game ended in a draw!", {
          duration: 5000,
        });
      } else {
        toast.success(`${winnerName} wins the game! 🥳`, {
          duration: 5000,
        });
      }
      setShowPlayAgain(true);
    });

    const handleOpponentLeft = () => {
      try {
        toast.error("Your opponent left the game.");
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    };

    //Connecting to the room
    const connectionTimeout = setTimeout(() => {
      if (connectionStatus === "connecting") {
        toast.error("Connection timed out. Please try again.");
        navigate("/");
      }
    }, 3000);
    const stateRequestTimeout = setTimeout(() => {
      if (connectionStatus === "connecting") {
        socket.emit("request-state", roomData?.roomCode);
      }
    }, 500);

    socket.emit("request-state", roomData.roomCode);
    socket.on("room-update", handleRoomUpdate);
    socket.on("opponent-left", handleOpponentLeft);
    return () => {
      clearTimeout(connectionTimeout);
      clearTimeout(stateRequestTimeout);
      socket.off("room-update", handleRoomUpdate);
      socket.off("opponent-left", handleOpponentLeft);
      socket.off("game-over");
    };
  }, [navigate, roomData.roomCode, state.isCreator, connectionStatus]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        toast("Please use the in-game restart button instead", {
          id: "refresh-warning",
        });
      }
    };
    const handleContextMenu = (e) => {
      if (e.target.closest("#game-board")) {
        e.preventDefault();
        toast("Refreshing will disconnect you from the game", {
          icon: "⚠️",
        });
      }
    };
    document.body.style.overscrollBehaviorY = "contain";
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClick = (index) => {
    if (!isMyTurn || roomState.board[index]) return;
    socket.emit("make-move", { roomCode: roomData.roomCode, index });
  };

  const handlePlayAgain = () => {
    try {
      socket.emit("play-again", roomData.roomCode);
      setShowPlayAgain(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <GameHeader
        userName={
          state.isCreator ? roomData?.creator?.Name : roomData?.joiner?.Name
        }
      />
      <AnimatedBackground />
      <div>
        {state.isCreator ? (
          <h1>Welcom to the room {roomData?.creator?.Name} </h1>
        ) : (
          <h1>Welcom to the room {roomData?.joiner?.Name} </h1>
        )}
        <div className="fixed top-20 right-8 z-50">
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md shadow-lg border border-gray-200 rounded-xl px-4 py-2">
            {/* Room Code */}
            <div className="text-sm font-semibold text-gray-700">
              Room Code:{" "}
              <span className="text-blue-600">{params?.roomCode}</span>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md transition"
            >
              {copied ? <>Copied</> : <>Copy</>}
            </button>
          </div>
        </div>
        <div className="h-screen flex flex-col items-center justify-center px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-md">
            {connectionStatus === "connecting" ? (
              <div className="mt-4 py-4">
                <div className="animate-pulse flex flex-col items-center space-y-2">
                  <div className="h-2 w-20 bg-gray-300 rounded"></div>
                  <div className="h-2 w-32 bg-gray-300 rounded"></div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    roomState.players.length
                      ? isMyTurn
                        ? "bg-blue-100/50 border border-blue-200"
                        : "bg-blue-100/50 border border-gray-200"
                      : "bg-yellow-100/50 border border-yellow-200"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-700">
                    {" "}
                    You are playing with{" "}
                    <span
                      className={`font-bold ${
                        mySymbol === "X" ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {mySymbol}
                    </span>{" "}
                    •{" "}
                    {roomState.players.length === 2 ? (
                      isMyTurn ? (
                        <span className="text-green-600">Your Turn</span>
                      ) : (
                        <span className="text-gray-600">Opponent's Turn</span>
                      )
                    ) : (
                      <span className="text-yellow-600">
                        Waiting for Opponent...
                      </span>
                    )}
                  </p>
                </div>
                {/* Game Board */}
                <div className="grid grid-cols-3 gap-3 mt-6" id="game-board">
                  {roomState.board.map((cell, i) => (
                    <button
                      key={i}
                      onClick={() => handleClick(i)}
                      className={`aspect-square w-full text-4xl font-bold rounded-lg transition-all duration-200 ${
                        cell
                          ? cell === "X"
                            ? "bg-blue-100 text-blue-600 shadow-inner"
                            : "bg-red-100 text-red-600 shadow-inner"
                          : "bg-white hover:bg-gray-50 shadow"
                      } ${isMyTurn && !cell ? "hover:scale-105" : ""}`}
                      disabled={!isMyTurn || !!cell}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
                {showPlayAgain && (
                  <button
                    onClick={handlePlayAgain}
                    className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-lg shadow-md hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
                  >
                    Play Again
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Room;
