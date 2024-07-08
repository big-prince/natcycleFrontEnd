import { Link, NavLink, useNavigate } from "react-router-dom";
import { MdWork } from "react-icons/md";
// import LogoIcon from "../../assets/logo/logo-icon.png";
import LogoWhite from "../../../assets/logo.png";
import { HiMiniUsers } from "react-icons/hi2";
import { IoLogOut } from "react-icons/io5";
import { logout } from "../../../reducers/authSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";

const Links = [
  {
    title: "Users",
    icon: <HiMiniUsers />,
    path: "/admin/users",
  },
  {
    title: "Pickups",
    icon: <MdWork />,
    path: "/admin/pickups",
  },
];

const SideBar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    navigate("/admin/login");
  }

  const handleLogout = () => {
    console.log("Logout");

    dispatch(logout());
  };

  return (
    <div className="p-4 pl-0 fixed top-0 bg-black w-72 h-full">
      <div className="mb-6 flex items-center">
        <Link
          to="/admin/jobs"
          className="p-3 font-medium text-3xl text-center text-white"
        >
          <img className="h-14" src={LogoWhite} alt="Logo" />
        </Link>
        {/* <p className="text-white font-medium text-2xl">Rite Placement</p> */}
      </div>

      <div className="adminLink">
        {Links.map((link, index) => (
          <div key={index}>
            {user.role === "superadmin" || link.title !== "Management" ? (
              <>
                <NavLink
                  key={index}
                  to={link.path}
                  className="flex items-center p-3 mb-3 text-white"
                  style={({ isActive }) => ({
                    borderLeft: isActive ? "3px solid #0274FB" : "none",
                  })}
                >
                  <span className="icon">{link.icon}</span>
                  <span className="ml-3">{link.title}</span>
                </NavLink>
              </>
            ) : null}
          </div>
        ))}
      </div>

      <div className="text-white absolute w-full bottom-0 items-center p-4">
        <div className="flex justify-between items-center">
          <div className="flex">
            <img
              className="w-10 h-10 object-contain rounded-full mr-2"
              src={user?.profilePicture?.url}
              alt="Profile Picture"
            />

            <div>
              <p>
                {user?.firstName} {user?.lastName} <br />
                <span className="text-xs text-gray-400">{user?.role}</span>
              </p>
              <p className="text-xs text-gray-400 hidden">{user?.email}</p>
            </div>
          </div>

          <div onClick={handleLogout} className="text-white cursor-pointer">
            <IoLogOut />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
