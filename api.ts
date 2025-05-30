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
