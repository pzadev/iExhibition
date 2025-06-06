import axios from "axios";

export const fetchChicagoArtwork = async () => {
  try {
    const response = await axios.get(
      "https://api.artic.edu/api/v1/artworks?limit=100"
    );
    const artworks = response.data.data;
    const artworksWithImages = artworks.filter(
      (artwork: any) => artwork.image_id && artwork.image_id.trim() !== ""
    );
    return artworksWithImages;
  } catch (error) {
    console.log(error);
  }
};

export const fetchMetEuropeanArtIDs = async () => {
  try {
    const response = await axios.get(
      "https://collectionapi.metmuseum.org/public/collection/v1/objects"
    );

    return response.data.objectIDs;
  } catch (error) {
    console.log(error);
  }
};

export const fetchMetObjectById = async (id: number) => {
  try {
    const response = await axios.get(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchChicagoSearch = async (artistName: string) => {
  try {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/search`,
      {
        params: {
          q: artistName,
          fields:
            "id,title,image_id,artist_title, date_display, place_of_origin",
          limit: 25,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching artist search results:", error);
    return null;
  }
};

export const fetchMetSearch = async (searchTerm: string) => {
  try {
    const response = await axios.get(
      `https://collectionapi.metmuseum.org/public/collection/v1/search`,
      { params: { q: searchTerm } }
    );

    if (!response.data.objectIDs || response.data.objectIDs.length === 0) {
      console.warn("No artworks found for the search term:", searchTerm);
      return [];
    }

    return response.data.objectIDs || [];
  } catch (error) {
    console.error("Error fetching Met search results:", error);
    return [];
  }
};

export const fetchChicagoSingle = async (artworkId: string) => {
  try {
    const response = await axios.get(
      `https://api.artic.edu/api/v1/artworks/${artworkId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch artwork details:", error);
  }
};

export const fetchMetSingle = async (artworkId: string) => {
  try {
    const response = await axios.get(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${artworkId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch Met artwork details:", error);
  }
};
