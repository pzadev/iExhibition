import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import noImageDisplay from "./assets/NoImageAvailableDisplay.jpg";

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
  objectID?: number;
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
  const [sharedArtworks, setSharedArtworks] = useState<Artwork[] | null>(null);
  const [loadingSharedArtworks, setLoadingSharedArtworks] = useState(false);

  const [searchParams] = useSearchParams();

  async function fetchArtwork(id: number, source: Source): Promise<Artwork> {
    if (source === "aic") {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks/${id}`);
      if (!res.ok) throw new Error("Failed to fetch AIC artwork");
      const json = await res.json();
      const d = json.data;
      return {
        id: d.id,
        title: d.title,
        source,
        artist_title: d.artist_title,
        date_end: d.date_end,
        place_of_origin: d.place_of_origin,
        image_id: d.image_id,
      };
    } else if (source === "met") {
      const res = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch Met artwork");
      const d = await res.json();
      return {
        id: d.objectID,
        objectID: d.objectID,
        title: d.title,
        source,
        artistDisplayName: d.artistDisplayName,
        accessionYear: d.accessionYear,
        artistNationality: d.artistNationality,
        primaryImage: d.primaryImage,
      };
    }
    throw new Error("Unknown source");
  }

  useEffect(() => {
    const sharedData = searchParams.get("data");
    if (sharedData) {
      const loadSharedArtworks = async () => {
        setLoadingSharedArtworks(true);
        try {
          const jsonStr = atob(decodeURIComponent(sharedData));
          const minimalArtworks: { id: number; source: Source }[] =
            JSON.parse(jsonStr);

          const fullArtworks = await Promise.all(
            minimalArtworks.map(({ id, source }) => fetchArtwork(id, source))
          );
          setSharedArtworks(fullArtworks);
        } catch (err) {
          console.error("Failed to load shared artworks:", err);
          setSharedArtworks(null);
        } finally {
          setLoadingSharedArtworks(false);
        }
      };

      loadSharedArtworks();
      return;
    }

    const exhibitionRaw = localStorage.getItem("custom_exhibition");
    if (exhibitionRaw) {
      try {
        const stored: Exhibition[] = JSON.parse(exhibitionRaw);
        setExhibitions(stored);
        setSelectedExhibition(stored[0]?.id || null);
      } catch (err) {
        console.error("Failed to parse local exhibition data:", err);
      }
    } else {
      const defaultExhibition: Exhibition = {
        id: Date.now(),
        name: "Your Custom Exhibition",
        artworks: [],
      };
      setExhibitions([defaultExhibition]);
      setSelectedExhibition(defaultExhibition.id);
    }
  }, [searchParams]);

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
    localStorage.setItem(
      "custom_exhibition",
      JSON.stringify(updatedExhibitions)
    );
  };

  const shareExhibition = () => {
    const selected = exhibitions.find((e) => e.id === selectedExhibition);
    if (!selected) return;

    try {
      const minimalData = selected.artworks
        .map((artwork) => {
          const artworkId = artwork.id ?? artwork.objectID;
          if (!artworkId || !artwork.source) return null;
          return { id: artworkId, source: artwork.source };
        })
        .filter(Boolean);

      const json = JSON.stringify(minimalData);
      const base64 = btoa(json);
      const data = encodeURIComponent(base64);
      const url = `${window.location.origin}${window.location.pathname}?data=${data}`;
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to encode exhibition data for sharing:", err);
      alert("Failed to generate shareable link.");
    }
  };

  const selected = exhibitions.find((e) => e.id === selectedExhibition);

  const renderArtworkCard = (artwork: Artwork, isShared: boolean = false) => (
    <div
      key={`${artwork.source}-${artwork.id}`}
      className="bg-white rounded-lg shadow-md p-4 max-w-sm"
    >
      {artwork.source === "aic" && artwork.image_id ? (
        <img
          src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
          alt={artwork.title}
          className="mb-4 w-60 h-60 rounded object-contain"
          onError={(e) => {
            e.currentTarget.src = noImageDisplay;
          }}
        />
      ) : artwork.source === "met" && artwork.primaryImage ? (
        <img
          src={artwork.primaryImage}
          alt={artwork.title}
          className="mb-4 w-60 h-60 rounded object-contain"
          onError={(e) => {
            e.currentTarget.src = noImageDisplay;
          }}
        />
      ) : (
        <img
          src={noImageDisplay}
          alt="No image available"
          className="mb-4 w-60 h-60 rounded object-contain"
        />
      )}

      <h2 className="text-xl font-semibold">
        {" "}
        {artwork.title.length > 30
          ? artwork.title.slice(0, 30) + "..."
          : artwork.title}
      </h2>

      <p className="text-gray-700">
        Artist:{" "}
        {artwork.artist_title || artwork.artistDisplayName || "Unknown Artist"}
      </p>

      <p className="text-gray-700 text-sm">
        Artist Origin:{" "}
        {artwork.place_of_origin ||
          artwork.artistNationality ||
          "Unknown Origin"}
      </p>

      <p className="text-gray-500 text-sm">
        Year: {artwork.date_end || artwork.accessionYear || "Unknown"}
      </p>

      <p className="text-gray-500 text-sm">
        {artwork.source === "met"
          ? "Metropolitan Museum of Art"
          : "Chicago Art Institute"}{" "}
        - ID: {artwork.id || artwork.objectID || "Unknown"}
      </p>

      {!isShared && (
        <button
          onClick={(e) => {
            e.preventDefault();
            removeArtworkFromExhibition(artwork);
          }}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Remove from Collection
        </button>
      )}
    </div>
  );

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {sharedArtworks
          ? loadingSharedArtworks
            ? "Loading Shared Collection..."
            : "Shared Collection"
          : "Your Collection"}
      </h1>

      {!sharedArtworks && (
        <>
          <button
            onClick={shareExhibition}
            className="mb-6 px-4 py-2 bg-green-600 text-white rounded"
          >
            Share This Collection
          </button>
        </>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(sharedArtworks || selected?.artworks || []).map((artwork) =>
          sharedArtworks ? (
            <div key={artwork.id}>{renderArtworkCard(artwork, true)}</div>
          ) : (
            <div>{renderArtworkCard(artwork)}</div>
          )
        )}
      </div>
    </main>
  );
};

export default Exhibition;
