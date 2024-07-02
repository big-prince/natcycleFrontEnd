import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";

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
  const [status, setStatus] = useState("");

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
              <h1 className="text-lg font-semibold">Complete Pickup</h1>
              <p className="text-sm">
                {pickup.user.firstName} {pickup.user.lastName}
              </p>
              <p className="text-sm">{pickup.user.email}</p>
            </div>
            <form className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="pointsEarned"
                  className="text-sm font-semibold block"
                >
                  Points Earned
                </label>

                <input
                  type="number"
                  id="pointsEarned"
                  className="p-2 border border-gray-300 rounded-md"
                  value={pointsEarned}
                  onChange={(e) => setPointsEarned(Number(e.target.value))}
                />
              </div>

              <div>
                <label htmlFor="status" className="text-sm font-semibold block">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
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
                  type="button"
                  className="btn bg-green-500 p-3 rounded-lg text-white"
                  onClick={() => {
                    // complete pickup
                    setIsModalOpen(false);
                    setNotify('Pickup completed successfully');
                  }}
                >
                  Complete Pickup
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
