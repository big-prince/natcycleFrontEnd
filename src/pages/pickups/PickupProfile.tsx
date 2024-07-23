import { useAppSelector } from "../../hooks/reduxHooks";
import UpdateProfilePicture from "../dashboard/components/UpdateProfilePicture";

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
            <p className="font-bold">
              {user.firstName}
            </p>
            <p className="text-xs">First name</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">
              {user.lastName}
            </p>
            <p className="text-xs">Last name</p>
          </div>

          <div>
            <p className="font-bold">
              {user.email}
            </p>
            <p className="text-xs">Email</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupProfile;
