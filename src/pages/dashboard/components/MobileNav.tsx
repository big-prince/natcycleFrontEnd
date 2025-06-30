import { BiHome } from "react-icons/bi";
import { FaStar, FaUser } from "react-icons/fa"; // Using FaStar for Impact, FaUser for You
import { FiMapPin } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";

const linkList = [
  {
    icon: <BiHome size={22} />,
    name: "Home",
    link: "/home",
  },
  {
    icon: <FaStar size={20} />,
    name: "Impact",
    link: "/Impact",
  },
  {
    icon: <FiMapPin size={22} />,
    name: "Where",
    link: "/where",
  },
  {
    icon: <FaUser size={20} />,
    name: "You",
    link: "/profile",
  },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 w-full px-3 pb-3 z-[3000]">
      {" "}
      {/* Adjusted padding */}
      <div className="bg-gray-100 shadow-lg rounded-2xl px-2 py-3">
        {" "}
        {/* Main bar styling */}
        <div className="flex justify-around items-center w-full">
          {linkList.map((item) => {
            const isActive =
              location.pathname === item.link ||
              (item.link === "/home" && location.pathname === "/");
            return (
              <NavLink
                key={item.name}
                to={item.link}
                className="flex flex-col items-center justify-center w-1/4"
              >
                <div
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center mb-1 transition-colors duration-200
                    ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                >
                  {item.icon}
                </div>
                <p
                  className={`text-xs font-medium transition-colors duration-200
                    ${
                      isActive ? "text-slate-800" : "text-gray-500" //
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
