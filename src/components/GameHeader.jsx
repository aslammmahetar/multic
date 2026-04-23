import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

export default function GameHeader({ userName }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Go back to previous page or home if no history
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-white/20 backdrop-blur-lg border-b border-white/30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
          >
            <FiArrowLeft className="text-xl" />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                {userName?.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white/20"></div>
            </div>
            <span className="text-white font-medium">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
