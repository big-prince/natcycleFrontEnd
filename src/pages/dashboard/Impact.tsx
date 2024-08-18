import { LuLeafyGreen } from "react-icons/lu";
import { PiRecycleDuotone } from "react-icons/pi";
import { PiTrashThin } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useEffect, useState } from "react";
import ReferModal from "./components/ReferModal";
import PickUpApi from "../../api/pickUpApi";
import RewardSwiper from "./components/RewardSwiper";
import Milestone from "./components/Milestone";

const Impact = () => {
  const localUser = useAppSelector((state) => state.auth.user);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [userPickups, setUserPickups] = useState([]);

  const fetchUserPickups = async () => {
    PickUpApi.getPickUps()
      .then((res) => {
        console.log(res.data);
        setUserPickups(res.data.docs);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("page loaded");
      });
  };

  useEffect(() => {
    fetchUserPickups();
  }, []);

  return (
    <div>
      <div className="flex justify-between bg-black text-white p-4 rounded-lg mt-6">
        <div className="text-center">
          <LuLeafyGreen className="text-lg text-yellow-500 m-auto" />
          <p className="text-4xl py-2">
            {localUser.pointsEarned ? localUser.pointsEarned : 0}
          </p>
          Earned
        </div>
        <div className="text-center">
          <PiRecycleDuotone className="text-lg text-green-500 m-auto" />
          <p className="text-4xl py-2">
            {localUser.points ? localUser.totalItemsCollected : 0}
          </p>
          Recycled
        </div>
        <div className="text-center">
          <Link to="/pickup/all">
            <PiTrashThin className="text-lg text-white m-auto" />
            <p className="text-4xl py-2">{userPickups.length}</p>
            Collections
          </Link>
        </div>
      </div>

      <div>
        <Milestone />

        <div className="mt-6">
          <p className="text-lg font-semibold">Breakdown</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg p-4 rounded-lg shadow-md">
              <p className="font-medium text-sm">Plastic Bottles</p>
              <p className="text-3xl font-medium text-darkgreen">
                12
                <span className="text-sm pl-[2px]">Units</span>
              </p>
            </div>
            <div className="bg-bg p-4 rounded-lg shadow-md">
              <p className="font-medium text-sm">Fabric</p>
              <p className="text-3xl font-medium text-darkgreen">
                5<span className="text-sm pl-[2px]">Kg</span>
              </p>
            </div>
            <div className="bg-bg p-4 rounded-lg shadow-md">
              <p className="font-medium text-sm">Glass</p>
              <p className="text-3xl font-medium text-darkgreen">
                3<span className="text-sm pl-[2px]">Kg</span>
              </p>
            </div>
            <div className="bg-bg p-4 rounded-lg shadow-md">
              <p className="font-medium text-sm">Mixed</p>
              <p className="text-3xl font-medium text-darkgreen">
                2<span className="text-sm pl-[2px]">Units</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold mb-4">Challenges</p>

        <div className="flex justify-between border-1 p-4 rounded-md shadow-md">
          <div>
            <p className="text-lg font-semibold">Invite 2 Friends</p>
            <p className="text-sm">Earn 100 points</p>
          </div>
          <div>
            <button
              className="bg-darkgreen text-white p-4 rounded-2xl"
              onClick={() => setIsModalOpen(true)}
            >
              Go
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between">
          <p className="text-lg font-semibold">Rewards</p>
          <Link to="/rewards">
            <button className="underline text-darkgreen p-4 rounded-2xl">
              View All
            </button>
          </Link>
        </div>
        <RewardSwiper />
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

      <ReferModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

export default Impact;
