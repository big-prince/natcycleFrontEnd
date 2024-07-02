/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Popover from "@radix-ui/react-popover";
import { BsThreeDotsVertical } from "react-icons/bs";
import PickUpApi from "../../../api/pickUpApi";

export default function PickupPopover({ id, setNotify }: any) {
  const handleCancelPickup = async () => {
    const confirm = window.confirm('Are you sure you want to cancel this pickup?');
    if (!confirm) return;

    try {
      await PickUpApi.cancelPickUp(id);
      setNotify('Pickup cancelled');
    } catch (error) {
      console.error(error);
      // setNotify('Error cancelling pickup');
    }
  }
  return (
    <Popover.Root>
      <Popover.Trigger>
        <BsThreeDotsVertical className="text-lg text-gray-500" />
      </Popover.Trigger>

      <Popover.Content className="bg-white border p-2 rounded-lg shadow-md">
        <button className="text-sm" onClick={() => handleCancelPickup()}>
          Cancel Pickup
        </button>
      </Popover.Content>
    </Popover.Root>
  );
}
