 /* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import PickUpApi from "../../api/pickUpApi";
import { IUser } from "../../types";
import AdminPickupModal from "../admin/components/AdminPickupModal";
import PickupMap from "./components/PickupMap";
import { Link } from "react-router-dom";

type Pickup = {
  _id: string;
  createdAt: string;
  itemType: string;
  itemsCount: number;
  location: {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  description: string;
  pointsEarned: number;
  scheduledDate: string;
  scheduledTimeEnd: string;
  scheduledTimeStart: string;
  status: string;
  updatedAt: string;
  user: IUser;
}

const PickupList = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState(false);

  const fetchPickups = async (query?: any) => {
    setLoading(true);

    PickUpApi.adminGetPickUps(query)
      .then((res) => {
        console.log(res.data.docs);
        setPickups(res.data.docs);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPickups();
  }, [notify]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);

  const handleOpenModal = (pickup: Pickup) => {
    console.log(pickup);
    setSelectedPickup(pickup);
    setIsModalOpen(true);
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [status, setStatus] = useState("all");

  useEffect(() => {
    const query = {
      date: selectedDate.toISOString(),
      status,
    };

    fetchPickups(query);
  }, [selectedDate, status]);

  return (
    <div className="px-4">
      {pickups.length > 0 && <PickupMap userPickups={pickups} />}

      {/* date select */}
      <div className="flex justify-between">
        <div className="flex justify-between items-center mb-4 text-darkgreen font-bold text-sm">
          <div className="flex gap-4">
            <label htmlFor="date" className="font-bold">
              Date:
            </label>
            <input
              type="date"
              id="date"
              // value={selectedDate}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </div>

        {/* status select */}
        <div className="flex justify-between items-center mb-4 text-darkgreen font-bold text-sm">
          <div className="flex gap-4">
            <label htmlFor="status" className="font-bold">
              {/* Status: */}
            </label>
            <select
              name="status"
              id="status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <p className="my-4 font-bold">Loading...</p> : ""}

      {/* cards not tables */}
      <div className="grid grid-cols-1 gap-4">
        {!loading &&
          pickups &&
          pickups.map((pickup: Pickup) => (
            <div
              key={pickup._id}
              className="bg-white rounded-md shadow-md p-4 text-sm gap-4"
            >
              <div className="flex justify-between font-bold">
                <div>
                  <p className="text-sm">
                    {pickup.user.firstName} {pickup.user.lastName}
                  </p>
                </div>

                <p className="text-sm">
                  {/* {new Date(pickup.createdAt).toDateString()} */}
                  {pickup.scheduledTimeStart} to {pickup.scheduledTimeEnd}
                </p>
              </div>

              <div className="flex justify-between text-sm mt-4">
                <p className="text-sm">
                  {pickup.location.name} - {pickup.location.address}
                </p>
                <p className="text-sm">
                  {/* {new Date(pickup.scheduledDate).toLocaleDateString()} -{" "} */}
                </p>
              </div>

              <div>
                <p className="text-sm">Status: {pickup.status}</p>
              </div>
              <div className=" flex justify-between mt-4">
                <button
                  className="btn text-green-900 font-medium block cursor-pointer border-2 rounded-full p-2"
                  onClick={() => handleOpenModal(pickup)}
                >
                  Complete Pickup
                </button>

                {/* view details button */}
                <Link to={`/admin/pickup/pickup/${pickup?._id}`}>
                  <button className="btn text-green-900 font-medium block border-2 rounded-full p-2">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
      </div>

      {selectedPickup && (
        <AdminPickupModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          pickup={selectedPickup}
          setNotify={setNotify}
        />
      )}
    </div>
  );
};

export default PickupList;
