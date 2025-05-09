import "./App.css";
import { fetchMetObjectById, fetchMetEuropeanArtIDs } from "../api";
import { useEffect, useState } from "react";

function Met() {
  type metArtwork = {
    accessionYear: number;
    artistDisplayName: string;
    title: string;
    primaryImage: string;
    artistNationality: string;
  };
  const [metArt, setMetArt] = useState<metArtwork[]>([]);

  useEffect(() => {
    const fetchMetData = async () => {
      const ids = await fetchMetEuropeanArtIDs();
      const sliced = ids.slice(0, 25);

      const objectPromises = sliced.map((id: number) => fetchMetObjectById(id));
      const artworks = await Promise.all(objectPromises);

      const filtered = artworks.filter(
        (artwork) => artwork.primaryImage !== ""
      );

      console.log(filtered);
      setMetArt(filtered);
    };

    fetchMetData();
  }, []);

  return (
    <>
      <div className="flex-col"></div>

      <h1 className="font-medium text-center text-2xl mt-10">Met Art Museum</h1>

      {metArt.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-10 mt-3">
          {metArt.map((artwork, index) => (
            <div
              key={index}
              className="bg-gray-200 w-90 h-auto p-6 rounded-lg shadow-md flex flex-col items-center text-center"
            >
              {artwork && (
                <img
                  src={artwork.primaryImage}
                  alt={artwork.title}
                  className="mb-4 w-full max-w-xs rounded"
                />
              )}
              <h2 className="text-lg font-bold">{artwork.title} </h2>
              <p className="text-md font-semibold">
                {artwork.artistNationality} - {artwork.accessionYear}
              </p>
              <p className="text-md text-black">
                {artwork.artistDisplayName || "Unknown Artist"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-5">Loading artworks...</p>
      )}
    </>
  );
}

export default Met;
