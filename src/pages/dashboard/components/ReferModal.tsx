import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { FaTimes } from "react-icons/fa";
import { useAppSelector } from "../../../hooks/reduxHooks";
import SocialShare from "./SocialShare";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ReferModal = ({ isModalOpen, setIsModalOpen }: Props) => {
  const localUser = useAppSelector((state) => state.auth.user);

  const referralLink = `https://nat-cycle.vercel.app/signup?referral=${localUser.referralId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Copied to clipboard");
  };

  return (
    <div>
      <AlertDialog.Root
        open={isModalOpen}
        onOpenChange={(isOpen: boolean | ((prevState: boolean) => boolean)) => {
          setIsModalOpen(isOpen);
        }}
      >
        <AlertDialog.Overlay className="general_modal_overlay" />

        <AlertDialog.Content className="general_modal">
          <div className="general_modal_content p-4">
            <div className="flex justify-between items-center mb-6">
              <AlertDialog.Title className="font-medium text-2xl">
                Invite Friends
              </AlertDialog.Title>

              <AlertDialog.AlertDialogCancel>
                <FaTimes className="text-gray-700" />
              </AlertDialog.AlertDialogCancel>
            </div>

            <AlertDialog.Description className=" text-left">
              <div>
                <div className="mb-6">
                  <p className="text-sm">
                    Share your referral link with your friends and earn 100
                    points for each friend that signs up.
                  </p>

                  <div className="flex justify-between items-center mt-4 border-2 rounded-2xl p-3">
                    <p className="overflow-hidden">
                      <p className="text-sm text-darkgreen fkhndk">
                        {referralLink}
                      </p>
                    </p>

                    <button
                      onClick={handleCopy}
                      className="text-white p-2 bg-darkgreen rounded-2xl px-4"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <SocialShare url={referralLink} />
              </div>
            </AlertDialog.Description>

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
  );
};

export default ReferModal;
