import { FaUserEdit, FaLeaf } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { IoMdSwitch } from "react-icons/io";
import UpdateProfilePicture from "../components/UpdateProfilePicture";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { IoChevronForward } from "react-icons/io5";
import { logout } from "../../../reducers/authSlice";
import { MdOutlineLocationSearching } from "react-icons/md";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <div className="min-h-screen  from-slate-100 to-gray-200 flex items-center justify-center p-4">
        <div className="text-center">
          <svg
            className="hidden animate-spin h-8 w-8 text-slate-600 mx-auto mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-slate-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitialsAvatarUrl = (
    firstName?: string,
    lastName?: string,
    size = 128
  ) => {
    const name = `${firstName || ""} ${lastName || ""}`.trim();
    if (!name)
      return `https://ui-avatars.com/api/?name=?&size=${size}&background=random&color=fff`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&size=${size}&background=random&color=fff&rounded=true`;
  };

  const profilePictureUrl =
    user.profilePicture?.url ||
    getInitialsAvatarUrl(user.firstName, user.lastName, 200);

  const activityLinks = [
    {
      to: "/dropoff/all",
      icon: <MdOutlineLocationSearching size={22} className="text-blue-500" />,
      label: "My Drop-offs",
    },
  ];

  const accountLinks = [
    {
      to: "/profile/update-profile",
      icon: <FaUserEdit size={20} className="text-sky-500" />,
      label: "Edit Profile",
    },
    {
      to: "/green-profile",
      icon: <FaLeaf size={20} className="text-green-500" />,
      label: "Green Profile",
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <div className="max-w-md mx-auto">
        <div className="bg-white text-black p-6 pt-8 text-center relative shadow-sm">
          <div className="relative z-10 mb-4">
            <UpdateProfilePicture oldPicture={profilePictureUrl} />
          </div>
          <h1 className="relative z-10 text-2xl font-semibold text-slate-800">
            {user.firstName} {user.lastName}
          </h1>
          <p className="relative z-10 text-sm text-slate-600 mt-1">
            {user.email}
          </p>
        </div>

        <div className="p-4 space-y-5">
          <div className="bg-white rounded-xl shadow-md">
            <h2 className="text-xs font-semibold text-gray-500 uppercase p-3.5 border-b border-gray-100 tracking-wider">
              Activity
            </h2>
            <ul className="divide-y divide-gray-100">
              {activityLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="p-1.5 bg-gray-100 rounded-full">
                        {item.icon}
                      </span>{" "}
                      {/* Icon background */}
                      <span className="text-slate-700 font-medium group-hover:text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    <IoChevronForward className="text-gray-400 group-hover:text-gray-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-md">
            <h2 className="text-xs font-semibold text-gray-500 uppercase p-3.5 border-b border-gray-100 tracking-wider">
              Account
            </h2>
            <ul className="divide-y divide-gray-100">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="p-1.5 bg-gray-100 rounded-full">
                        {item.icon}
                      </span>{" "}
                      {/* Icon background */}
                      <span className="text-slate-700 font-medium group-hover:text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    <IoChevronForward className="text-gray-400 group-hover:text-gray-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Conditional Admin Link - Styled as a distinct action button/card */}
          {user.isAdmin && (
            <Link
              to="/admin/pickup/pickups"
              className="block w-full p-4 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-150 group text-center"
            >
              <div className="flex items-center justify-center space-x-2.5">
                <IoMdSwitch size={22} />
                <span>Switch to Collector View</span>
              </div>
            </Link>
          )}
          <div className="pt-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3.5 space-x-3 bg-white text-red-500 font-medium rounded-xl shadow-md hover:bg-red-50 hover:text-red-600 transition-colors duration-150 group border border-red-200 hover:border-red-300"
            >
              <GoSignOut size={18} className="group-hover:text-red-600" />
              <span>Logout</span>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 pt-4">
            App Version 1.0.1
          </p>{" "}
          {/* Updated version for 2.0 ;) */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
