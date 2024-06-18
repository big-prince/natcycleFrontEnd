import { FaUser } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { IoMdSettings } from "react-icons/io";

const tempImage =
  "https://vignette2.wikia.nocookie.net/naruto/images/1/12/La_Promesa_de_Naruto.png/revision/latest?cb=20110825232746&path-prefix=es";

// const ProfileLinks = [
//   {
//     title: "Profile",
//     icon: <FaUser />,
//     link: "/dashboard/profile",
//   },
//   {
//     title: "Settings",
//     icon: <IoMdSettings />,
//     link: "/dashboard/profile/settings",
//   },
//   {
//     title: "Logout",
//     icon: <GoSignOut />,
//     link: "/",
//   },
// ];

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div>
      <div className="p-4 rounded-2xl mt-6">
        <div className="text-center items-center">
          <img
            className="w-20  h-20 m-auto  rounded-full"
            src={tempImage}
            alt="User"
          />
          <div className="ml-4">
            <h1 className="text-xl font-semibold mt-4">John Doe</h1>
            <p className="text-sm">
              <span className="font-normal">samueladeyemi244@gmaill.com</span>
              <span> </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ul className="space-y-2">
          <li className="hidden">
            <Link
              to="/dashboard/profile"
              className="flex items-center space-x-2 p-4 rounded-2xl"
            >
              <FaUser />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/profile/settings"
              className="flex items-center space-x-2 p-4 rounded-2xl"
            >
              <IoMdSettings />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <p
              onClick={() => handleLogout()}
              className="flex items-center space-x-2 p-4 rounded-2xl text-red-500 border-2 border-red-50"
            >
              <GoSignOut />
              <span>Logout</span>
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
