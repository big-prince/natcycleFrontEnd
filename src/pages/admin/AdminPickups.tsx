import { useState, useEffect } from "react";
import PickUpApi from "../../api/pickUpApi";
import { IUser } from "../../types";
import AdminPickupModal from "./components/AdminPickupModal";
import PickupMap from "../pickups/components/PickupMap";
import UsersApi from "../../api/usersApi";

type IPickup = {
  _id: string;
  createdAt: string;
  itemType: string;
  itemsCount: number;
  description: string;
  location: {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  pointsEarned: number;
  scheduledDate: string;
  scheduledTimeEnd: string;
  scheduledTimeStart: string;
  status: "pending" | "completed" | "cancelled";
  updatedAt: string;
  user: IUser;
};

const AdminPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notify, setNotify] = useState(false);
  const [users, setUsers] = useState([]);

  const [query, setQuery] = useState({
    status: "",
    userId: "",
  });

  const fetchUsers = () => {
    UsersApi.getUsers()
      .then((res) => {
        console.log(res.data);
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const fetchPickups = async () => {
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
    fetchUsers();
  }, [notify]);

  useEffect(() => {
    fetchPickups();
  }, [query]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<IPickup | null>(null);

  const handleOpenModal = (pickup: IPickup) => {
    console.log(pickup);
    setSelectedPickup(pickup);
    setIsModalOpen(true);
  };

  const handleDeletePickup = (pickup: IPickup) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this pickup?"
    );
    if (!confirm) return;

    PickUpApi.adminDeletePickUp(pickup._id)
      .then((res) => {
        console.log(res.data);
        setNotify(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="admin_page_heading">All Pickups</h3>
      </div>

      {pickups.length > 0 && <PickupMap userPickups={pickups} />}

      {loading ? <p className="my-4 font-bold">Loading...</p> : ""}

      {/* filters */}
      <div className="flex justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <label htmlFor="user">Filter by User</label>
          <select
            name="user"
            id="user"
            className="p-2 border border-gray-300 rounded-md"
            onChange={(e) => setQuery({ ...query, userId: e.target.value })}
          >
            <option value="">All Users</option>
            {users &&
              users.map((user: IUser) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="status">Filter by Status</label>
          <select
            name="status"
            id="status"
            className="p-2 border border-gray-300 rounded-md"
            onChange={(e) => setQuery({ ...query, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* cards not tables */}
      <div className="grid grid-cols-1 gap-4">
        {!loading &&
          pickups &&
          pickups.map((pickup: IPickup) => (
            <div
              key={pickup._id}
              className={`rounded-md shadow-md p-4 text-sm flex justify-between gap-4
                ${
                  pickup.status === "pending" ? "bg-[#fdf0f0]" : "bg-[#e9f5eb]"
                }`}
            >
              <div>
                <p className="text-sm">
                  {pickup.user.firstName} {pickup.user.lastName}
                </p>
                <p className="text-sm hidden">{pickup.user.email}</p>
                <p className="text-sm">
                  {new Date(pickup.createdAt).toDateString()}
                </p>
              </div>

              <div className="w-[200px]">
                <p className="text-sm">{pickup.location.address}</p>
                <p className="text-sm">
                  {new Date(pickup.scheduledDate).toLocaleDateString()} -{" "}
                  {pickup.scheduledTimeStart} to {pickup.scheduledTimeEnd}
                </p>
              </div>

              <div>
                <p className="text-sm">
                  Item Type: {pickup.itemType} - {pickup.description}
                </p>
                <p className="text-sm">Points Earned: {pickup.pointsEarned}</p>
                <p className="text-sm">
                  Confirmed Items Count: {pickup.itemsCount}
                </p>
              </div>

              <div>
                {/* <p className="text-sm">Status: {pickup.status}</p> */}
                <span
                  className={`text-sm font-medium ${
                    pickup.status === "pending"
                      ? "text-rose-700"
                      : "text-green-800"
                  }`}
                >
                  {pickup.status}
                </span>
              </div>

              <div className="">
                <button
                  className="btn underline text-green-900 font-medium block cursor-pointer"
                  onClick={() => handleOpenModal(pickup)}
                >
                  Complete Pickup
                </button>

                <button
                  className="btn underline text-green-900 font-medium block mt-4"
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
