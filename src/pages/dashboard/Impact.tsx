/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useEffect, useState } from "react";
import ReferModal from "./components/ReferModal";
// import RewardSwiper from "./components/RewardSwiper"; // Hidden in new design
// import Milestone from "./components/Milestone"; // Logic will be integrated
import ProfileApi from "../../api/profile.Api";
import { IBadge } from "../../types"; // Import needed types
import DropOffApi from "../../api/dropOffApi";

import { FaLeaf, FaBoxesStacked, FaMapPin, FaAward } from "react-icons/fa6"; // Added FaAward for badges
import { IoChevronForward } from "react-icons/io5";

const recyclablesWithPoints = [
  { item: "plastic", points: 10, label: "Plastic bottles", unit: "units" },
  { item: "fabric", points: 5, label: "Fabrics", unit: "Lbs" },
  { item: "glass", points: 8, label: "Glass", unit: "lb" },
  { item: "mixed", points: 2, label: "Mixed", unit: "lb" },
];

type IItemsCount = {
  fabric: number;
  glass: number;
  mixed: number;
  plastic: number;
  [key: string]: number; // Index signature
};

type IDropOff = {
  _id: string;
  itemType: string;
  createdAt: string;
  status: string; // Assuming status is a string
  pointsEarned: number;
  dropOffLocation: {
    name: string;
    address?: string; // Optional, depending on your API
  };
  itemQuantity?: number; // For "744"
  itemDescription?: string; // For "500ml plastic water bottles"
  carbonValue?: number; // Assuming this is the CU value
  location?: {
    name: string;
  };
  // Add any other relevant fields from your API response
  [key: string]: any; // Index signature for additional properties
};

// Define or import mileStoneNumbers, similar to Dashboard.tsx
const mileStoneNumbers = [
  { level: 1, pointsRange: [0, 1000], name: "Seedling" },
  { level: 2, pointsRange: [1001, 2000], name: "Sprout" },
  { level: 3, pointsRange: [2001, 5000], name: "Tree" }, // Matches image: 2000-5000
  { level: 4, pointsRange: [5001, 10000], name: "Forest" },
];

const Impact = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const itemsCount: IItemsCount = localUser?.itemsCount || {
    plastic: 0,
    fabric: 0,
    glass: 0,
    mixed: 0,
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDropOffs, setUserDropOffs] = useState<IDropOff[]>([]); // Use IDropOff type
  const [userbadges, setUserBadges] = useState<IBadge[]>([]); // Kept for now, but UI section hidden

  // Calculate point for each recyclable
  const calculateCarbonUnitsForItem = (itemKey: string) => {
    const itemData = recyclablesWithPoints.find((i) => i.item === itemKey);
    const count = itemsCount[itemKey] || 0;
    if (!itemData) return 0;
    // This calculation might need adjustment if 'points' directly means Carbon Units
    // Or if there's a different conversion factor.
    // For now, assuming itemData.points is the CU per unit of count.
    return itemData.points * count;
  };

  const fetchUserDropOffs = async () => {
    if (!localUser?._id) return;
    DropOffApi.getUserDropOffs(localUser._id)
      .then((res) => {
        setUserDropOffs(res.data.data.docs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUserBadges = async () => {
    // Kept, but UI section hidden
    ProfileApi.getUserBadges()
      .then((res) => {
        setUserBadges(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (localUser?._id) {
      // Ensure localUser._id exists before fetching
      fetchUserDropOffs();
      fetchUserBadges();
    }
  }, [localUser?._id]);

  if (!localUser) {
    return <div className="p-10 text-center">Loading user data...</div>;
  }

  // Find a pending dropoff for display - assuming the latest one or one with 'pending' status
  // This logic needs to be adapted based on how 'pending' status is stored in your IDropOff type
  const pendingDropoff =
    userDropOffs.find(
      (dropoff) => dropoff.status === "pending" // Assuming 'status' field
    ) || (userDropOffs.length > 0 ? userDropOffs[0] : null); // Fallback to first if no pending status

  const currentCarbonUnits = localUser.carbonUnits || 0;
  const currentMilestoneData =
    mileStoneNumbers.find(
      (m) =>
        currentCarbonUnits >= m.pointsRange[0] &&
        currentCarbonUnits <= m.pointsRange[1]
    ) ||
    (currentCarbonUnits >
    mileStoneNumbers[mileStoneNumbers.length - 1].pointsRange[1]
      ? mileStoneNumbers[mileStoneNumbers.length - 1]
      : mileStoneNumbers[0]);

  const milestoneStart = currentMilestoneData.pointsRange[0];
  const milestoneEnd = currentMilestoneData.pointsRange[1];
  let progressPercentage = 0;
  if (milestoneEnd > milestoneStart) {
    progressPercentage = Math.min(
      Math.max(
        ((currentCarbonUnits - milestoneStart) /
          (milestoneEnd - milestoneStart)) *
          100,
        0
      ),
      100
    );
  } else if (currentCarbonUnits >= milestoneEnd) {
    progressPercentage = 100;
  }

  return (
    <div className="pb-20 max-w-md mx-auto">
      {" "}
      {/* Added max-width and centering */}
      {/* Top Summary Stats */}
      <div className="flex justify-around bg-slate-800 text-white p-5 rounded-xl shadow-lg">
        <div className="text-center">
          <FaLeaf className="text-3xl text-green-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {localUser.pointsEarned ? Math.floor(localUser.pointsEarned) : 0}
          </p>
          <p className="text-xs text-gray-300">Natpoints</p>
        </div>
        <div className="text-center">
          <FaBoxesStacked className="text-3xl text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold">
            {localUser.carbonUnits ? Math.floor(localUser.carbonUnits) : 0}
          </p>
          <p className="text-xs text-gray-300">Carbon unit</p>
        </div>
        <div className="text-center">
          <Link to="/dropoff/all">
            <FaMapPin className="text-3xl text-red-400 mx-auto mb-1" />
            <p className="text-2xl font-bold">
              {userDropOffs.length ? userDropOffs.length : 0}
            </p>
            <p className="text-xs text-gray-300">Dropoffs</p>
          </Link>
        </div>
      </div>
      {/* Pending Approval Section */}
      {pendingDropoff && (
        <div className="mt-6 p-4 bg-amber-50 rounded-xl shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold text-slate-700">
              Pending approval
            </h3>
            {/* Assuming dropoff.locationName or similar exists, or link to its details */}
            <Link
              to={`/dropoff/details/${pendingDropoff._id}`}
              className="text-xs underline text-amber-700 font-medium"
            >
              {pendingDropoff.location?.name || "EZ Bottle return"}{" "}
              {/* Placeholder */}
            </Link>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-slate-600">
                {new Date(
                  pendingDropoff.createdAt || Date.now()
                ).toLocaleDateString()}{" "}
                {/* Format date */}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Count</p>
              <p className="font-medium text-slate-600">
                {pendingDropoff.itemQuantity || 0} units{" "}
                {/* Assuming itemQuantity */}
              </p>
            </div>
            {/* The second "Count" in the image might be a typo or specific detail. Using itemType for now. */}
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium text-slate-600 capitalize">
                {pendingDropoff.itemType || "N/A"}
              </p>
            </div>
            <div className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold">
              {/* This CU value should ideally come from the pendingDropoff object if calculated server-side */}
              {pendingDropoff.carbonValue || Math.floor(Math.random() * 30) + 5}{" "}
              CU {/* Placeholder CU */}
            </div>
          </div>
        </div>
      )}
      {/* Milestone Section - Integrated */}
      <div className="mt-6 p-4 bg-white rounded-xl shadow">
        <h3 className="text-md font-semibold text-slate-700 mb-1">Milestone</h3>
        <p className="text-xs text-gray-500 mb-2">Current</p>
        <div className="relative">
          <div className="w-full h-6 rounded-full bg-lime-200 p-0.5">
            <div
              className="h-full bg-slate-800 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out px-2"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 15 && ( // Show only if there's enough space
                <span className="text-xs font-bold text-white">
                  {Math.floor(currentCarbonUnits)}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>{milestoneStart}</span>
            <span>{milestoneEnd}</span>
          </div>
        </div>
      </div>
      {/* Breakdown Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-slate-700">Breakdown</h3>
          <Link
            to="/profile"
            className="text-xs text-green-600 font-medium flex items-center"
          >
            See Green Profile <IoChevronForward className="ml-0.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recyclablesWithPoints.map((item) => (
            <div
              key={item.item}
              className="bg-[#D4FF4F] p-3.5 rounded-xl shadow"
            >
              {" "}
              {/* Lime green */}
              <p className="font-semibold text-sm text-slate-800 mb-1">
                {item.label}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {itemsCount[item.item] || 0}
                  </p>
                  <p className="text-xs text-gray-700 -mt-1">{item.unit}</p>
                </div>
                <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                  {calculateCarbonUnitsForItem(item.item)} CU
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Badges Section - Unhidden and Styled */}
      <div className="mt-8">
        {" "}
        {/* Increased top margin */}
        <h3 className="text-lg font-bold text-slate-800">Badges</h3>
        <p className="text-sm text-gray-500 mb-4">
          The badges you have achieved
        </p>
        {userbadges && userbadges.length > 0 ? (
          <div className="flex overflow-x-auto space-x-4 pb-3 scrollbar-hide">
            {userbadges.map((badge, index) => (
              <div
                key={badge._id || index}
                className="bg-white p-4 rounded-xl shadow-md w-36 flex-shrink-0 text-center"
              >
                {/* Placeholder for badge icon - using FaAward */}
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FaAward className="text-3xl text-yellow-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {badge.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(Date.now()).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No badges earned yet. Keep up the great work!
          </p>
        )}
      </div>
      {/* Hidden Sections from original code - Kept hidden as per new design focus */}
      <div className="hidden mt-6">
        <p className="text-lg font-semibold mb-4">Challenges</p>
        {/* ... existing challenge content ... */}
      </div>
      <div className="hidden mt-6">
        <div className="flex justify-between">
          <p className="text-lg font-semibold">Rewards</p>
          {/* ... existing rewards content ... */}
        </div>
        {/* <RewardSwiper /> */}
      </div>
      <div className="hidden mt-6">
        {" "}
        {/* Badges section hidden to match new design */}
        <p className="text-lg font-semibold mb-4">Badges</p>
        {/* ... existing badges content ... */}
      </div>
      <ReferModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

export default Impact;
