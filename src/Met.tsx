import "./App.css";
import { fetchMetObjectById, fetchMetEuropeanArtIDs } from "../api";
import { useEffect, useState } from "react";

function Met() {

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

  type Exhibition = {
    id: string;
    name: string;
    artworks: Artwork[];
  };

  const [metArt, setMetArt] = useState<Artwork[]>([]);
  const [filteredArt, setFilteredArt] = useState<Artwork[]>([]);
  const [selectedNationality, setSelectedNationality] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("Newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<string | null>(
    null
  );

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
      const ids = await fetchMetEuropeanArtIDs();
      const sliced = ids.slice(0, 50);

      const objectPromises = sliced.map((id: number) => fetchMetObjectById(id));
      const artworks = await Promise.all(objectPromises);

      const filtered = artworks.filter(
        (artwork) => artwork.primaryImage !== ""
      );

      setMetArt(filtered);
      setFilteredArt(filtered);
    };

    fetchMetData();
  }, []);

  useEffect(() => {
    const filtered = metArt
      .filter((art) =>
        selectedNationality === "All"
          ? true
          : art.artistNationality === selectedNationality
      )
      .sort((a, b) =>
        sortOrder === "Newest"
          ? (b.accessionYear ?? 0) - (a.accessionYear ?? 0)
          : (a.accessionYear ?? 0) - (b.accessionYear ?? 0)
      );
    setFilteredArt(filtered);
    setCurrentPage(1);
  }, [selectedNationality, sortOrder, metArt]);

  const nationalityOptions = [
    "All",
    ...Array.from(new Set(metArt.map((art) => art.artistNationality))),
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArt.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArt.length / itemsPerPage);

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

  return (
    <>
      <div className="flex-col"></div>

      <h1 className="font-medium text-center text-2xl mt-10 mb-4">Met Art Museum</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <select
          value={selectedNationality}
          onChange={(e) => setSelectedNationality(e.target.value)}
          className="p-2 border border-gray-400 rounded"
        >
          {nationalityOptions.map((nationality, idx) => (
            <option key={idx} value={nationality}>
              {nationality}
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
        <div className="flex flex-wrap justify-center gap-10 mt-3">
          {currentItems.map((artwork, index) => (
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
              {isArtworkSaved(artwork) ? (
                <button
                  onClick={() => removeArtwork(artwork)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Remove from Exhibition
                </button>
              ) : (
                <button
                  onClick={() => saveArtwork(artwork)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save to Exhibition
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mt-5">Loading artworks...</p>
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
        <h2 className="text-2xl font-bold mb-4">Your Exhibitions</h2>
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
        {selectedExhibition && (
          <div>
            <h3 className="text-xl font-bold mb-4">
              {
                exhibitions.find(
                  (exhibition) => exhibition.id === selectedExhibition
                )?.name
              }
            </h3>
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

                      <h2 className="text-lg font-bold">{artwork.title}</h2>
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
