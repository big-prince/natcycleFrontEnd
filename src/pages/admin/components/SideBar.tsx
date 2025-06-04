import { Link, NavLink, useNavigate } from "react-router-dom";
import { MdWork } from "react-icons/md";
import LogoWhite from "../../../assets/logo.png"; // Assuming this is your white/transparent logo
import { HiMiniUsers } from "react-icons/hi2";
import { IoLogOut } from "react-icons/io5";
import { logout } from "../../../reducers/authSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { SlBadge } from "react-icons/sl";
import { TiAnchorOutline, TiGift } from "react-icons/ti";
import { RiMegaphoneFill } from "react-icons/ri";
import { FaBox, FaShapes } from "react-icons/fa";
import { LuNetwork } from "react-icons/lu";
import {
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiUsers,
  FiBox as FiBoxIcon,
  FiShuffle,
  FiPieChart,
} from "react-icons/fi";
import { useState } from "react";

const Links = [
  {
    title: "Users",
    icon: <HiMiniUsers size={20} />,
    path: "/admin/users",
  },
  {
    title: "Pickups",
    icon: <MdWork size={20} />,
    path: "/admin/pickups",
  },
  {
    title: "Drop Offs",
    icon: <FaBox size={18} />,
    path: "/admin/dropoffs",
  },
  {
    title: "Dropoff Locations",
    icon: <FaBox size={18} />,
    path: "/admin/dropoff-locations",
  },
  {
    title: "Badges",
    icon: <SlBadge size={20} />,
    path: "/admin/badges",
  },
  {
    title: "Rewards",
    icon: <TiGift size={20} />,
    path: "/admin/rewards",
  },
  {
    title: "Redeemed Rewards",
    icon: <TiAnchorOutline size={20} />,
    path: "/admin/redeemed",
  },
  {
    title: "Campaigns",
    icon: <RiMegaphoneFill size={20} />,
    path: "/admin/campaign",
  },
  {
    title: "Materials", // New Link
    icon: <FaShapes size={19} />, // New Icon
    path: "/admin/materials", // New Path
  },
];

const thingsMatchSubLinks = [
  {
    title: "TM Dashboard",
    icon: <FiGrid size={18} />,
    path: "/admin/thingsmatch", // Main dashboard for ThingsMatch
  },
  {
    title: "TM Users",
    icon: <FiUsers size={18} />,
    path: "/admin/thingsmatch/users",
  },
  {
    title: "TM Items",
    icon: <FiBoxIcon size={18} />,
    path: "/admin/thingsmatch/items",
  },
  {
    title: "TM Matches",
    icon: <FiShuffle size={18} />,
    path: "/admin/thingsmatch/matches",
  },
  {
    title: "TM Breakdown",
    icon: <FiPieChart size={18} />,
    path: "/admin/thingsmatch/breakdown",
  },
];

const SideBar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isThingsMatchOpen, setIsThingsMatchOpen] = useState(false); // State for ThingsMatch dropdown

  // Redirect to login if user is not authenticated
  // This should ideally be handled by a protected route component wrapping admin pages
  if (!user) {
    // Consider navigating within a useEffect to avoid issues during render
    // For now, keeping it simple as per original logic
    navigate("/admin/login");
    return null; // Return null or a loading indicator while redirecting
  }

  const handleLogout = () => {
    dispatch(logout());
    // Navigation to login page will be handled by the auth state change / protected route
  };

  return (
    <div className="fixed top-0 left-0 bg-black w-64 h-full flex flex-col p-4 transition-all duration-300 ease-in-out overflow-y-auto">
      {/* Logo Section */}
      <div className="mb-8 pt-2 px-2">
        <Link to="/admin/users" className="flex items-center space-x-2">
          <img className="h-10" src={LogoWhite} alt="NatCycle Admin" />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow space-y-1">
        {Links.map((link) =>
          user.role === "admin" || link.title !== "Management" ? ( // Assuming 'Management' was a role-specific link
            <NavLink
              key={link.title}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center py-2.5 px-3 rounded-sm text-sm font-medium transition-colors duration-150 group
                ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="mr-3 group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              <span>{link.title}</span>
            </NavLink>
          ) : null
        )}

        {/* ThingsMatch Section */}
        {user && (
          <div className="pt-2">
            <button
              onClick={() => setIsThingsMatchOpen(!isThingsMatchOpen)}
              className="flex items-center justify-between w-full py-2.5 px-3 rounded-sm text-sm font-bold text-amber-400 hover:bg-slate-800 transition-colors duration-150 group"
            >
              <div className="flex items-center">
                <span className="mr-3 text-amber-400 group-hover:scale-110 transition-transform">
                  <LuNetwork size={18} /> {/* Updated Icon for ThingsMatch */}
                </span>
                <span>ThingsMatch</span>
              </div>
              {isThingsMatchOpen ? (
                <FiChevronDown size={18} className="text-slate-400" />
              ) : (
                <FiChevronRight size={18} className="text-slate-400" />
              )}
            </button>
            {isThingsMatchOpen && (
              <div className="mt-1 pl-4 space-y-1 border-l-2 border-slate-700 ml-3">
                {thingsMatchSubLinks.map((subLink) => (
                  <NavLink
                    key={subLink.title}
                    to={subLink.path}
                    className={({ isActive }) =>
                      `flex items-center py-2 px-3 rounded-sm text-xs font-medium transition-colors duration-150 group
                      ${
                        isActive
                          ? "bg-sky-500 text-white"
                          : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                      }`
                    }
                  >
                    <span className="mr-2.5 group-hover:scale-110 transition-transform">
                      {subLink.icon}
                    </span>
                    <span>{subLink.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Profile & Logout Section */}
      <div className="mt-auto pt-4 border-t border-slate-700/50">
        <div className="flex items-center p-2 rounded-lg hover:bg-slate-800 transition-colors group">
          <img
            className="w-9 h-9 object-cover rounded-full mr-3 border-2 border-slate-600 group-hover:border-sky-500 transition-colors"
            src={
              user?.profilePicture?.url ||
              `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random&color=fff`
            }
            alt="User"
          />
          <div className="flex-grow">
            <p className="text-sm font-semibold text-white leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 capitalize leading-tight">
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="ml-2 p-2 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-700 transition-colors"
          >
            <IoLogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
