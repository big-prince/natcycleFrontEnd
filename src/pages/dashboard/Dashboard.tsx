/* eslint-disable @typescript-eslint/no-unused-vars */
import { FaChevronRight, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useState, useEffect } from "react";
import ProfileApi from "../../api/profile.Api";
import { updateUser } from "../../reducers/authSlice";
import { FaEarthAmericas } from "react-icons/fa6";
import { FaTrophy } from "react-icons/fa6";
import ImpactCounter from "./components/ImpactCounter";
import { toast } from "react-toastify";
import MaterialApi from "../../api/materialApi";
import CampaignsList from "./components/CampaignsList";

const mileStoneNumbers = [
  { level: 1, pointsRange: [0, 500], name: "Seedling" },
  { level: 2, pointsRange: [501, 1000], name: "Sprout" },
  { level: 3, pointsRange: [1001, 2000], name: "Tree" },
  { level: 4, pointsRange: [2001, 5000], name: "Forest" },
  { level: 5, pointsRange: [5001, 10000], name: "Guardian" },
];

const Dashboard = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(localUser);
  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [divertItems, setDivertItems] = useState<string[]>([]);

  function getTimeOfDay() {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 12) return "Morning";
    if (currentHour < 18) return "Afternoon";
    return "Evening";
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (localUser?._id) {
        try {
          const res = await ProfileApi.getProfile();
          dispatch(updateUser(res.data));
          setUser(res.data);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    };

    const fetchMaterialCategories = async () => {
      setMaterialsLoading(true);
      try {
        const response = await MaterialApi.getMaterialsCategory();
        const categories = response.data.data.primaryTypes || [];

        // Take only the first 6 categories if there are more
        const limitedCategories = categories
          .slice(0, 8)
          .map((category: string) => category.toLowerCase());

        setDivertItems(limitedCategories);
      } catch (err) {
        console.error("Failed to fetch material categories:", err);
        toast.error("Could not load divertable items.");
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchUser();
    fetchMaterialCategories();
  }, [dispatch, localUser?._id]);

  if (!user) {
    return <div className="p-10 text-center">Loading user data...</div>;
  }

  const currentCarbonUnits = user.carbonUnits || 0;

  let currentMilestoneIndex = mileStoneNumbers.findIndex(
    (m) =>
      currentCarbonUnits >= m.pointsRange[0] &&
      currentCarbonUnits <= m.pointsRange[1]
  );
  if (currentMilestoneIndex === -1) {
    currentMilestoneIndex =
      currentCarbonUnits >
      mileStoneNumbers[mileStoneNumbers.length - 1].pointsRange[1]
        ? mileStoneNumbers.length - 1
        : 0;
  }

  const currentMilestoneDetails = mileStoneNumbers[currentMilestoneIndex];
  const milestoneStart = currentMilestoneDetails.pointsRange[0];
  const milestoneEndTarget = currentMilestoneDetails.pointsRange[1];

  let progressPercentage = 0;
  if (milestoneEndTarget > milestoneStart) {
    progressPercentage = Math.min(
      Math.max(
        ((currentCarbonUnits - milestoneStart) /
          (milestoneEndTarget - milestoneStart)) *
          100,
        0
      ),
      100
    );
  } else if (currentCarbonUnits >= milestoneEndTarget) {
    progressPercentage = 100;
  }

  const handleDivertItemClick = (itemType: string) => {
    setSelectedItemType(itemType === selectedItemType ? null : itemType);
  };

  const handleLogImpact = () => {
    if (selectedItemType) {
      navigate(`/dropoff/create?type=${selectedItemType}`);
    } else {
      toast.info("Please select an item type first!");
    }
  };

  return (
    <div className="pb-10">
      <div className="mb-6 p-4 bg-white rounded-3xl shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-full mr-3">
            <FaEarthAmericas className="text-2xl text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Green Impact</p>
            <p className="text-sm font-semibold">You have saved</p>
          </div>
        </div>
        <div className="text-right">
          <ImpactCounter
            carbonUnits={user.carbonUnits}
            impactMeasurement={user.impactMeasurement}
          />
        </div>
      </div>

      <div className="mb-10 p-4 bg-white rounded-3xl shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <FaTrophy className="text-amber-500 w-4 h-4 mr-2" />
            <p className="text-sm font-semibold">Next Milestone</p>
          </div>
          <Link to="/impact">
            <p className="text-xs underline text-purple-600 font-medium">
              Carbon Units
            </p>
          </Link>
        </div>
        <div className="relative mt-1">
          <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
            <span>{milestoneStart}</span>
            <span>{milestoneEndTarget}</span>
          </div>
          <div className="w-full h-5 rounded-full bg-lime-200 p-0.5">
            <div
              className="h-full bg-black rounded-full flex items-center justify-end transition-all duration-500 ease-in-out pr-2"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-xs font-bold text-white">
                  {Math.floor(currentCarbonUnits)}
                </span>
              )}
            </div>
          </div>
          {progressPercentage <= 10 && (
            <p className="text-right text-xs font-bold mt-1 mr-1 text-slate-800">
              {Math.floor(currentCarbonUnits)}
            </p>
          )}
        </div>
      </div>

      {/* Campaigns/Drives Section */}
      <CampaignsList />

      {/* Green "Action Today" Card */}
      <div className="p-6 mt-4 rounded-3xl bg-[#D4FF4F] text-slate-800 shadow-lg relative pb-14 z-10">
        <p className="text-lg font-semibold">
          Good {getTimeOfDay()} {user.firstName}!
        </p>
        <p className="mt-1 mb-3 text-2xl font-bold">Select Material</p>
        <div className="flex overflow-x-auto space-x-3 pb-3 px-2 mb-3 pt-5 scrollbar-hide min-h-[50px]">
          {materialsLoading ? (
            <p className="text-slate-600 text-sm italic px-3">
              Loading items...
            </p>
          ) : divertItems.length > 0 ? (
            divertItems.map((itemType) => (
              <button
                type="button"
                key={itemType}
                onClick={() => handleDivertItemClick(itemType)}
                className={`
                  font-medium py-3 px-5 rounded-full shadow-sm text-xs sm:text-sm text-center flex-shrink-0 min-w-[110px] transition-colors duration-150
                  ${
                    selectedItemType === itemType
                      ? "bg-black text-white ring-2 ring-slate-800"
                      : "bg-white/90 hover:bg-white text-slate-700"
                  }
                `}
              >
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </button>
            ))
          ) : (
            <p className="text-slate-600 text-sm px-3">
              No divertable items found.
            </p>
          )}
        </div>
        {/* Action buttons container positioned to the far right */}
        <div className="absolute bottom-[-26px] right-6 w-auto">
          {selectedItemType ? (
            // When material is selected, show both buttons
            <div className="flex items-center gap-3">
              {/* Find Locations Button - Secondary */}
              <button
                type="button"
                onClick={() => navigate(`/where?type=${selectedItemType}`)}
                className="flex items-center justify-center bg-white hover:bg-gray-50 text-slate-800  rounded-full py-3 px-5 shadow-lg transition-all duration-200"
              >
                <div className="text-center">
                  <p className="text-sm font-semibold">Find Locations</p>
                  <p className="text-xs font-light -mt-0.5 opacity-80">
                    Near you
                  </p>
                </div>
                <FaArrowRight className="text-sm ml-3" />
              </button>
              {/* Log Impact Button - Primary (smaller) */}
              <button
                type="button"
                onClick={handleLogImpact}
                className="flex items-center justify-center bg-black hover:bg-slate-900 text-white rounded-full py-3 px-5 shadow-lg transition-all duration-200"
              >
                <div className="text-center">
                  <p className="text-sm font-semibold">Drop Off</p>
                  <p className="text-xs font-light -mt-0.5 opacity-80">
                    Log impact
                  </p>
                </div>
                <FaArrowRight className="text-sm ml-3" />
              </button>
            </div>
          ) : (
            // When no material is selected, show original single button
            <button
              type="button"
              onClick={() => toast.info("Please select a material type first!")}
              className="flex items-center justify-between bg-black text-white rounded-full py-3.5 px-6 shadow-lg w-72 opacity-100 cursor-not-allowed"
            >
              <div className="text-left">
                <p className="text-base font-semibold">Select material first</p>
                <p className="text-xs font-light -mt-0.5 opacity-80">
                  Choose from above
                </p>
              </div>
              <FaChevronRight className="text-lg ml-4" />
            </button>
          )}
        </div>
      </div>

      {!user.phoneNumber && (
        <Link to="/profile/update-profile" className="block mt-6">
          <div className="p-3 rounded-lg border-l-4 bg-yellow-50 border-yellow-400 text-yellow-700 text-xs">
            <p className="font-semibold">Complete your profile!</p>
            <p>Update your phone number to get notified about your pickups.</p>
            <div className="inline-block mt-1 underline font-medium">
              Update Phone Number
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};

export default Dashboard;
