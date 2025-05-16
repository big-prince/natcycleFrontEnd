import { LuLeafyGreen } from "react-icons/lu";
import { PiRecycleDuotone } from "react-icons/pi";
import { TbTruckDelivery } from "react-icons/tb";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useEffect, useState } from "react";
import ReferModal from "./components/ReferModal";
import RewardSwiper from "./components/RewardSwiper";
import Milestone from "./components/Milestone";
import ProfileApi from "../../api/profile.Api";
import { IBadge } from "../../types";
import DropOffApi from "../../api/dropOffApi";

const recyclablesWithPoints = [
  { item: "plastic", points: 10 },
  { item: "fabric", points: 5 },
  { item: "glass", points: 8 },
  { item: "mixed", points: 2 },
];

type IItemsCount = {
  fabric: number;
  glass: number;
  mixed: number;
  plastic: number;
};

const Impact = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  console.log(localUser, "local user");

  const itemsCount: IItemsCount = localUser?.itemsCount;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [userPickups, setUserPickups] = useState([]);

  const [userbadges, setUserBadges] = useState<IBadge[]>([]);

  // calculate point for each recyclable
  const calculatePoints = (item: string) => {
    const itemObj = recyclablesWithPoints.find((i) => i.item === item);
    const userItemCount = itemsCount[item];

    if (!itemObj) return 0;

    return itemObj.points * userItemCount;
  };

  console.log(calculatePoints("plastic"));

  const fetchUserDropOffs = async () => {
    DropOffApi.getUserDropOffs(localUser._id)
      .then((res) => {
        //set state
        setUserPickups(res.data.data.docs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // fetch user badges
  const fetchUserBadges = async () => {
    ProfileApi.getUserBadges()
      .then((res) => {
        console.log("badges", res.data);
        setUserBadges(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log("page loaded");
      });
  };

  useEffect(() => {
    fetchUserDropOffs();
    fetchUserBadges();
  }, []);

  return (
    <div className="mb-16">
      <div className="flex justify-between bg-black text-white p-4 rounded-lg">
        <div className="text-center">
          <LuLeafyGreen className="text-lg text-yellow-500 m-auto" />
          <p className="text-4xl py-2">
            {localUser.carbonUnits ? Math.floor(localUser.carbonUnits) : 0}
          </p>
          C Units
        </div>
        <div className="text-center">
          <PiRecycleDuotone className="text-lg text-green-500 m-auto" />
          <p className="text-4xl py-2">
            {localUser.pointsEarned ? Math.floor(localUser.pointsEarned) : 0}
          </p>
          Points
        </div>
        <div className="text-center">
          <Link to="/dropoff/all">
            <TbTruckDelivery className="text-lg text-blue-500 m-auto" />
            <p className="text-4xl py-2">
              {userPickups.length ? userPickups.length : 0}
            </p>
            DropOffs
          </Link>
        </div>
      </div>

      <div>
        <Milestone />

        <div className="mt-6">
          <p className="text-lg font-semibold">Breakdown</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green p-4 rounded-lg box_shadow">
              <p className="font-medium text-sm">Plastic Bottles</p>

              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-3xl font-medium text-darkgreen">
                    {itemsCount?.plastic || 0}
                    <span className="text-sm pl-[2px]">Units</span>
                  </p>
                </div>

                <div className="bg-black p-2 rounded-lg font-bold">
                  <p className="text-sm text-white">
                    {calculatePoints("plastic")}
                    <span className="text-xs pl-[2px]">CU</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green p-4 rounded-lg box_shadow">
              <p className="font-medium text-sm">Fabric</p>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-3xl font-medium text-darkgreen">
                    {itemsCount?.fabric || 0}
                    <span className="text-sm pl-[2px]">Lb</span>
                  </p>
                </div>

                <div className="bg-black p-2 rounded-lg font-bold">
                  <p className="text-sm text-white">
                    {calculatePoints("fabric") || 0}
                    <span className="text-xs pl-[2px]">CU</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green p-4 rounded-lg box_shadow">
              <p className="font-medium text-sm">Glass</p>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-3xl font-medium text-darkgreen">
                    {itemsCount?.glass || 0}
                    <span className="text-sm pl-[2px]">Lb</span>
                  </p>
                </div>

                <div className="bg-black p-2 rounded-lg font-bold">
                  <p className="text-sm text-white">
                    {calculatePoints("glass") || 0}
                    <span className="text-xs pl-[2px]">CU</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green p-4 rounded-lg box_shadow">
              <p className="font-medium text-sm">Mixed</p>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-3xl font-medium text-darkgreen">
                    {itemsCount?.mixed || 0}
                    <span className="text-sm pl-[2px]">Units</span>
                  </p>
                </div>

                <div className="bg-black p-2 rounded-lg font-bold">
                  <p className="text-sm text-white">
                    {calculatePoints("mixed") || 0}
                    <span className="text-xs pl-[2px]">CU</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-lg font-semibold mb-4">Challenges</p>

        <div className="flex justify-between border-1 p-4 rounded-md box_shadow">
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
        {/* <div className="flex justify-between">
          <div>
            <div className="m-auto border-2 rounded-full w-20 h-20 border-green flex items-center justify-between">
              <p className="text-center text-5xl m-auto">🌟</p>
            </div>
            <p className="text-center text-sm font-semibold text-darkgreen">
              First Pickup
            </p>
          </div>
        </div> */}

        <div>
          <div className="flex justify-between">
            {userbadges &&
              userbadges.length > 0 &&
              userbadges.map((badge) => (
                <div key={badge._id} className="bg-gray-100 p-2 rounded-3xl">
                  <div className="m-auto w-28 h-28  flex items-center justify-between">
                    <img
                      src={badge.image.url}
                      alt="badge"
                      className="m-auto object-cover w-full h-full rounded-xl"
                    />
                  </div>
                  <p className="text-center text-sm font-semibold text-darkgreen">
                    {badge.name}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      <ReferModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

export default Impact;
