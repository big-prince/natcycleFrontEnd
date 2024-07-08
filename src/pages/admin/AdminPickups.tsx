import { useState, useEffect } from "react";
import PickUpApi from "../../api/pickUpApi";
import { ILocation, IUser } from "../../types";
import AdminPickupModal from "./components/AdminPickupModal";

type Pickup = {
  createdAt: string;
  description: string;
  itemType: string;
  location: ILocation;
  pointsEarned: number;
  points_earned: number;
  scheduledDate: string;
  scheduledTimeEnd: string;
  scheduledTimeStart: string;
  status: string;
  updatedAt: string;
  user: IUser;
  __v: number;
  _id: string;
};

const AdminPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState(false);

  const fetchPickups = async () => {
    setLoading(true);

    PickUpApi.adminGetPickUps()
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

  const handleDeletePickup = (pickup: Pickup) => {
    const confirm = window.confirm("Are you sure you want to delete this pickup?");
    if (!confirm) return;

    PickUpApi.adminDeletePickUp(pickup._id)
      .then((res) => {
        console.log(res.data);
        setNotify(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="admin_page_heading">All Pickups</h3>
      </div>

      {loading ? <p className="my-4 font-bold">Loading...</p> : ""}

      {/* cards not tables */}
      <div className="grid grid-cols-1 gap-4">
        {!loading &&
          pickups &&
          pickups.map((pickup: Pickup) => (
            <div
              key={pickup._id}
              className="bg-white rounded-md shadow-md p-4 text-sm flex justify-between gap-4"
            >
              <div>
                <p className="text-sm">
                  {pickup.user.firstName} {pickup.user.lastName}
                </p>
                <p className="text-sm">{pickup.user.email}</p>
              </div>
              <div>
                <p className="text-sm">
                  {pickup.location.name} - {pickup.location.address}
                </p>
                <p className="text-sm">
                  {new Date(pickup.scheduledDate).toLocaleDateString()} -{" "}
                  {pickup.scheduledTimeStart} to {pickup.scheduledTimeEnd}
                </p>
              </div>
              <div>
                <p className="text-sm">
                  {pickup.itemType} - {pickup.description}
                </p>
                <p className="text-sm">Points Earned: {pickup.pointsEarned}</p>
              </div>
              <div>
                <p className="text-sm">Status: {pickup.status}</p>
              </div>
              <div className="">
                <button
                  className="btn underline text-green-900 font-medium block cursor-pointer"
                  onClick={() => handleOpenModal(pickup)}
                >
                  Complete Pickup
                </button>

                <button className="btn underline text-green-900 font-medium block mt-4"
                  onClick={() => handleDeletePickup(pickup)}
                >
                  Delete Pickup
                </button>
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

export default AdminPickups;
