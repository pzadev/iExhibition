import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Welcome to iExhibition
      </h1>
      <p className="text-lg text-gray-600 text-center mb-8 max-w-2xl">
        Discover curated exhibitions from renowned museums or start building
        your own collection.
      </p>

      <div className="flex flex-wrap gap-10 justify-center mb-12">
        <div
          onClick={() => navigate("/chicago")}
          className="cursor-pointer bg-blue-200 w-[400px] p-6 rounded-lg shadow-md flex flex-col items-center text-center transition-transform hover:scale-105"
        >
          <img
            src="https://media.timeout.com/images/102850781/image.jpg"
            alt="Art Institute of Chicago"
            className="mb-4 h-[300px] w-full object-cover rounded"
          />
          <h2 className="text-xl font-bold">Art Institute of Chicago</h2>
          <p className="text-md text-black font-semibold">Chicago, IL</p>
        </div>

        <div
          onClick={() => navigate("/met")}
          className="cursor-pointer bg-gray-400 w-[400px] p-6 rounded-lg shadow-md flex flex-col items-center text-center transition-transform hover:scale-105"
        >
          <img
            src="https://cdn.sanity.io/images/cctd4ker/production/c47d68fbeb2ac1df1c97065fc4c9576314114ac2-2100x1150.jpg?rect=539,36,1011,1074&w=3840&q=75&fit=clip&auto=format"
            alt="The Metropolitan Museum of Art"
            className="mb-4 h-[300px] w-full object-cover rounded"
          />
          <h2 className="text-xl font-bold">The Metropolitan Museum of Art</h2>
          <p className="text-md text-black font-semibold">New York, NY</p>
        </div>
      </div>

      <button
        onClick={() => navigate("/exhibition")}
        className="bg-blue-800 hover:bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md font-semibold text-lg cursor-pointer transition-transform hover:scale-105"
      >
        Create or View your own Exhibitions
      </button>
    </div>
  );
}

export default Home;
