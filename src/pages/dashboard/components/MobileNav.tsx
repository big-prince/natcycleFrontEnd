import { BiHome } from "react-icons/bi";
import { FaStar, FaUser } from "react-icons/fa"; // Using FaStar for Impact, FaUser for You
import { FiMapPin } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
// Removed useAppSelector and tempImage as profile picture is replaced by an icon

const linkList = [
  {
    icon: <BiHome size={22} />, // Adjusted size
    name: "Home",
    link: "/home",
  },
  {
    icon: <FaStar size={20} />, // Using FaStar, adjusted size
    name: "Impact",
    link: "/Impact", // Ensure casing matches your route
  },
  {
    icon: <FiMapPin size={22} />, // Adjusted size
    name: "Where",
    link: "/where",
  },
  {
    icon: <FaUser size={20} />, // Using FaUser for "You"
    name: "You",
    link: "/profile", // Link to profile page
  },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 w-full px-3 pb-3 z-[3000]"> {/* Adjusted padding */}
      <div className="bg-gray-100 shadow-lg rounded-2xl px-2 py-3"> {/* Main bar styling */}
        <div className="flex justify-around items-center w-full">
          {linkList.map((item) => {
            const isActive = location.pathname === item.link || (item.link === "/home" && location.pathname === "/"); // Handle root path for home
            return (
              <NavLink
                key={item.name}
                to={item.link}
                className="flex flex-col items-center justify-center w-1/4" // Ensure equal width
              >
                <div
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center mb-1 transition-colors duration-200
                    ${isActive
                      ? "bg-slate-800 text-white" // Active icon style
                      : "bg-gray-300 text-gray-600" // Inactive icon style
                    }`}
                >
                  {item.icon}
                </div>
                <p
                  className={`text-xs font-medium transition-colors duration-200
                    ${isActive ? "text-slate-800" : "text-gray-500" // Active/Inactive text style
                    }`}
                >
                  {item.name}
                </p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
