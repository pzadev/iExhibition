import "./App.css";
import { Routes, Route } from "react-router-dom";
import Bar from "./Bar";
import Home from "./Home";
import Chicago from "./Chicago";
import Met from "./Met";
import Exhibition from "./Exhibition";
import Footer from "./Footer";
import SingleArtwork from "./SingleArtwork";
function App() {
  return (
    <div className="flex flex-col min-h-screen min-w-screen">
      <Bar />
      <div className="flex-grow bg-white pt-[5px] p-2">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chicago" element={<Chicago />} />
          <Route path="/met" element={<Met />} />
          <Route path="/exhibition" element={<Exhibition />} />
          <Route path="/artwork/:source/:id" element={<SingleArtwork />} />        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
