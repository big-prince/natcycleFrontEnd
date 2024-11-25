import { useState, useEffect } from "react";
import BadgeApi from "../../../api/badgeApi";
import { IBadge } from "../../../types";

const AdminUserBadges = ({ id }: any) => {
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState<IBadge[]>([]);

  useEffect(() => {
    setLoading(true);

    BadgeApi.getUserBadges(id!)
      .then((res) => {
        console.log(res.data);
        setBadges(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="mt-8 text-center">Loading...</p>;
  }

  // remove badge from  user
  const handleRemoveBadge = (badgeId: string) => {
    const confirm = window.confirm("Are you sure you want to remove this badge?");
    if (!confirm) return;

    BadgeApi.removeBadgeFromUser(id!, badgeId)
      .then((res) => {
        console.log(res.data);
        setBadges(badges.filter((badge) => badge._id !== badgeId));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="mt-6">
      <div>
        <h2 className="text-2xl font-medium mb-4">Users Badge</h2>
      </div>

      <div className="flex justify-between">
        {badges &&
          badges.length > 0 &&
          badges.map((badge) => (
            <div key={badge._id} className="bg-gray-100 p-2 rounded-xl">
              <div className="m-auto w-28 h-28  flex items-center justify-between">
                <img
                  src={badge.image.url}
                  alt="badge"
                  className="m-auto object-cover w-full h-full rounded-xl"
                />
              </div>
              <p className="text-center font-semibold text-darkgreen mt-2">
                {badge.name} Badge
              </p>

              <p
                onClick={() => handleRemoveBadge(badge._id)}
                className="text-center text-sm text-red-500 cursor-pointer"
              >
                Remove
              </p>
            </div>
          ))}

          {
            badges.length === 0 && <p>No badges</p>
          }
      </div>
    </div>
  );
};

export default AdminUserBadges;
