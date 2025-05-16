import { FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useState, useEffect } from "react";
import ProfileApi from "../../api/profile.Api";
import { updateUser } from "../../reducers/authSlice";
import { FaEarthAmericas } from "react-icons/fa6";
import Milestone from "./components/Milestone";
import Campaigns from "./components/Campaigns";
import ImpactCounter from "./components/ImpactCounter";

const Dashboard = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const recyclables = [
    {
      name: "Plastic Bottle",
      type: "Drop-off",
      link: "/dropoff/create",
    },
    {
      name: "Food",
      type: "Drop-off",
      link: "/dropoff/create",
    },
    {
      name: "Fabrics",
      type: "Drop-off",
      link: "/dropoff/create",
    },
  ];

  const milestoneLogic = (carbonUnits: number) => {
    const maxMilestone = 100;
    // const minMilestone = 0;

    // const milestoneRange = maxMilestone - minMilestone;
    // const milestoneStep = milestoneRange / 10;
    // const milestone = Math.floor(carbonUnits / milestoneStep);

    return {
      currentMilestone: carbonUnits,
      maxMilestone,
    };
  };

  const [user, setUser] = useState(localUser);

  function getTimeOfDay() {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 12) {
      return "Morning";
    } else if (currentHour < 18) {
      return "Afternoon";
    } else {
      return "Evening";
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      ProfileApi.getProfile()
        .then((res) => {
          console.log(res.data, "new data");
          dispatch(updateUser(res.data));
          setUser(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="mb-20">
      <div className="flex justify-between mb-5 p-4 py-5 bg-white rounded-lg box_shadow">
        <div className="flex items-center">
          <FaEarthAmericas className="mr-2 text-2xl text-green-500" />
          <div>
            <p className="text-sm">Green Impact</p>
            <p className="text-xl font-semibold">You have Saved</p>
          </div>
        </div>

        <div>
          <ImpactCounter
            carbonUnits={user.carbonUnits}
            impactMeasurement={user.impactMeasurement}
          />
        </div>
      </div>

      {!user.phoneNumber && (
        <Link to="/profile/update-profile">
          <div className="p-4 mt-6 rounded-lg border-l-4 bg-bg border-darkgreen">
            <p className="text-lg font-semibold text-darkgreen">
              Update your phone number to get notified when your pickup is
              scheduled{" "}
            </p>

            <div className="inline-block mt-4 underline text-darkgreen">
              Update Phone Number
            </div>
          </div>
        </Link>
      )}

      <div className="hidden">
        <Milestone />
      </div>

      <div className="hidden">
        <Campaigns />
      </div>

      {/* Milestone Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Next Milestone</p>
          <Link to="/impact">
            <p className="text-sm underline">Carbon Units</p>
          </Link>
        </div>
        {user && (
          <div className="relative mt-2">
            <div className="p-1 w-full h-8 rounded-2xl bg-green">
              {(() => {
                const nextMilestoneKg = milestoneLogic(
                  user.carbonUnits
                ).maxMilestone;
                const currentKg = milestoneLogic(
                  user.carbonUnits
                ).currentMilestone;
                const progressPercentage = Math.min(
                  Math.round((currentKg / nextMilestoneKg) * 100),
                  100
                );
                const progressWidth = `${progressPercentage}%`;

                return (
                  <div
                    className="h-6 bg-black rounded-2xl flex items-center justify-center transition-all duration-500 ease-in-out"
                    style={{ width: progressWidth }}
                  >
                    <span className="text-xs text-white font-medium px-10">
                      {progressPercentage}%
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-between mt-1 px-1 text-sm text-darkgreen">
              <span>
                {Math.floor(milestoneLogic(user.carbonUnits).currentMilestone)}
              </span>
              <span>
                {Math.floor(milestoneLogic(user.carbonUnits).maxMilestone)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 mt-4 rounded-2xl bg-green box_shadow">
        <p className="text-xl font-medium md:text-2xl">
          Good {getTimeOfDay()} {user.firstName}!
        </p>

        <p className="mt-4 mb-4 text-2xl font-bold md:text-3xl">
          What are you recycling today?
        </p>

        <div className="grid gap-4">
          {recyclables.map((recyclable, index) => (
            <Link
              to={`${recyclable.link}?type=${
                recyclable.name == "Plastic Bottle"
                  ? "plastic"
                  : recyclable.name == "Fabrics"
                  ? "fabric"
                  : recyclable.name.toLowerCase().replace(" ", "_")
              }`}
              key={index}
            >
              <div className="flex justify-between items-center p-4 py-3 bg-white rounded-2xl">
                <p className="text-xl font-semibold text-darkgreen md:text-2xl">
                  {recyclable.name}
                </p>
                <FaChevronRight className="text-darkgreen" />
                <div className="hidden flex items-center">
                  <p className="text-sm">{recyclable.type} Only</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/dropoff/create">
          <p className="mt-2 ml-2 text-sm text-darkgreen underline">
            Other type of items?
          </p>
        </Link>

        <div className="hidden mt-6">
          <Link to="/dropoff/create">
            <div
              // onClick={() => handleRecycleNowClick()}
              className="flex justify-between items-center p-2 py-3 w-full rounded-2xl cursor-pointer b-black special_button"
            >
              <p className="text-lg font-semibold text-green">Recycle Now</p>
              <FaChevronRight className="text-white" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
