import axios from "axios";

const chicagoAPI = "https://api.artic.edu/api/v1/artworks?limit=100";

export const fetchChicagoArtwork = async () => {
  try {
    const response = await axios.get(chicagoAPI);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchMetEuropeanArtIDs = async () => {
  try {
    const response = await axios.get(
      "https://collectionapi.metmuseum.org/public/collection/v1/search?q=European&medium=Paintings&hasImages=true"
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
          fields: "id,title,image_id,artist_title, date_display, accessionYear",
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
