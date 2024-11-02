import { FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { BsThreeDots } from "react-icons/bs";
import RewardApi from "../../api/rewardApi";
import AddRewardModal from "./components/AddRewardModal";

type IReward = {
  status: string;
  image: {
    public_id: string;
    url: string;
  };
  _id: string;
  name: string;
  description: string;
  pointsRequired: number;
  __v?: number; // Add a question mark (?) to make it optional
  sponsorName: string;
  sponsorLink: string;
};

const AdminRewards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [rewards, setRewards] = useState<IReward[]>([]);

  const [selectedReward, setSelectedReward] = useState<IReward | null>(null);

  const fetchRewards = () => {
    RewardApi.adminGetAwards()
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

  const handleDelete = (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this reward?"
    );
    if (!confirm) return;

    RewardApi.adminDeleteAward(id)
      .then((response) => {
        console.log(response);
        fetchRewards();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEditClick = (badge: IReward) => {
    setSelectedReward(badge);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div>
        <div className="flex justify-between">
          <div className="font-bold text-2xl">All Rewards</div>

          <div className="flex">
            <div
              className="add_button flex items-center justify-center px-4 h-10 bg-darkgreen text-white rounded-md cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus className="add_icon" />
              Add New Reward
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {rewards.length > 0 &&
            rewards.map((badge) => (
              <div
                key={badge._id}
                className="bg-white p-4 rounded-md shadow-md"
              >
                <div>
                  <div>
                    <Popover.Root>
                      <Popover.Trigger>
                        <button>
                          <BsThreeDots />
                        </button>
                      </Popover.Trigger>
                      <Popover.Content
                        className="bg-white p-3 rounded-md shadow-md pr-8"
                        side="bottom"
                      >
                        <div>
                          <button className="text-sm text-gray-500 block"
                            onClick={() => handleEditClick(badge)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-sm text-red-500 block mt-3"
                            onClick={() => handleDelete(badge._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </Popover.Content>
                    </Popover.Root>
                  </div>
                </div>
                <div className="flex">
                  <div className="mr-2">
                    <img
                      src={badge.image.url}
                      alt=""
                      className="h-20 object-contain m-auto"
                    />
                  </div>

                  <div>
                    <div className="font-bold text-lg">
                      {
                        badge.name.length > 20 ? `${badge.name.slice(0, 20)}...` : badge.name
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {badge.description.length > 30 ? `${badge.description.slice(0, 30)}...` : badge.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      Points Required: {badge.pointsRequired.toLocaleString()}
                    </div>

                    <div className="text-sm text-gray-500">
                      Sponsor: {badge.sponsorName || 'Not Sponsored'}{" "}
                      {badge.sponsorLink && (
                        <a
                          href={badge.sponsorLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500"
                        >
                          (Link)
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <AddRewardModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setNotify={fetchRewards}
          selectedReward={selectedReward}
        />
      </div>
    </div>
  );
};

export default AdminRewards;
