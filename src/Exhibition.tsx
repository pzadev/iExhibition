import { useEffect, useState } from "react";

type Source = "aic" | "met";

interface Artwork {
  id: number;
  title: string;
  source: Source;

  artist_title?: string;
  date_end?: number;
  place_of_origin?: string;
  image_id?: string;

  artistDisplayName?: string;
  accessionYear?: number;
  artistNationality?: string;
  primaryImage?: string;
}

interface Exhibition {
  id: number;
  name: string;
  artworks: Artwork[];
}

const Exhibition: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<number | null>(
    null
  );

  useEffect(() => {
    const allExhibitions: Exhibition[] = [];

    const metRaw = localStorage.getItem("met_exhibitions");
    console.log("metRaw:", metRaw);
    if (metRaw) {
      try {
        const metExhibitions: Exhibition[] = JSON.parse(metRaw);
        allExhibitions.push(...metExhibitions);
      } catch (err) {
        console.error("Failed to parse met_exhibitions:", err);
      }
    }

    const chicagoRaw = localStorage.getItem("chicago_exhibitions");
    console.log("chicagoRaw:", chicagoRaw);
    if (chicagoRaw) {
      try {
        const chicagoExhibitions: Exhibition[] = JSON.parse(chicagoRaw);
        allExhibitions.push(...chicagoExhibitions);
      } catch (err) {
        console.error("Failed to parse chicago_exhibitions:", err);
      }
    }

    if (allExhibitions.length > 0) {
      setExhibitions(allExhibitions);
      setSelectedExhibition(allExhibitions[0]?.id || null);
    } else {
      const customExhibition: Exhibition = {
        id: Date.now(),
        name: "Your Custom Exhibition",
        artworks: [],
      };
      setExhibitions([customExhibition]);
      setSelectedExhibition(customExhibition.id);
    }
  }, []);

  const removeArtworkFromExhibition = (artwork: Artwork) => {
    if (selectedExhibition === null) return;

    const updatedExhibitions = exhibitions.map((exhibition) => {
      if (exhibition.id === selectedExhibition) {
        return {
          ...exhibition,
          artworks: exhibition.artworks.filter(
            (item) => item.id !== artwork.id
          ),
        };
      }
      return exhibition;
    });

    setExhibitions(updatedExhibitions);

    const originalExhibition = exhibitions.find(
      (ex) => ex.id === selectedExhibition
    );

    if (originalExhibition) {
      const source = originalExhibition.artworks[0]?.source || artwork.source;

      const storageKey =
        source === "aic" ? "chicago_exhibitions" : "met_exhibitions";

      const updatedSubset = updatedExhibitions.filter((exhibition) =>
        exhibition.artworks.some((art) => art.source === source)
      );

      localStorage.setItem(storageKey, JSON.stringify(updatedSubset));
    }
  };

  const selected = exhibitions.find(
    (exhibition) => exhibition.id === selectedExhibition
  );

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Exhibitions</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        {exhibitions.map((exhibition) => (
          <button
            key={exhibition.id}
            onClick={() => setSelectedExhibition(exhibition.id)}
            className={`px-4 py-2 rounded ${
              selectedExhibition === exhibition.id
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {exhibition.name}
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{selected.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {selected.artworks.map((artwork) => (
              <div
                key={`${artwork.source}-${artwork.id}`}
                className="bg-white rounded-lg shadow-md p-4 max-w-sm"
              >
                {artwork.source === "aic" && artwork.image_id ? (
                  <img
                    src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
                    alt={artwork.title}
                    className="w-full h-auto rounded mb-4"
                  />
                ) : artwork.source === "met" && artwork.primaryImage ? (
                  <img
                    src={artwork.primaryImage}
                    alt={artwork.title}
                    className="w-full h-auto rounded mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
                    <span className="text-gray-600">No Image Available</span>
                  </div>
                )}

                <h2 className="text-xl font-semibold">{artwork.title}</h2>

                <p className="text-gray-700">
                  {artwork.artist_title ||
                    artwork.artistDisplayName ||
                    "Unknown Artist"}
                </p>

                <p className="text-gray-500 text-sm">
                  {artwork.place_of_origin || artwork.artistNationality || ""}
                </p>

                <p className="text-gray-500 text-sm">
                  Year: {artwork.date_end || artwork.accessionYear || "Unknown"}
                </p>

                <button
                  onClick={() => removeArtworkFromExhibition(artwork)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Remove from Exhibition
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Exhibition;
