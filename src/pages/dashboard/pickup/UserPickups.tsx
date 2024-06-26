import { useState, useEffect } from "react";
import PickUpApi from "../../../api/pickUpApi";
import { FaLocationDot } from "react-icons/fa6";

const UserPickups = () => {
  const [userPickups, setUserPickups] = useState([]);
  const [loading, setLoading] = useState(false);

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
  }, []);

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
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {userPickups.map((pickup: any) => (
              <div
                key={pickup._id}
                className="border p-4 my-2 rounded-lg flex justify-between"
              >
                <div>
                  <h1 className="text-lg font-semibold">{pickup.itemType}</h1>
                  <p className="text-sm">
                    {new Date(pickup.scheduledDate).toLocaleDateString()} at{" "}
                    {pickup.scheduledTimeStart} - {pickup.scheduledTimeEnd}
                  </p>
                  {/* <p>{pickup.description}</p> */}
                  <p className="flex items-center font-medium mt-2">
                    <FaLocationDot className="text-green-800 text-sm" />
                    {pickup.location.name}
                  </p>
                </div>
                <div>
                  <div className="text-center">
                    <h3 className=" text-3xl text-darkgreen">
                      {pickup.points_earned}
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
