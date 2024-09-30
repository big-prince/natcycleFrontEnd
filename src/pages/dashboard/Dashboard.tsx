import { FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useState, useEffect } from "react";
import ProfileApi from "../../api/profile.Api";
import { updateUser } from "../../reducers/authSlice";
import {
  FaEarthAmericas,
  FaRegCircle,
  FaRegCircleCheck,
} from "react-icons/fa6";
// import * as Select from '@radix-ui/react-select';
// import * as RadioGroup from "@radix-ui/react-radio-group";
import Milestone from "./components/Milestone";
import Campaigns from "./components/Campaigns";
// import { FaRegCircle } from "react-icons/fa";

const Dashboard = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const recyclables = ["plastic", "fabric", "glass", "paper"];
  const [selectedRecyclables, setSelectedRecyclables] = useState<string[]>([]);

  const handleAddAndRemoveRecyclable = (recyclable: string) => {
    if (selectedRecyclables.includes(recyclable)) {
      setSelectedRecyclables(
        selectedRecyclables.filter((item) => item !== recyclable)
      );
    } else {
      setSelectedRecyclables([...selectedRecyclables, recyclable]);
    }
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

  const handleRecycleNowClick = () => {
    if (selectedRecyclables.length === 0) {
      return;
    }

    console.log("recycle now clicked");
    console.log(selectedRecyclables);

    // add this to the local storage
    localStorage.setItem(
      "selectedRecyclables",
      JSON.stringify(selectedRecyclables)
    );

    navigate("/pickup/book");
  };

  if (!user) return null;

  return (
    <div className="mb-20">
      <div className="flex justify-between mt-6 bg-white p-4 rounded-lg box_shadow">
        <div className="flex items-center">
          <FaEarthAmericas className="text-lg text-green-500 mr-2" />
          <div>
            <p className="text-sm">Green Impact</p>
            <p className="font-semibold text-lg">You have Saved</p>
          </div>
        </div>

        <div>
          <p className="text-3xl text-center font-bold text-darkgreen">
            {user.carbonUnits}
          </p>
          <p className="text-sm text-center">{user.impactMeasurement}</p>
        </div>
      </div>

      {!user.phoneNumber && (
        <Link to="/profile/update-profile">
          <div className="bg-bg p-4 rounded-lg mt-6 border-l-4 border-darkgreen">
            <p className="text-darkgreen text-lg font-semibold">
              Update your phone number to get notified when your pickup is
              scheduled{" "}
            </p>

            <div className="text-darkgreen underline mt-4 inline-block">
              Update Phone Number
            </div>
          </div>
        </Link>
      )}

      <div>
        <Milestone />
      </div>

      <div>
        <Campaigns />
      </div>

      {/* mile stone */}
      <div className="mt-6 hidden">
        <p className="text-lg font-semibold">Milestones</p>
        <div>
          <div className="bg-green h-6 w-full rounded-2xl p-1">
            <div className="bg-black h-4 w-1/6 rounded-2xl"></div>
          </div>
        </div>
      </div>

      <div className="bg-green p-4 rounded-2xl mt-6 box_shadow">
        <p className="text-2xl font-medium">
          Good {getTimeOfDay()} {user.firstName}!
        </p>

        <p className="text-3xl font-bold mt-4 mb-4">
          What are you recycling today?
        </p>

        <div className="grid grid-cols-2 gap-4">
          {recyclables.map((recyclable, index) => (
            <div key={index} className="w-full">
              <div
                onClick={() => handleAddAndRemoveRecyclable(recyclable)}
                className={`bg-white p-3 rounded-2xl flex justify-between items-center w-full cursor-pointer`}
              >
                <p className="font-bold md:text-xl w-full text-left flex justify-between items-center">
                  {recyclable.charAt(0).toUpperCase() + recyclable.slice(1)}

                  {selectedRecyclables.includes(recyclable) ? (
                    <FaRegCircleCheck className="text-darkgreen" />
                  ) : (
                    <FaRegCircle className="text-green-500 text-2xl" />
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div
            onClick={() => handleRecycleNowClick()}
            className="b-black p-2 py-3 rounded-2xl flex items-center justify-between w-full special_button cursor-pointer"
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
