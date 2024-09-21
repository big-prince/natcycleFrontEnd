import { IoMdSwitch } from "react-icons/io";
import { useAppSelector } from "../../hooks/reduxHooks";
import UpdateProfilePicture from "../dashboard/components/UpdateProfilePicture";
import { Link } from "react-router-dom";

const PickupProfile = () => {
  const user = useAppSelector((state) => state.auth.user);
  const tempImage = "https://i.ibb.co/sq0WtbH/trees-119580.png";

  return (
    <div>
      <div className="p-4 rounded-md mt-6">
        <div className="text-center items-center">
          <div>
            <UpdateProfilePicture
              oldPicture={user.profilePicture.url || tempImage}
            />
          </div>
        </div>

        <div>
          <div className="mb-4">
            <p className="font-bold">{user.firstName}</p>
            <p className="text-xs">First name</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">{user.lastName}</p>
            <p className="text-xs">Last name</p>
          </div>

          <div>
            <p className="font-bold">{user.email}</p>
            <p className="text-xs">Email</p>
          </div>
        </div>

        <li
          className="flex mt-4 items-center space-x-2 rounded-2xl text-darkgreen border-2"
        >
          <Link
            to="/home"
            className="flex items-center space-x-2 p-4 rounded-2xl text-darkgreen"
          >
            <IoMdSwitch />
            <span>Switch to User</span>
          </Link>
        </li>
      </div>
    </div>
  );
};

export default PickupProfile;
