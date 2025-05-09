function Home() {
  return (
    <>
      <div className="flex-col">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to iMuseum</h1>
        <div className="flex-row">
          <div className="flex flex-wrap gap-5 mt-3">
            <span
              onClick={() => (window.location.href = "/chicago")}
              className="cursor-pointer"
            >
              <div className="bg-blue-200 w-110 h-auto p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <img
                  src="https://media.timeout.com/images/102850781/image.jpg"
                  alt="Art Institute of Chicago"
                  className="mb-4 h-[300px] w-[400px]  rounded"
                />
                <h2 className="text-lg font-bold">
                  Art Institute of Chicago
                </h2>
                <p className="text-md text-black font-semibold ">Chicago, IN </p>
              </div>
            </span>
            <span
              onClick={() => (window.location.href = "/met")}
              className="cursor-pointer"
            >
              <div className="bg-gray-400 w-110 h-auto p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <img
                  src="https://cdn.sanity.io/images/cctd4ker/production/c47d68fbeb2ac1df1c97065fc4c9576314114ac2-2100x1150.jpg?rect=539,36,1011,1074&w=3840&q=75&fit=clip&auto=format"
                  alt="The Metropolitan Museum of Art"
                  className="mb-4 h-[300px] w-[400px]  rounded"
                />
                <h2 className="text-lg font-bold">
                  The Metropolitan Museum of Art
                </h2>
                <p className="text-md text-black font-semibold">New York, NY</p>
              </div>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
