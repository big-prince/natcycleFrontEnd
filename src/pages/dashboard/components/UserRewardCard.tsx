import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { IReward } from "../../../types";

type cardProps = {
  reward: IReward;
};

const UserRewardCard = ({ reward }: cardProps) => {
  return (
    <div>
      <div key={reward._id} className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center h-[200px]">
          <img
            src={reward.image.url}
            alt={reward.name}
            className="w-full h-full rounded-md object-cover"
          />
        </div>

        <div className="mt-4 mb-4">
          <h3 className="text-lg font-semibold">{reward.name}</h3>
          <p className="text-sm my-1">{reward.description}</p>
          <p className="text-sm">Points: {reward.pointsRequired}</p>
          <p className="text-sm text-gray-400">Sponsor: {reward.sponsorName || 'NatCycle'}</p>
        </div>

        {/* dialog instead */}
        <AlertDialog.Root>
          <AlertDialog.Overlay className="general_modal_overlay" />

          <AlertDialog.Trigger className="w-full">
            <button className="rounded-full border-darkgreen p-2 w-full border-2">
              Redeem
            </button>
          </AlertDialog.Trigger>

          <AlertDialog.Content className="general_modal">
            <div>
              <h3 className="text-lg font-semibold">
                Are you sure you want to redeem this reward?
              </h3>
              <div className="flex justify-end mt-4">
                <button className="special_button text-green">Yes</button>
              </div>
            </div>

            <AlertDialog.AlertDialogCancel className="text-center w-full">
              <button className="text-center text-red-400 w-full mt-9">Cancel</button>
            </AlertDialog.AlertDialogCancel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

export default UserRewardCard;
