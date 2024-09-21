/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import RewardApi from "../../api/rewardApi";
import { Link } from "react-router-dom";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { FaTimes } from "react-icons/fa";

interface Award {
  _id: string; // Unique identifier for the award
  name: string; // Name of the award (e.g., "Pizza")
  description: string; // Description of the award (e.g., "Get a free pizza")
  pointsRequired: number; // Number of points required to redeem the award
  status: "pending" | "redeemed" | "expired" | string; // Award status (can be extended with custom statuses)
  image: {
    public_id: string; // Cloudinary public ID for the image
    url: string; // Full image URL
  };
  user: User; // User who redeemed the award
  redeemedAt?: string; // Optional: Date and time when the award was redeemed (in ISO 8601 format)
  sponsorName?: string; // Optional: Name of the award sponsor
  sponsorLink?: string; // Optional: Link to the award sponsor (URL)
  __v?: number; // Optional: Mongoose version field (if applicable)
}

interface User {
  _id: string; // Unique identifier for the user
  firstName: string; // User's first name
  lastName: string; // User's last name
}

const AdminRedeemedRewards = () => {
  const [rewards, setRewards] = useState<Award[]>([]);

  const fetchRewards = () => {
    RewardApi.adminGetRedeemedAwards()
      .then((response) => {
        console.log(response.data);
        setRewards(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedReward, setSelectedReward] = useState<Award | null>(null);

  const handleOpenModal = (reward: Award) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState("");

  const handleUpdateStatus = () => {
    setIsUpdating(true);

    if (!selectedReward || !status) {
      setIsUpdating(false);
      return;
    }

    RewardApi.adminUpdateRedeemedStatus(selectedReward._id, status)
      .then((response) => {
        console.log(response);
        fetchRewards();
        setIsUpdating(false);
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error(error);
        setIsUpdating(false);
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="admin_page_heading">
          Redeemed Rewards ({rewards.length})
        </h3>
      </div>

      <div>
        <table className="table-auto w-full">
          <thead>
            <tr className="text-left">
              {/* <th>Image</th> */}
              <th>No.</th>
              <th>Name</th>
              <th>Description</th>
              <th>Points Required</th>
              <th>User</th>
              <th>Status</th>
              <th>Redeemed At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rewards.map((reward) => (
              <tr key={reward._id}>
                <td className="py-3">{rewards.indexOf(reward) + 1}</td>
                <td className="font-semibold underline">
                  <Link to={"/admin/rewards"}>{reward.name}</Link>
                </td>
                <td className="py-3">{reward.description}</td>
                <td className="py-3">{reward.pointsRequired}</td>
                <td className="underline text-darkgreen">
                  <Link to={`/admin/users/${reward.user._id}`}>
                    {`${reward.user.firstName} ${reward.user.lastName}`}
                  </Link>
                </td>
                <td className="py-3">{reward.status}</td>
                <td className="py-3">
                  {new Date(reward.redeemedAt || "").toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={() => handleOpenModal(reward)}
                    className="text-blue-400 underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <AlertDialog.Root
          open={isModalOpen}
          onOpenChange={(
            isOpen: boolean | ((prevState: boolean) => boolean)
          ) => {
            setIsModalOpen(isOpen);
          }}
        >
          <AlertDialog.Overlay className="general_modal_overlay" />

          <AlertDialog.Content className="general_modal">
            <div className="general_modal_content p-4">
              <div className="flex justify-between items mb-6">
                <AlertDialog.Title className="font-medium text-2xl">
                  Reward Details
                </AlertDialog.Title>

                <AlertDialog.AlertDialogCancel>
                  <FaTimes className="text-gray-700" />
                </AlertDialog.AlertDialogCancel>
              </div>

              {/* <AlertDialog.Description className=" text-left"></AlertDialog.Description> */}

              {/* some details and form to update status */}
              <div className="">
                <div className="flex items-center mb-4">
                  <img
                    src={selectedReward?.image.url}
                    alt={selectedReward?.name}
                    className="w-20 h-20 object-cover rounded-full m-auto"
                  />
                </div>
                <div className="font-bold text-lg text-left mb-2">
                  {selectedReward?.name}
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="text-sm text-gray-700">
                    Details:
                    {selectedReward?.description}
                  </div>
                  <div className="text-sm text-gray-700">
                    Points Required: {selectedReward?.pointsRequired}
                  </div>
                  <div className="text-sm text-gray-700">
                    Redeemed By:{" "}
                    <Link to={`/admin/users/${selectedReward?.user._id}`}>
                      {`${selectedReward?.user.firstName} ${selectedReward?.user.lastName}`}
                    </Link>
                  </div>
                  <div className="text-sm text-gray-700">
                    Redeemed At:{" "}
                    {new Date(
                      selectedReward?.redeemedAt || ""
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {/* select dropdown */}
                <div className="mb-4">
                  <label
                    htmlFor="status"
                    className="block text-left text-sm font-medium text-gray-700"
                  >
                    Update Status
                  </label>

                  <select
                    name="status"
                    id="status"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* submit button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleUpdateStatus()}
                    className="btn py-3 rounded-md bg-green-400 text-white w-full"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </div>

              {/* close */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className=" text-red-400 underline p-2 rounded-lg w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

export default AdminRedeemedRewards;
