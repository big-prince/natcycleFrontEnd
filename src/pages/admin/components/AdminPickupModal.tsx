import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import PickUpApi from "../../../api/pickUpApi";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { IUser } from "../../../types";

export type IPickup = {
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
  scheduledDate: Date;
  scheduledTimeEnd: string;
  scheduledTimeStart: string;
  status: string;
  updatedAt: string;
  user: IUser;
  items: {
    plastic: number;
    fabric: number;
    glass: number;
    paper: number;
  };
  confirmedItems?: {
    plastic: number;
    fabric: number;
    glass: number;
    paper: number;
  };
};

type PickupModalProps = {
  isModalOpen;
  setIsModalOpen;
  pickup: IPickup;
  setNotify;
};

const AdminPickupModal = ({
  isModalOpen,
  setIsModalOpen,
  pickup,
  setNotify,
}: PickupModalProps) => {
  // const recyclablesWithPoints: { item: string; points: number }[] = [
  //   { item: "Plastic Bottles", points: 10 },
  //   { item: "Fabric", points: 5 },
  //   { item: "Glass", points: 8 },
  //   { item: "Mixed", points: 2 },
  // ];

  // const [itemsCount, setItemsCount] = useState(0);
  const [items, setItems] = useState({
    plastic: pickup.items.plastic,
    fabric: pickup.items.fabric,
    glass: pickup.items.glass,
    paper: pickup.items.paper,
  });

  const handleItemChange = (e: any) => {
    setItems({
      ...items,
      [e.target.name]: parseInt(e.target.value),
    });
  };

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const confirm = window.confirm(
      "Are you sure you want to complete this pickup?"
    );
    if (!confirm) return;

    setLoading(true);

    const payload = {
      items,
    };

    PickUpApi.adminCompletePickUp(pickup._id, payload)
      .then((res) => {
        console.log(res.data);
        setNotify(true);
        setIsModalOpen(false);
        toast.success("Pickup completed successfully");
        setLoading(false);
        // setPointsEarned(0);
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

            <div className="flex gap-6 my-4 text-sm">
              <div>
                <p className="font-medium text-base">
                  {pickup.user.firstName} {pickup.user.lastName}
                </p>
                <p className="text-xs">Full name</p>
              </div>
              <div>
                <p className="font-medium text-base">{pickup.user.email}</p>
                <p className="text-xs">User Email</p>
              </div>
            </div>

            <div className="flex gap-6 my-4 text-sm">
              <div>
                <p className="font-medium">
                  {new Date(pickup.scheduledDate).toLocaleDateString()}
                </p>
                <p className="text-xs">Pickup Date</p>
              </div>
              <div className="hidden">
                <p className="font-medium">{pickup.user.email}</p>
                <p className="text-xs">User Email</p>
              </div>
            </div>

            <form className="flex flex-col gap-4 text-sm" onSubmit={handleSubmit}>
              <h2 className="text-lg font-semibold">Items</h2>
              <div className="flex gap-4">
                <div>
                  <label className="font-medium">Plastic</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    name="plastic"
                    onChange={handleItemChange}
                    required
                    value={items.plastic}
                  />
                </div>

                <div>
                  <label className="font-medium">Fabric</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    name="fabric"
                    onChange={handleItemChange}
                    required
                    value={items.fabric}
                  />
                </div>

                <div>
                  <label className="font-medium">Glass</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    name="glass"
                    onChange={handleItemChange}
                    required
                    value={items.glass}
                  />
                </div>

                <div>
                  <label className="font-medium">Paper</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    name="paper"
                    onChange={handleItemChange}
                    required
                    value={items.paper}
                  />
                </div>
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

              {pickup.status !== "completed" && (
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
              )}
            </form>

            {pickup.status === "completed" && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold">Confirmed Items</h2>
                <div className="flex gap-4">
                  <div>
                    <label className="font-medium">Plastic</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      name="plastic"
                      required
                      value={pickup.confirmedItems?.plastic}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Fabric</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      name="fabric"
                      onChange={handleItemChange}
                      required
                      value={pickup.confirmedItems?.fabric}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Glass</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      name="glass"
                      onChange={handleItemChange}
                      required
                      value={pickup.confirmedItems?.glass}
                    />
                  </div>

                  <div>
                    <label className="font-medium">Paper</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      name="paper"
                      onChange={handleItemChange}
                      required
                      value={pickup.confirmedItems?.paper}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default AdminPickupModal;
