/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import PickUpApi from "../../../api/pickUpApi";
import { FaLocationDot } from "react-icons/fa6";
import PickupPopover from "../components/PickupPopover";

const UserPickups = () => {
  const [userPickups, setUserPickups] = useState([]);
  const [loading, setLoading] = useState(false);

  const [notify, setNotify] = useState('');

  const fetchUserPickups = async () => {
    setLoading(true);
    PickUpApi.getPickUps()
      .then((res) => {
        console.log(res.data);
        setUserPickups(res.data.docs);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserPickups();
  }, [notify]);

  return (
    <div>
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-xl font-semibold">Your Pickups</h1>

        <div>
          {/* filter */}
          <select className="border p-2 py-1 rounded-lg">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="mb-40">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {userPickups.map((pickup: any) => (
              <div
                key={pickup._id}
                className="border p-4 my-2 rounded-lg flex justify-between relative"
              >
                <div className="absolute right-2">
                  <PickupPopover id={pickup._id} setNotify={setNotify} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{pickup.itemType}</h1>
                  <p className="text-sm mt-1">
                    {new Date(pickup.scheduledDate).toLocaleDateString()} <br />
                    {pickup.scheduledTimeStart} - {pickup.scheduledTimeEnd}
                  </p>
                  <p className="flex items-center font-medium mt-2">
                    <FaLocationDot className="text-green-800 text-sm" />
                    {pickup.location.name}
                  </p>
                </div>
                <div className="mt-2">
                  <div className="text-center">
                    <h3 className=" text-2xl text-darkgreen">
                      {pickup.pointsEarned}
                    </h3>
                    <p className="text-xs font-light">Pts Earned</p>
                  </div>

                  <p>
                    <span className="text-green-800 font-semibold text-sm">
                      {pickup.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPickups;
