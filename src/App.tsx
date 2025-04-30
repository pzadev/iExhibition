import "./App.css";
import { Routes, Route } from "react-router-dom";
import Bar from "./Bar";
import Home from "./Home";
import Chicago from "./Chicago";
import Met from "./Met";

function App() {
  return (
    <div className="flex flex-col min-h-screen min-w-screen">
      <Bar />
      <div className="flex-grow bg-white pt-[5px] p-2">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chicago" element={<Chicago />} />
          <Route path="/met" element={<Met />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
