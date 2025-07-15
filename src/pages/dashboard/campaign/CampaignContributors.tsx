import { useEffect, useState } from "react";
import CampaignApi from "../../../api/campaignApi";
import { useParams } from "react-router-dom";

export interface ICampaignUser {
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: {
    public_id: string;
    url: string;
  };
  id: string;
  contributions: number;
}

const CampaignContributors = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchCampaign = async () => {
    if (!id) return;

    CampaignApi.getContributors(id)
      .then((res) => {
        console.log(res.data);
        setData(res.data.data.users);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  return (
    <div>
      <div>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mt-4">
          Campaign Contributors
        </h2>
      </div>

      <div className="mt-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {data.length > 0 ? (
              <div>
                {data.map((user: ICampaignUser) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b border-gray-200 py-4"
                  >
                    <div className="flex items-center">
                      <img
                        src={user.profilePicture.url}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <p className="text-sm font-semibold">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs font-semibold">
                            Contributions: {user.contributions}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No contributors yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignContributors;
