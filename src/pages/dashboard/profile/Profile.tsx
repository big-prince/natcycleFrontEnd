import { FaUser } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { IoMdSettings, IoMdSwitch } from "react-icons/io";
import UpdateProfilePicture from "../components/UpdateProfilePicture";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { IoNotifications } from "react-icons/io5";
// import AuthApi from "../../../api/authApi";
// import { toast } from "react-toastify";
import { TiGift } from "react-icons/ti";
import { logout } from "../../../reducers/authSlice";
import { MdWork } from "react-icons/md";

const tempImage = "https://i.ibb.co/sq0WtbH/trees-119580.png";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    // AuthApi.signout().then((res) => {
    //   console.log(res);
    //   dispatch(logout());
    //   navigate("/");
    // }).then((err) => {
    //   console.log('going out')
    //   console.log(err);
    //   dispatch(logout());
    //   navigate("/");
    // })

    dispatch(logout());
    navigate("/");
  };

  const user = useAppSelector((state) => state.auth.user);

  return (
    <div>
      <div className="p-4 rounded-2xl mt-6">
        <div className="text-center items-center">
          <div>
            <UpdateProfilePicture
              oldPicture={user.profilePicture.url || tempImage}
            />
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-semibold mt-4">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm">
              <span className="font-normal">{user.email}</span>
              <span> </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ul className="space-y-2">
          <li className="hidden">
            <Link
              to="/locations"
              className="flex items-center space-x-2 p-4 rounded-2xl"
            >
              <FaUser />
              <span>Profile</span>
            </Link>
          </li>

          <li className="bg-bg cursor-pointer">
            <Link
              to="/locations"
              className="flex items-center space-x-2 p-4 rounded-2xl"
            >
              <IoNotifications />
              <span>Locations</span>
            </Link>
          </li>

          {/* pickups */}
          <li className="bg-bg cursor-pointer">
            <Link
              to="/pickup/all"
              className="flex items-center space-x-2 p-4 rounded-2xl"
            >
              <MdWork />
              <span>Pickups</span>
            </Link>
          </li>

          <li className="bg-bg cursor-pointer">
            <Link
              to="/rewards"
              className="flex items-center space-x-2 p-4 rounded-2xl"
            >
              <TiGift />
              <span>Rewards</span>
            </Link>
          </li>

          <li className="bg-bg cursor-pointer">
            <Link
              to="/profile/update-profile"
              className="flex items-center space-x-2 p-4 rounded-2xl"
            >
              <IoMdSettings />
              <span>Update Profile</span>
            </Link>
          </li>

          {/* if user is admin show switch to collector link */}
          {user.isAdmin && (
          <li className="bg-bg cursor-pointer">
              <Link
                to="/admin/pickup/pickups"
                className="flex items-center space-x-2 p-4 rounded-2xl text-darkgreen font-medium"
              >
                <IoMdSwitch />
                <span>Switch to Collector</span>
              </Link>
            </li>
          )}
          <li className="bg-red-50 cursor-pointer font-bold">
            <p
              onClick={() => handleLogout()}
              className="flex items-center space-x-2 p-4 rounded-2xl text-red-500 border-2 border-red-50 cursor-pointer"
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
