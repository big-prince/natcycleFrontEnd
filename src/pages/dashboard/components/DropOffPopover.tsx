/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import DropOffApi from "../../../api/dropOffApi";
import { toast } from "react-toastify";

interface DropOffPopoverProps {
  id: string;
  setNotify: React.Dispatch<React.SetStateAction<string>>;
}

const DropOffPopover = ({ id, setNotify }: DropOffPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCancel = async () => {
    try {
      // Replace with the appropriate API call and parameters
      await DropOffApi.updateDropOffStatus(id, { status: "cancelled" });
      toast.success("Drop-off cancelled successfully");
      setNotify(Date.now().toString());
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel drop-off");
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <BsThreeDotsVertical />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
          <div className="py-1">
            <button
              onClick={handleCancel}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Cancel Drop-off
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropOffPopover;
