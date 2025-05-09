import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import {
  HomeIcon,
  UserIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

function Bar() {
  const currentPath = window.location.pathname;
  const { theme, toggleTheme } = useContext(ThemeContext);

  function changeTheme() {
    console.log("Theme changed");
    toggleTheme();
    console.log("New theme:", theme);
  }

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b-2 border-gray-400 dark:border-gray-700 shadow px-4 py-5 flex items-center justify-between">
      <div className="text-3xl font-bold text-gray-800 dark:text-white">
        iMuseum
      </div>

      <div className="flex gap-4 items-center">
        <span onClick={() => (window.location.href = "/")}>
          <HomeIcon
            className={`h-8 w-8 cursor-pointer ${
              currentPath === "/"
                ? "text-green-600"
                : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            }`}
          />
        </span>

        <span onClick={() => (window.location.href = "/profile")}>
          <UserIcon
            className={`h-8 w-8 cursor-pointer ${
              currentPath === "/profile"
                ? "text-green-600"
                : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            }`}
          />
        </span>

        {theme === "light" ? (
          <MoonIcon
            onClick={changeTheme}
            className="h-8 w-8 text-blue-500 hover:text-blue-600 cursor-pointer"
          />
        ) : (
          <SunIcon
            onClick={changeTheme}
            className="h-8 w-8 text-yellow-400 hover:text-yellow-300 cursor-pointer"
          />
        )}
      </div>
    </header>
  );
}

export default Bar;
