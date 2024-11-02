/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import RewardApi from "../../../api/rewardApi";
import { IReward } from "../../../types";


type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNotify: React.Dispatch<React.SetStateAction<boolean>>;
  selectedReward: IReward | null;
};

const AddRewardModal = ({
  isModalOpen,
  setIsModalOpen,
  setNotify,
  selectedReward,
}: Props) => {
  const [rewardName, setRewardName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pointsRequired, setPointsRequired] = useState(0);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorLink, setSponsorLink] = useState("");

  const [action, setAction] = useState("Add");

  useEffect(() => {
    if (selectedReward) {
      setRewardName(selectedReward.name);
      setDescription(selectedReward.description);
      setPointsRequired(selectedReward.pointsRequired);
      setSponsorName(selectedReward.sponsorName);
      setSponsorLink(selectedReward.sponsorLink);
      setAction("Edit");
    }
  }, [selectedReward]);

  const readFile = (file: Blob | string) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file as Blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (image) {
      const rewardImage = await readFile(image);

      const payload = {
        name: rewardName,
        image: rewardImage,
        description,
        pointsRequired,
        sponsorName,
        sponsorLink,
      }
      
      setLoading(true);
      let response;

      try {
        if (selectedReward) {
          response = await RewardApi.adminUpdateAward(selectedReward._id, payload);
        } else {
          response = await RewardApi.adminCreateReward(payload);
        }
        console.log(response);
        setLoading(false);
        setRewardName("");
        setImage(null);
        setIsModalOpen(false);
        setNotify(true);
      } catch (error: any) {
        console.error(error);
        setLoading(false);
        toast.error(error.response.data.message);
      }
    }
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

        <AlertDialog.Content className="general_modal h-[600px]">
          <div className="general_modal_content p-4">
            <div className="flex justify-between items-center mb-6">
              <AlertDialog.Title className="font-medium text-2xl">
                Add New Reward
              </AlertDialog.Title>

              <AlertDialog.AlertDialogCancel>
                <FaTimes className="text-gray-700" />
              </AlertDialog.AlertDialogCancel>
            </div>

            <AlertDialog.Description className=" text-left">
              <div>
                <form action="" onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="rewardName" className="block text-sm font-medium text-gray-700">
                      Reward Name
                    </label>
                    <input
                      type="text"
                      name="rewardName"
                      id="rewardName"
                      placeholder="Reward Name"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={rewardName}
                      onChange={(e) => setRewardName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="rewardName" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      placeholder="Description"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      name="image"
                      id="image"
                      placeholder="Image"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      onChange={(e) => setImage(e.target.files![0])}
                      // required
                      {
                        ...(selectedReward && { required: false })
                      }
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                      Points Required
                    </label>
                    <input
                      type="number"
                      name="points"
                      id="points"
                      placeholder="Points Required"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={pointsRequired}
                      onChange={(e) => setPointsRequired(parseInt(e.target.value))}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="sponsorName" className="block text-sm font-medium text-gray-700">
                      Sponsor Name
                    </label>
                    <input
                      type="text"
                      name="sponsorName"
                      id="sponsorName"
                      placeholder="Sponsor Name"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4 hidden">
                    <label htmlFor="sponsorLink" className="block text-sm font-medium text-gray-700">
                      Sponsor Link (optional)
                    </label>
                    <input
                      type="text"
                      name="sponsorLink"
                      id="sponsorLink"
                      placeholder="Sponsor Link"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                      value={sponsorLink}
                      onChange={(e) => setSponsorLink(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-400 text-white p-2 rounded-lg w-full"
                    >
                      {
                        loading ? "Loading..." : action
                      }
                    </button>
                  </div>
                </form>
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
  )
}

export default AddRewardModal