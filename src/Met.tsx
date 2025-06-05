import "./App.css";
import {
  fetchMetObjectById,
  fetchMetEuropeanArtIDs,
  fetchMetSearch,
} from "../api";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import exhibitionLoading from "./assets/exhibitionLoading.json";
import { Link } from "react-router-dom";

function Met() {
  type Source = "aic" | "met";

  interface Artwork {
    id: number;
    title: string;
    source: Source;

    artist_title?: string;
    objectID?: number;
    date_end?: number;
    place_of_origin?: string;
    image_id?: string;

    artistDisplayName?: string;
    accessionYear?: number;
    artistNationality?: string;
    primaryImage?: string;
  }

  type Exhibition = {
    id: string;
    name: string;
    artworks: Artwork[];
  };

  const [metArt, setMetArt] = useState<Artwork[]>([]);
  const [filteredArt, setFilteredArt] = useState<Artwork[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("Newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const storedExhibitions = localStorage.getItem("custom_exhibition");
    if (storedExhibitions) {
      const parsed = JSON.parse(storedExhibitions);
      setExhibitions(parsed);
      setSelectedExhibition(parsed[0]?.id || null);
    } else {
      const customExhibition: Exhibition = {
        id: `met-${Date.now()}`,
        name: "Your Custom Exhibition",
        artworks: [],
      };
      setExhibitions([customExhibition]);
      setSelectedExhibition(customExhibition.id);
    }
  }, []);

  useEffect(() => {
    if (exhibitions.length > 0) {
      localStorage.setItem("custom_exhibition", JSON.stringify(exhibitions));
    }
  }, [exhibitions]);

  useEffect(() => {
    const fetchMetData = async () => {
      try {
        setIsLoading(true);
        const ids = await fetchMetEuropeanArtIDs();
        const sliced = ids.slice(0, 50);

        const objectPromises = sliced.map((id: number) =>
          fetchMetObjectById(id)
        );
        const artworks = await Promise.all(objectPromises);

        const filtered = artworks.filter(
          (artwork) => artwork.primaryImage !== ""
        );

        setMetArt(filtered);
        setFilteredArt(filtered);
      } catch (error) {
        console.error("Error fetching Met data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetData();
  }, []);

  useEffect(() => {
    const filtered = metArt
      .filter((art) =>
        selectedArtist === "All"
          ? true
          : art.artistDisplayName === selectedArtist
      )
      .sort((a, b) =>
        sortOrder === "Newest"
          ? (b.accessionYear ?? 0) - (a.accessionYear ?? 0)
          : (a.accessionYear ?? 0) - (b.accessionYear ?? 0)
      );
    setFilteredArt(filtered);
    setCurrentPage(1);
  }, [selectedArtist, sortOrder, metArt]);

  const artistOptions = [
    "All",
    ...Array.from(new Set(metArt.map((art) => art.artistDisplayName))),
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArt.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredArt.length / itemsPerPage));

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const saveArtwork = (artwork: Artwork) => {
    if (selectedExhibition === null) return;

    const updatedExhibitions = exhibitions.map((exhibition) => {
      if (exhibition.id === selectedExhibition) {
        const alreadySaved = exhibition.artworks.some(
          (item) => item.title === artwork.title
        );
        if (!alreadySaved) {
          const enhancedArtwork = {
            ...artwork,
            source: "met" as const,
          };
          return {
            ...exhibition,
            artworks: [...exhibition.artworks, enhancedArtwork],
          };
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
            (item) => item.title !== artwork.title
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
    return (
      exhibition?.artworks.some((item) => item.title === artwork.title) || false
    );
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      const ids = await fetchMetSearch(searchTerm.trim());

      if (ids && ids.length) {
        const objectPromises = ids.slice(0, 50).map(fetchMetObjectById);
        const artworks = await Promise.all(objectPromises);
        const filtered = artworks.filter(
          (art) => art && art.primaryImage !== ""
        );

        setMetArt(filtered);
        setFilteredArt(filtered);
        setSelectedArtist("All");
      } else {
        setMetArt([]);
        setFilteredArt([]);
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
        className="w-100 h-100 "
      />
      <p className="text-2xl font-bold mt-3 text-black">
        Loading Met Museum's Exhibition!
      </p>
    </div>
  ) : (
    <>
      <main className="flex flex-col items-center justify-center px-4 py-8">
        <h1 className="font-medium text-center text-2xl mt-5 mb-4">
          Met Art Museum Exhibition
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl">
          Discover the MET's rich art collection and curate your own exhibition
          by saving artworks to your personal collection. You can filter by art
          piece name, artist and sort by date or click on the artwork to view
          more details!
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <input
            type="text"
            placeholder="Search by piece name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="p-2 border border-gray-400 rounded w-64"
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

        {filteredArt.length === 0 ? (
          <p className="text-center text-xl text-gray-500 mt-8">
            No results found. Try another search term.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-10 mt-3">
            {currentItems.map((artwork) => (
              <Link
                key={artwork.objectID}
                to={`/artwork/met/${artwork.objectID}`}
                className="no-underline text-black"
              >
                <div className="bg-gray-200 w-80 h-130 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                  {artwork && (
                    <img
                      src={artwork.primaryImage}
                      alt={artwork.title}
                      className="mb-4 w-90 h-70 rounded"
                    />
                  )}
                  <h2 className="text-lg font-bold">
                    {artwork.title.length > 25
                      ? artwork.title.slice(0, 25) + "..."
                      : artwork.title}
                  </h2>
                  <p className="text-md font-semibold">
                    {artwork.artistNationality || "Unknown Nationality"} -{" "}
                    {artwork.accessionYear}
                  </p>
                  <p className="text-md text-black">
                    {artwork.artistDisplayName || "Unknown Artist"}
                  </p>
                  {isArtworkSaved(artwork) ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeArtwork(artwork);
                      }}
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Remove from your Exhibition
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        saveArtwork(artwork);
                      }}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Save to your Exhibition
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
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
      </main>

      <div className="mt-10 w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Your Exhibitions
        </h2>
        {/* <div className="flex flex-wrap gap-4 mb-4 justify-center">
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
        {selectedExhibition && (
          <div>
            <div className="flex flex-wrap justify-center gap-10 mt-3">
              {exhibitions
                .find((exhibition) => exhibition.id === selectedExhibition)
                ?.artworks.map((artwork, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 w-90 h-auto p-6 rounded-lg shadow-md flex flex-col items-center text-center"
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
                        "Unknown Origin"}
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
                      Remove from your Exhibition
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Met;
