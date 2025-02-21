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
      `/dropoff/create?campaignId=${campaign?._id}&campaignName=${campaign?.name}`
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
              <p className="px-2 text-sm font-bold text-white bg-black rounded-full">
                {campaign.status}
              </p>
            </div>
          </div>

          <div>
            <img
              className="object-cover w-full h-80 rounded-lg"
              src={campaign.image?.url}
              alt={campaign.name}
            />
          </div>

          <div>
            <p className="mt-1 text-sm font-medium">
              End Date: {new Date(campaign.endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-lg font-semibold">Progress</p>
            <div>
              <div className="p-1 w-full h-6 rounded-2xl bg-green">
                <div
                  className={`h-4 bg-black rounded-2xl`}
                  style={{ width: `${percentage}%` }}
                >
                  <p className="pr-2 text-xs text-right text-white">
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
            <p className="text-sm font-medium text-darkgreen">
              Total Pickups: {pickupCount}
            </p>

            {/* view contributors */}
            <Link
              to={`/campaigns/${campaign._id}/contributors`}
              className="text-sm font-medium underline text-darkgreen"
            >
              View Contributors
            </Link>
          </div>

          <div className="mt-4">
            <div
              onClick={() => handleRecycleNowClick()}
              className="flex justify-between items-center p-2 py-3 w-full rounded-2xl cursor-pointer b-black special_button"
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
