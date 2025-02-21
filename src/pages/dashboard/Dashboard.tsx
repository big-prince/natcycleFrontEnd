import { FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useState, useEffect } from "react";
import ProfileApi from "../../api/profile.Api";
import { updateUser } from "../../reducers/authSlice";
import {
  FaEarthAmericas,
} from "react-icons/fa6";
import Milestone from "./components/Milestone";
import Campaigns from "./components/Campaigns";
import ImpactCounter from "./components/ImpactCounter";

const Dashboard = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const recyclables = [
    {
      name: "Plastic Bottles, fabric, etc",
      type: "Drop-off",
      link: "/dropoff/create",
    },
    {
      name: "Metals and Appliances",
      type: "Pickup",
      link: "/pickup/book",
    }
  ];

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
      <div className="flex justify-between p-4 mt-6 bg-white rounded-lg box_shadow">
        <div className="flex items-center">
          <FaEarthAmericas className="mr-2 text-lg text-green-500" />
          <div>
            <p className="text-sm">Green Impact</p>
            <p className="text-lg font-semibold">You have Saved</p>
          </div>
        </div>

        <div>
          <ImpactCounter carbonUnits={user.carbonUnits} impactMeasurement={user.impactMeasurement} />
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

      <div>
        <Campaigns />
      </div>

      {/* mile stone */}
      <div className="hidden mt-4">
        <p className="text-lg font-semibold">Milestones</p>
        <div>
          <div className="p-1 w-full h-6 rounded-2xl bg-green">
            <div className="w-1/6 h-4 bg-black rounded-2xl"></div>
          </div>
        </div>
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
            <Link to={recyclable.link} key={index}>
              <div
                className="p-4 py-3 bg-white rounded-2xl"
              >
                <p className="text-xl font-semibold md:text-2xl">{recyclable.name}</p>
                <div className="flex items-center">
                  <p className="text-sm">{recyclable.type} Only</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="hidden mt-6">
          <div
            // onClick={() => handleRecycleNowClick()}
            className="flex justify-between items-center p-2 py-3 w-full rounded-2xl cursor-pointer b-black special_button"
          >
            <p className="text-lg font-semibold text-green">Recycle Now</p>
            <FaChevronRight className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
