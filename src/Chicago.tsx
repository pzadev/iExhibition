import { useEffect, useState } from "react";
import { fetchChicagoArtwork } from "../api.ts";

interface Artwork {
  id: number;
  title: string;
  artist_title: string;
  date_end: number;
  place_of_origin: string;
  image_id: string;
}

interface Exhibition {
  id: number;
  name: string;
  artworks: Artwork[];
}

const Chicago: React.FC = () => {
  const [chicagoArt, setChicagoArt] = useState<Artwork[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("Newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<number | null>(
    null
  );
  const [newExhibitionName, setNewExhibitionName] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchChicagoArtwork();
        setChicagoArt(data.data);
      } catch (error) {
        console.error("Error fetching artwork:", error);
      }
    }

    fetchData();

    const savedExhibitions = localStorage.getItem("exhibitions");
    if (savedExhibitions) {
      setExhibitions(JSON.parse(savedExhibitions));
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

  useEffect(() => {
    localStorage.setItem("exhibitions", JSON.stringify(exhibitions));
  }, [exhibitions]);

  const artistOptions = [
    "All",
    ...Array.from(
      new Set(chicagoArt.map((art) => art.artist_title || "Unknown Artist"))
    ),
  ];

  const filteredAndSortedArt = chicagoArt
    .filter((art) =>
      selectedArtist === "All"
        ? true
        : (art.artist_title || "Unknown Artist") === selectedArtist
    )
    .sort((a, b) =>
      sortOrder === "Newest" ? b.date_end - a.date_end : a.date_end - b.date_end
    );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedArt.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAndSortedArt.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const createExhibition = () => {
    if (newExhibitionName.trim() === "") return;
    const newExhibition: Exhibition = {
      id: Date.now(),
      name: newExhibitionName,
      artworks: [],
    };
    setExhibitions([...exhibitions, newExhibition]);
    setNewExhibitionName("");
  };

  const addArtworkToExhibition = (artwork: Artwork) => {
    if (selectedExhibition === null) return;
    const updatedExhibitions = exhibitions.map((exhibition) => {
      if (exhibition.id === selectedExhibition) {
        if (!exhibition.artworks.some((item) => item.id === artwork.id)) {
          return {
            ...exhibition,
            artworks: [...exhibition.artworks, artwork],
          };
        }
      }
      return exhibition;
    });
    setExhibitions(updatedExhibitions);
  };

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
  };

  const isArtworkInExhibition = (artwork: Artwork) => {
    if (selectedExhibition === null) return false;
    const exhibition = exhibitions.find(
      (exhibition) => exhibition.id === selectedExhibition
    );
    return exhibition?.artworks.some((item) => item.id === artwork.id) || false;
  };

  return (
    <main className="flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Artworks Related to Chicago
      </h1>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentItems.map((artwork) => (
          <div
            key={artwork.id}
            className="bg-white rounded-lg shadow-md p-4 max-w-sm"
          >
            {artwork.image_id ? (
              <img
                src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
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
              {artwork.artist_title || "Unknown Artist"}
            </p>
            <p className="text-gray-500 text-sm">{artwork.place_of_origin}</p>
            <p className="text-gray-500 text-sm">Year: {artwork.date_end}</p>
            {/* {isArtworkInExhibition(artwork) ? (
              <button
                onClick={() => removeArtworkFromExhibition(artwork)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
              >
                Remove from Exhibition
              </button>
            ) : (
              <button
                onClick={() => addArtworkToExhibition(artwork)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add to Exhibition
              </button>
            )} */}
          </div>
        ))}
      </div>

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
  );
};

export default Chicago;
