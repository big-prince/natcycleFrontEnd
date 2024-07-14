import { RiCoinsFill } from "react-icons/ri";
import { FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { useState, useEffect } from "react";
import ProfileApi from "../../api/profile.Api";
import { updateUser } from "../../reducers/authSlice";

const Dashboard = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

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
          console.log(res.data, 'new data');
          dispatch(updateUser(res.data));
          setUser(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    fetchUser();
  }, []);

  if (!user) return null;

  return (
    <div className="mb-40">
      <div className="flex justify-between mt-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <RiCoinsFill className="text-lg text-green-500 mr-2" />
          <div>
            <p className="text-sm">Green Impact</p>
            <p className="font-semibold text-lg">You have Saved</p>
          </div>
        </div>

        <div>
          <p className="text-3xl text-center font-bold text-darkgreen">
            {user.pointsEarned}
          </p>
          <p className="text-sm text-center">Birds</p>
        </div>
        {/* <div>
          <p className="text-2xl font-bold text-darkgreen">0.00</p>
          <p className="text-sm">Kg of CO2</p>
        </div> */}
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
      
      {/* mile stone */}
      <div className="mt-6 hidden">
        <p className="text-lg font-semibold">Milestones</p>
        <div>
          <div className="bg-green h-6 w-full rounded-2xl p-1">
            <div className="bg-black h-4 w-1/6 rounded-2xl"></div>
          </div>
        </div>
      </div>

      <div className="bg-green p-4 rounded-2xl mt-6">
        <p className="text-2xl font-medium">
          Good  {getTimeOfDay()} {user.firstName}!
        </p>

        <p className="text-3xl font-bold mt-4 mb-4">
          What are you recycling today?
        </p>

        <div className="bg-white p-3 rounded-2xl flex justify-between items-center ">
          <p className="font-bold text-xl">
            Plastic Bottles
          </p>

          {/* checkmark */}
          <div className="">
            <div className="bg-darkgreen h-6 w-6 rounded-full flex items-center justify-center">
              <p className="text-white">✔</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-gray-500">
          Metals Paper Glass coming soon
        </p>

        <div className="mt-6">
          <Link to='/pickup/book' className="bg-black p-2 py-3 rounded-2xl flex items-center justify-between w-full">
            <p className="text-lg font-semibold text-green">Recycle Now</p>
            <FaChevronRight className="text-white" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard