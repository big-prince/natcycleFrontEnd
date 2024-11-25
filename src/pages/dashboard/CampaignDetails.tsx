import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CampaignApi from "../../api/campaignApi";
import { FaChevronRight } from "react-icons/fa6";
import { ICampaign } from "./components/Campaigns";

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [pickupCount, setPickupCount] = useState(0);

  const fetchCampaign = async () => {
    if (!id) return;

    CampaignApi.getCampaign(id)
      .then((res) => {
        console.log(res.data);
        setCampaign(res.data.data.campaign);
        setPickupCount(res.data.data.pickupCount);

        setPercentage((res.data.data.progress / res.data.data.goal) * 100);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  const handleRecycleNowClick = () => {
    const item = [campaign?.material];
    localStorage.setItem("selectedRecyclables", JSON.stringify(item));

    navigate(
      `/pickup/book?campaignId=${campaign?._id}&campaignName=${campaign?.name}`
    );
  };

  return (
    <div className="mb-20">
      {campaign ? (
        <div className="mt-4">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {campaign.name}
            </h2>

            <div className="flex justify-between w-full">
              <p className="text-sm text-gray-700">
                Material: {campaign.material?.toUpperCase()}
              </p>
              <p className="text-sm font-bold bg-black text-white rounded-full px-2 ">
                {campaign.status}
              </p>
            </div>
          </div>

          <div>
            <img
              className="w-full h-80 object-cover rounded-lg"
              src={campaign.image?.url}
              alt={campaign.name}
            />
          </div>

          <div>
            <p className="text-sm font-semibold">
              End Date: {new Date(campaign.endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-lg font-semibold">Progress</p>
            <div>
              <div className="bg-green h-6 w-full rounded-2xl p-1">
                <div
                  className={`bg-black h-4  rounded-2xl`}
                  style={{ width: `${percentage}%` }}
                >
                  <p className="text-white text-xs text-right pr-2">
                    {campaign?.progress}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="text-sm"></p>
                <p className="text-sm">{campaign?.goal}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <p className="text-sm text-darkgreen font-medium">
              Total Pickups: {pickupCount}
            </p>

            {/* view contributors */}
            <Link
              to={`/campaigns/${campaign._id}/contributors`}
              className="text-sm underline text-darkgreen font-medium"
            >
              View Contributors
            </Link>
          </div>

          <div className="mt-4">
            <div
              onClick={() => handleRecycleNowClick()}
              className="b-black p-2 py-3 rounded-2xl flex items-center justify-between w-full special_button cursor-pointer"
            >
              <p className="text-lg font-semibold text-green">
                Support Campaign
              </p>
              <FaChevronRight className="text-white" />
            </div>
          </div>

          <p className="mt-4 mb-1">{campaign.description}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CampaignDetails;
