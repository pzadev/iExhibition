import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchChicagoSingle, fetchMetSingle } from "../api";

const SingleArtwork = () => {
  const params = useParams();
  const source = params.source as string;
  const id = params.id as string;

  const [artwork, setArtwork] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        let data;
        if (source === "chicago") {
          data = await fetchChicagoSingle(id!);
          setArtwork({ ...data.data, source: "aic" });
        } else if (source === "met") {
          data = await fetchMetSingle(id);
          setArtwork({ ...data, source: "met" });
        } else {
          console.error("Invalid source type");
        }
      } catch (error) {
        console.error("Error fetching artwork:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtwork();

    const stored = localStorage.getItem("custom_exhibition");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setExhibitions(parsed);
        setSelectedExhibitionId(parsed[0]?.id || null);
      } catch (e) {
        console.error("Failed to parse exhibitions:", e);
      }
    }
  }, [id, source]);

  const imageUrl =
    artwork?.source === "aic"
      ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
      : artwork?.primaryImage || null;

  const isSaved = exhibitions
    .find((ex) => ex.id === selectedExhibitionId)
    ?.artworks.some((item: any) => item.id === artwork?.id);

  const handleSave = () => {
    if (!artwork || selectedExhibitionId === null) return;

    const updatedExhibitions = exhibitions.map((ex) => {
      if (ex.id === selectedExhibitionId) {
        const alreadySaved = ex.artworks.some(
          (item: any) => item.id === artwork.id
        );
        if (!alreadySaved) {
          return {
            ...ex,
            artworks: [...ex.artworks, artwork],
          };
        }
      }
      return ex;
    });

    setExhibitions(updatedExhibitions);
    localStorage.setItem(
      "custom_exhibition",
      JSON.stringify(updatedExhibitions)
    );
  };

  const handleRemove = () => {
    if (!artwork || selectedExhibitionId === null) return;

    const updatedExhibitions = exhibitions.map((ex) => {
      if (ex.id === selectedExhibitionId) {
        return {
          ...ex,
          artworks: ex.artworks.filter((item: any) => item.id !== artwork.id),
        };
      }
      return ex;
    });

    setExhibitions(updatedExhibitions);
    localStorage.setItem(
      "custom_exhibition",
      JSON.stringify(updatedExhibitions)
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-medium">Loading...</p>
      </div>
    );

  if (!artwork)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-medium text-red-500">Artwork not found.</p>
      </div>
    );

  return (
    <div className="flex justify-center px-4 py-12 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6">{artwork.title}</h1>

        {imageUrl && (
          <div className="flex justify-center mb-6">
            <img
              src={imageUrl}
              alt={artwork.title}
              className="w-full max-w-lg rounded shadow-md"
            />
          </div>
        )}

        <div className="space-y-3 text-lg text-gray-700 mb-6">
          <p>
            <span className="font-semibold text-gray-900">Artist:</span>{" "}
            {artwork.artist_title || artwork.artistDisplayName || "Unknown"}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Date:</span>{" "}
            {artwork.date_display || artwork.objectDate || "N/A"}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Origin:</span>{" "}
            {artwork.place_of_origin || artwork.artistNationality || "Unknown"}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Medium:</span>{" "}
            {artwork.medium_display || artwork.medium || "N/A"}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Dimensions:</span>{" "}
            {artwork.dimensions || "N/A"}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Credit Line:</span>{" "}
            {artwork.credit_line || artwork.creditLine || "N/A"}
          </p>
        </div>

        <div className="flex justify-center">
          {isSaved ? (
            <button
              onClick={handleRemove}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
            >
              Remove from Collection
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
            >
              Save to Collection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleArtwork;
