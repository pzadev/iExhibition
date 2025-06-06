import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchChicagoArtwork, fetchChicagoSearch } from "../api";
import Lottie from "lottie-react";
import exhibitionLoading from "./assets/exhibitionLoading.json";
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
}

interface Exhibition {
  id: number;
  name: string;
  artworks: Artwork[];
}

const Chicago: React.FC = () => {
  const [chicagoArt, setChicagoArt] = useState<Artwork[]>([]);
  const [filteredArt, setFilteredArt] = useState<Artwork[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("Newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const storedExhibitions = localStorage.getItem("custom_exhibition");
    let parsed: Exhibition[] = [];

    try {
      parsed = storedExhibitions ? JSON.parse(storedExhibitions) : [];
    } catch (e) {
      console.error("Failed to parse stored exhibitions:", e);
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaultExhibition: Exhibition = {
        id: Date.now(),
        name: "My Exhibition",
        artworks: [],
      };
      setExhibitions([defaultExhibition]);
      setSelectedExhibition(defaultExhibition.id);
      localStorage.setItem(
        "custom_exhibition",
        JSON.stringify([defaultExhibition])
      );
    } else {
      setExhibitions(parsed);
      setSelectedExhibition(parsed[0]?.id || null);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await fetchChicagoArtwork();
        setChicagoArt(data);
        setFilteredArt(data);
      } catch (error) {
        console.error("Error fetching artwork:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (exhibitions.length > 0) {
      localStorage.setItem("custom_exhibition", JSON.stringify(exhibitions));
    }
  }, [exhibitions]);

  useEffect(() => {
    const filtered = chicagoArt
      .filter((art) =>
        selectedArtist === "All"
          ? true
          : (art.artist_title || "Unknown Artist") === selectedArtist
      )
      .sort((a, b) =>
        sortOrder === "Newest"
          ? (b.date_end ?? 0) - (a.date_end ?? 0)
          : (a.date_end ?? 0) - (b.date_end ?? 0)
      );

    setFilteredArt(filtered);
    setCurrentPage(1);
  }, [selectedArtist, sortOrder, chicagoArt]);

  const artistOptions = [
    "All",
    ...Array.from(
      new Set(chicagoArt.map((art) => art.artist_title || "Unknown Artist"))
    ),
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArt.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredArt.length / itemsPerPage));

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const saveArtwork = (artwork: Artwork) => {
    if (selectedExhibition === null) {
      return;
    }

    const updatedExhibitions = exhibitions.map((exhibition) => {
      if (exhibition.id === selectedExhibition) {
        const alreadySaved = exhibition.artworks.some(
          (item) => item.id === artwork.id
        );
        if (!alreadySaved) {
          const enhancedArtwork = {
            ...artwork,
            source: "aic" as const,
          };
          return {
            ...exhibition,
            artworks: [...exhibition.artworks, enhancedArtwork],
          };
        } else {
          console.log("Artwork already saved");
        }
      }
      return exhibition;
    });

    setExhibitions(updatedExhibitions);
  };

  const removeArtwork = (artwork: Artwork) => {
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
  };

  const isArtworkSaved = (artwork: Artwork) => {
    if (selectedExhibition === null) return false;

    const exhibition = exhibitions.find(
      (exhibition) => exhibition.id === selectedExhibition
    );
    return exhibition?.artworks.some((item) => item.id === artwork.id) || false;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetchChicagoSearch(searchQuery);

      if (response) {
        const artworks: Artwork[] = response.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          artist_title: item.artist_title,
          date_end: item.date_display,
          place_of_origin: item.place_of_origin,
          image_id: item.image_id,
          source: "aic",
        }));
        setChicagoArt(artworks);
        setFilteredArt(artworks);
        setSelectedArtist("All");
        setCurrentPage(1);
      } else {
        console.error("No results found for the search query.");
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <div className="flex flex-col justify-center items-center h-130">
      <Lottie
        animationData={exhibitionLoading}
        loop
        autoplay
        className="w-100 h-100"
      />
      <p className="text-2xl font-bold mt-3 text-black">
        Loading Chicago Museum's Exhibition!
      </p>
    </div>
  ) : (
    <main className="flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Chicago Art Museum Exhibition
      </h1>
      <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl">
        Discover Chicago's rich art collection and curate your own exhibition by
        saving artworks to your personal collection. You can filter by artist
        and sort by year or click on an artwork to view more details!
      </p>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search for artworks or artists..."
          className="p-2 border border-gray-400 rounded w-80"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>

        <select
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
          className="p-2 border border-gray-400 rounded"
        >
          {artistOptions.map((artist, idx) => (
            <option key={idx} value={artist}>
              {artist}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border border-gray-400 rounded"
        >
          <option value="Newest">Newest First</option>
          <option value="Oldest">Oldest First</option>
        </select>
      </div>

      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentItems.map((artwork) => (
            <Link to={`/artwork/chicago/${artwork.id}`} key={artwork.id}>
              <div
                key={artwork.id}
                className="bg-gray-200 w-80 h-130 p-6 rounded-lg shadow-md flex flex-col items-center text-center"
              >
                <img
                  src={
                    artwork.image_id
                      ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
                      : noImageDisplay
                  }
                  alt={artwork.title || "No image available"}
                  className="mb-4 w-90 h-70 rounded object-contain bg-gray-100"
                  onError={(e) => {
                    if (e.currentTarget.src !== noImageDisplay) {
                      e.currentTarget.src = noImageDisplay;
                    }
                  }}
                />

                <h2 className="text-xl font-semibold">
                  {artwork.title.length > 25
                    ? artwork.title.slice(0, 25)
                    : artwork.title}
                </h2>
                <p className="text-gray-700">
                  {artwork.artist_title || "Unknown Artist"}
                </p>
                <p className="text-gray-500 text-sm">
                  {artwork.place_of_origin}
                </p>
                <p className="text-gray-500 text-sm">
                  Year: {artwork.date_end}
                </p>
                {isArtworkSaved(artwork) ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeArtwork(artwork);
                    }}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Remove from your Collection
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      saveArtwork(artwork);
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Save to your Collection
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl text-gray-500 mt-4">
          No results found. Try another search term.
        </p>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 mx-1">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="mt-10 w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Your Collection</h2>

        {/* <div className="flex flex-wrap gap-4 mb-4 justify-center text-center">
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
        </div> */}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Lottie
              animationData={exhibitionLoading}
              loop
              autoplay
              className="w-60 h-60"
            />
          </div>
        ) : selectedExhibition ? (
          <div>
            <div className="flex flex-wrap justify-center gap-10 mt-3">
              {exhibitions
                .find((exhibition) => exhibition.id === selectedExhibition)
                ?.artworks.map((artwork, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 w-90 h-110 p-4 rounded-lg shadow-md flex flex-col items-center text-center"
                  >
                    {artwork.source === "aic" && artwork.image_id ? (
                      <img
                        src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
                        alt={artwork.title}
                        className="mb-4 w-60 h-60 rounded"
                      />
                    ) : artwork.source === "met" && artwork.primaryImage ? (
                      <img
                        src={artwork.primaryImage}
                        alt={artwork.title}
                        className="mb-4 w-60 h-60 rounded"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded mb-4">
                        <span className="text-gray-600">
                          No Image Available
                        </span>
                      </div>
                    )}

                    <h2 className="text-lg font-bold">
                      {" "}
                      {artwork.title.length > 30
                        ? artwork.title.slice(0, 30) + "..."
                        : artwork.title}
                    </h2>
                    <p className="text-md font-semibold">
                      {artwork.place_of_origin ||
                        artwork.artistNationality ||
                        ""}
                    </p>
                    <p className="text-gray-700">
                      Artist:{" "}
                      {artwork.artist_title ||
                        artwork.artistDisplayName ||
                        "Unknown Artist"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Year:{" "}
                      {artwork.date_end || artwork.accessionYear || "Unknown"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {artwork.source === "met"
                        ? "Metropolitan Museum of Art"
                        : "Chicago Art Institute"}
                    </p>
                    <button
                      onClick={() => removeArtwork(artwork)}
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Remove from your Collection
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Chicago;
