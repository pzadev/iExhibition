import { useNavigate, useLocation } from "react-router-dom";

function Bar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="w-full bg-blue-800 border-b-1 border-gray-400 shadow px-4 py-5 flex items-center justify-between">
          <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >

        <img src="/museumIcon.png" alt="Museum Icon" className="h-11 w-11 mr-1" />
       <span className="text-3xl font-bold text-white">iExhibition</span>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => navigate("/exhibition")}
          className={`text-lg font-semibold text-white hover:text-gray-300 transition-colors px-4 py-2 rounded-full border-2 cursor-pointer
    ${
      location.pathname === "/exhibition"
        ? "text-white"
        : "text-gray-600 hover:text-blue-600"
    }`}
        >
          Your Exhibitions
        </button>
      </div>
    </header>
  );
}

export default Bar;
