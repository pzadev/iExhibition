import "./App.css";
import {
  fetchChicagoArtwork,
} from "../api";
import { useEffect, useState } from "react";

function Chicago() {
  type chicagoArtwork = {
    id: number;
    title: string;
    image_id: string;
    date_end: number;
    description?: string;
    artist_title?: string;
    place_of_origin?: string;
  };

  const [chicagoArt, setChicagoArt] = useState<chicagoArtwork[]>([]);

  useEffect(() => {
    const fetchArtData = async () => {
      const chicagoData = await fetchChicagoArtwork();

      setChicagoArt(chicagoData.data);
    };

    fetchArtData();
  }, []);

  return (
    <>
      <div className="flex-col">
        <h1 className="font-medium text-center text-2xl mt-4">Chicago Art</h1>
      </div>

      {chicagoArt.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-10 mt-3">
          {chicagoArt.map((artwork, id) => (
            <div
              key={id}
              className="bg-blue-200 w-90 h-auto p-6 rounded-lg shadow-md flex flex-col items-center text-center"
            >
              {artwork && (
                <img
                  src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
                  alt={artwork.title}
                  className="mb-4 w-full max-w-xs rounded"
                />
              )}
              <h2 className="text-lg font-semibold">{artwork.title}</h2>
              <p className="text-md text-black">
                {artwork.artist_title || "Unknown Artist"}
              </p>
              <p className="text-sm text-gray-700">
                {artwork.place_of_origin || "Unknown Origin"} -{" "}
                {artwork.date_end}
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

export default Chicago;
