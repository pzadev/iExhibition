function Footer() {
  return (
    <footer className="w-full h-25 bg-blue-800 border-t border-gray-300 py-6 mt-10">
      <div className="max-w-6xl mx-auto px-6 text-center text-white">
        <p className="text-xs mb-2 text-gray-300">
          Designed to help you explore and curate art exhibitions to your choosing.
        </p>
        <p className="text-xs font-medium">
          © {new Date().getFullYear()} iExhibition. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
