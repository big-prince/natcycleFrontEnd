/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import PickUpApi from "../../api/pickUpApi";
import { useParams } from "react-router-dom";
import { IPickup } from "../../types";
import CoolLoading from "../dashboard/components/Loading";
import { toast } from "react-toastify";
import PickupMap from "./components/PickupMap";
import { FaRegCopy } from "react-icons/fa6";

const PickupDetails = () => {
  const { id } = useParams();

  const [pickup, setPickup] = useState<IPickup | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPickup = async () => {
    if (!id) return;

    setLoading(true);

    PickUpApi.getPickUp(id)
      .then((res) => {
        console.log(res);
        setPickup(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchPickup();
  }, []);

  const [itemsCount, setItemsCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickup) return;

    if (!itemsCount || itemsCount < 1) {
      alert("Please enter the items count");
      return;
    }

    const confirm = window.confirm("Are you sure you want to complete this pickup?");
    if (!confirm) return;

    setLoading(true);

    const payload = {
      itemsCount,
      status: "completed",
    };

    PickUpApi.adminCompletePickUp(pickup._id, payload)
      .then((res) => {
        console.log(res.data);
        toast.success("Pickup completed successfully");
        setLoading(false);
        setItemsCount(0);
        fetchPickup();
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message || "An error occurred");
        setLoading(false);
      });
  };

  const copyToClipboard = () => {
    if (!pickup) return;

    navigator.clipboard.writeText(pickup.location.address);
    toast.success("Location address copied");
  };

  return (
    <div className="px-4">
      {loading ? (
        <p>
          <CoolLoading />
        </p>
      ) : null}

      <h1 className="text-2xl font-bold text-black mb-4">
        PickUp: {id?.slice(0, 10)}...{" "}
        <FaRegCopy className="inline" onClick={copyToClipboard} />
      </h1>

      {pickup && (
        <div>
          {pickup && <PickupMap userPickups={[pickup]} />}

          <div>
            <h2 className="font-bold text-xl mb-4 hidden">User Info</h2>

            <div className="bg-bg p-6 rounded-lg">
              <div>
                <img
                  className="w-40 h-40 rounded-lg object-cover mb-8"
                  src={pickup?.user.profilePicture?.url}
                  alt={pickup?.user.firstName}
                />
              </div>

              <div className="flex gap-4 md:gap-10 flex-wrap">
                <div>
                  <p className="text-xl font-medium">
                    {pickup?.user.firstName} {pickup?.user.lastName}
                  </p>
                  <p className="text-sm text-gray-700">User Name</p>
                </div>

                <div>
                  <p className="text-xl font-medium">{pickup?.user.email}</p>
                  <p className="text-sm text-gray-700">User Email</p>
                </div>
              </div>
            </div>
          </div>

          {/*  complete pickup form */}
          <div className="mt-8">
            <h2 className="font-medium text-xl mb-2">Complete Pickup</h2>

            <div className="bg-bg p-6 rounded-lg">
              <form action="" onSubmit={handleSubmit}>
                <div className="flex items-center">
                  <div>
                    <label
                      htmlFor="itemsCount"
                      className="font-medium block"
                    >
                      {pickup.itemType} Count
                    </label>
                    <input
                      type="number"
                      id="itemsCount"
                      className="p-2 py-3 border text-sm border-gray-300 rounded-md bg-transparent"
                      value={itemsCount}
                      onChange={(e) => setItemsCount(Number(e.target.value))}
                    />
                  </div>

                  <div className="mt-6">
                    <button className="btn bg-green-900 text-white px-4 font-medium block border-2 rounded-md p-2 py-3">
                      Complete
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* pickup details */}
          <div className="mt-8">
            <h2 className="font-medium text-xl mb-2">Pickup Details</h2>

            <div className="bg-bg p-6 rounded-lg">
              <div className="mb-4">
                <p className="text-xl font-medium">{pickup?.itemType}</p>
                <p className="text-sm text-gray-700">Item Type</p>
              </div>

              <div className="mb-4">
                <p className="text-xl font-medium">{pickup?.itemsCount}</p>
                <p className="text-sm text-gray-700">Items Count</p>
              </div>

              <div className="mb-4 hidden">
                <p className="text-xl font-medium">{pickup?.location._id}</p>
                <p className="text-sm text-gray-700">Location</p>
              </div>

              <div className="mb-4">
                <p className="text-xl font-medium">
                  {new Date(pickup.scheduledDate).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">Created At</p>
              </div>

              <div className="mb-4">
                <p className="text-xl font-bold">{pickup?.status}</p>
                <p className="text-sm text-gray-700">Status</p>
              </div>

              {pickup.status === 'completed' && (
                <div className="mb-4">
                  <p className="text-xl font-medium">
                    {new Date(pickup.completedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700">Completed At</p>
                </div>
              )}

              {
                pickup.status === 'completed' && (
                  <div className="mb-4">
                    <p className="text-xl font-medium">
                      {pickup.completedBy || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700">Completed By</p>
                  </div>
                )
              }

              {/* scheduled period */}
              <div className="mb-4">
                <p className="text-xl font-medium">
                  {pickup.scheduledTimeStart} - {pickup.scheduledTimeEnd}
                </p>
                <p className="text-sm text-gray-700">Scheduled Time</p>
              </div>
            </div>
          </div>

          {/* location details */}
          <div className="mt-8">
            <h2 className="font-medium text-xl mb-2">Location Details</h2>

            <div className="bg-bg p-6 rounded-lg">
              <div className="mb-4">
                <p className="text-xl font-medium">{pickup?.location.name}</p>
                <p className="text-sm text-gray-700">Location Name</p>
              </div>

              <div className="mb-4">
                <p className="text-xl font-medium">
                  {pickup?.location.address}
                </p>
                <p className="text-sm text-gray-700">Location Address</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupDetails;
