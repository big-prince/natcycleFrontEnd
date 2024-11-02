import { FaPlus } from "react-icons/fa6";
import AddBadgeModal from "./components/AddBadgeModal";
import { useEffect, useState } from "react";
import BadgeApi from "../../api/badgeApi";
import { IBadge } from "../../types";
import * as Popover from "@radix-ui/react-popover";
import { BsThreeDots } from "react-icons/bs";

const AdminBadges = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [trigger, setTrigger] = useState(false);

  const [badges, setBadges] = useState<IBadge[]>([]);

  const [selectedBadge, setSelectedBadge] = useState<IBadge | null>(null);

  useEffect(() => {
    BadgeApi.getBadges()
      .then((response) => {
        console.log(response.data);
        setBadges(response.data.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [trigger]);

  const handleDelete = (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this badge?"
    );
    if (!confirm) return;

    BadgeApi.deleteBadge(id)
      .then((response) => {
        console.log(response);
        setTrigger(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEditClick = (badge: IBadge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="font-bold text-2xl">All Badges</div>

        <div className="flex">
          <div
            className="add_button flex items-center justify-center px-4 h-10 bg-darkgreen text-white rounded-md cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus className="add_icon" />
            Add Badge
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {badges.length > 0 &&
          badges.map((badge) => (
            <div key={badge._id} className="bg-white p-4 rounded-md shadow-md">
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
              <div className="text-center">
                <div>
                  <img
                    src={badge.image.url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-full m-auto"
                  />
                </div>
                <div className="font-bold text-lg mt-4">{badge.name}</div>
                <div className="text-sm text-gray-500">{badge.description}</div>
              </div>
            </div>
          ))}
      </div>

      <AddBadgeModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setNotify={setTrigger}
        badge={selectedBadge}
      />
    </div>
  );
};

export default AdminBadges;
