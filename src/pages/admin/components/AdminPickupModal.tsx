import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import PickUpApi from "../../../api/pickUpApi";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";

type PickupModalProps = {
  isModalOpen;
  setIsModalOpen;
  pickup;
  setNotify;
};

const AdminPickupModal = ({
  isModalOpen,
  setIsModalOpen,
  pickup,
  setNotify,
}: PickupModalProps) => {
  const [pointsEarned, setPointsEarned] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);


  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pointsEarned) {
      return;
    }

    setLoading(true);

    const payload  = {
      pointsEarned,
      itemsCount,
      status: "completed",
    }

    PickUpApi.adminCompletePickUp(pickup._id, payload)
      .then((res) => {
        console.log(res.data);
        setNotify(true);
        setIsModalOpen(false);
        toast.success("Pickup completed successfully");
        setLoading(false);
        setPointsEarned(0);
        setItemsCount(0);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message || "An error occurred");
        setLoading(false);
      });
  };

  return (
    <div>
      <AlertDialog.Root
        open={isModalOpen}
        onOpenChange={(isOpen) => {
          setIsModalOpen(isOpen);
        }}
      >
        <AlertDialog.Overlay className="general_modal_overlay" />

        <AlertDialog.Content className="general_modal">
          <div className="bg-white p-4 rounded-md">
            <div>
              <h1 className="text-lg font-semibold border-b-2">
                Complete Pickup
              </h1>

              <div>
                <AlertDialog.AlertDialogCancel className="absolute top-7 right-6">
                  <FaTimes />
                </AlertDialog.AlertDialogCancel>
              </div>
            </div>

            <div className="flex gap-5 my-4">
              <div>
                <p className="font-medium">
                  {pickup.user.firstName} {pickup.user.lastName}
                </p>
                <p className="text-xs">Full name</p>
              </div>
              <div>
                <p className="font-medium">{pickup.user.email}</p>
                <p className="text-xs">User Email</p>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="pointsEarned"
                  className="text-sm font-medium block"
                >
                  Points Earned
                </label>

                <input
                  type="number"
                  id="pointsEarned"
                  className="p-2 border text-sm border-gray-300 rounded-md"
                  value={pointsEarned}
                  onChange={(e) => setPointsEarned(Number(e.target.value))}
                />
              </div>

              <div>
                <label htmlFor="itemsCount" className="text-sm font-medium block">
                  Items Count
                </label>
                <input
                  type="number"
                  id="itemsCount"
                  className="p-2 border text-sm border-gray-300 rounded-md"
                  value={itemsCount}
                  onChange={(e) => setItemsCount(Number(e.target.value))}
                />
              </div>

              <div className="hidden">
                <label htmlFor="status" className="text-sm font-medium block">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="p-2 border text-sm border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  className="btn underline text-red-500"
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn bg-green-500 p-3 rounded-lg text-white"
                >
                  {loading ? "Loading..." : "Complete Pickup"}
                </button>
              </div>
            </form>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default AdminPickupModal;
