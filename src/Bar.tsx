import { BellIcon, HomeIcon, UserIcon } from "@heroicons/react/24/outline";
import "./App.css";

function Bar() {
  return (
    <header className="w-full bg-white shadow px-4 py-5 flex items-center justify-between">
      <div className="text-xl font-bold text-gray-800">iMuseum</div>

      <div className="flex gap-4 items-center">
        <HomeIcon className="h-7 w-7 text-gray-600 hover:text-blue-600 cursor-pointer" />
        <BellIcon className="h-7 w-7 text-gray-600 hover:text-blue-600 cursor-pointer" />
        <UserIcon className="h-7 w-7 text-gray-600 hover:text-blue-600 cursor-pointer" />
      </div>
    </header>
  );
}

export default Bar;
