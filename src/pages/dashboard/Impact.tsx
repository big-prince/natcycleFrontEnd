import { LuLeafyGreen } from "react-icons/lu";
import { PiRecycleDuotone } from "react-icons/pi";
import { PiTrashThin } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";

const Impact = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  console.log(localUser);

  return (
    <div>
      <div className="flex justify-between bg-black text-white p-4 rounded-lg mt-6">
        <div className="text-center">
          <LuLeafyGreen className="text-lg text-yellow-500 m-auto" />
          <p className="text-4xl py-2">
            {localUser.points ? localUser.points : 0}
          </p>
          Earned
        </div>
        <div className="text-center">
          <PiRecycleDuotone className="text-lg text-green-500 m-auto" />
          <p className="text-4xl py-2">0</p>
          Recycled
        </div>
        <div className="text-center">
          <Link to="/pickup/all">
          <PiTrashThin className="text-lg text-white m-auto" />
          <p className="text-4xl py-2">0</p>
          Collections
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold">Milestone</p>
        <div>
          <div className="bg-green h-6 w-full rounded-2xl p-1">
            <div className="bg-black h-4 w-1/6 rounded-2xl">
              <p className="text-white text-xs text-right pr-2">20</p>
            </div>
          </div>
          {/* number */}
          <div className="flex justify-between">
            <p className="text-sm">0</p>
            <p className="text-sm">100</p>
          </div>
        </div>
      </div>
      

      {/* challenge */}
      {/* invite 2 friends */}
      <div className="mt-6">
        <p className="text-lg font-semibold mb-4">Challenges</p>
        
        <div className="flex justify-between border-1 p-4 rounded-md shadow-md">
          <div>
            <p className="text-lg font-semibold">Invite 2 Friends</p>
            <p className="text-sm">Earn 100 points</p>
          </div>
          <div>
            <button className="bg-darkgreen text-white p-4 rounded-2xl">Go</button>
          </div>
        </div>
      </div>

      {/* badges */}
      <div className="mt-6">
        <p className="text-lg font-semibold mb-4">Badges</p>
        <div className="flex justify-between">
          <div>
            <div className="m-auto border-2 rounded-full w-20 h-20 border-green flex items-center justify-between">
              <p className="text-center text-5xl m-auto">🌟</p>
            </div>
            <p className="text-center text-sm font-semibold text-darkgreen">
              First Pickup
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Impact;
