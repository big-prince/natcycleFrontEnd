import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { IReward } from "../../../types";
import RewardApi from "../../../api/rewardApi";
import { toast } from "react-toastify";

type cardProps = {
  reward: IReward;
  isUserReward?: boolean;
};

const UserRewardCard = ({ reward, isUserReward }: cardProps) => {
  const handleRedeem = () => {
    RewardApi.userRedeemAward(reward._id)
      .then((res) => {
        console.log(res);
        toast.success("Reward redeemed successfully");
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
      });
  };

  return (
    <div>
      <div key={reward._id} className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center h-[200px]">
          <img
            src={reward.image?.url}
            alt={reward.name}
            className="w-full h-full rounded-md object-cover"
          />
        </div>

        <div className="mt-4 mb-4">
          <h3 className="text-lg font-semibold">{reward.name}</h3>
          <p className="text-sm my-1">{reward.description}</p>

          {!isUserReward && (
            <p className="text-sm">Points: {reward.pointsRequired}</p>
          )}

          <p className="text-sm text-gray-600">
            Sponsor: {reward.sponsorName?.toUpperCase() || "NatCycle"}
          </p>

          {/* status */}
          {isUserReward && (
            <div className="mt-2 bg-black p-2 rounded-md">
              <p className="text-sm text-green">Status: {reward?.status?.toUpperCase()}</p>
            </div>
          )}
        </div>

        {/* dialog instead */}
        <AlertDialog.Root>
          <AlertDialog.Overlay className="general_modal_overlay" />

          {/* <AlertDialog.Trigger className="w-full">
            <button className="rounded-full border-darkgreen p-2 w-full border-2">
              Redeem
            </button>
          </AlertDialog.Trigger> */}

          {!isUserReward && (
            <AlertDialog.Trigger className="w-full">
              <button className="rounded-full border-darkgreen p-2 w-full border-2">
                Redeem
              </button>
            </AlertDialog.Trigger>
          )}

          <AlertDialog.Content className="general_modal">
            <div>
              <h3 className="text-lg font-semibold">
                Are you sure you want to redeem this reward?
              </h3>
              <div className="flex justify-end mt-4">
                <button
                  className="special_button text-green"
                  onClick={() => handleRedeem()}
                >
                  Yes
                </button>
              </div>
            </div>

            <AlertDialog.AlertDialogCancel className="text-center w-full">
              <button className="text-center text-red-400 w-full mt-9">
                Cancel
              </button>
            </AlertDialog.AlertDialogCancel>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </div>
  );
};

export default UserRewardCard;
