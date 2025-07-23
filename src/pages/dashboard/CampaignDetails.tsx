import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CampaignApi from "../../api/campaignApi";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { FaBottleWater, FaWineBottle } from "react-icons/fa6";
import { MdCheckroom, MdForest, MdCampaign } from "react-icons/md";
import Loading from "../../components/Loading";
import { toast } from "react-toastify";

export interface ICampaign {
  id: string;
  name: string;
  description: string;
  endDate: string;
  startDate: string;
  materialTypes?: string[];
  status: string;
  material?: string;
  goal: number;
  progress: number;
  image?: {
    url: string;
  };
  itemType: string;
  location?: string;
}

const getIconForMaterialType = (materialType: string): JSX.Element => {
  const lowerType = materialType?.toLowerCase() || "";

  if (lowerType === "plastic" || lowerType.includes("plastic")) {
    return <FaBottleWater className="text-green-600" />;
  }
  if (
    lowerType === "fabric" ||
    lowerType.includes("fabric") ||
    lowerType.includes("textile")
  ) {
    return <MdCheckroom className="text-blue-600" />;
  }
  if (lowerType === "glass" || lowerType.includes("glass")) {
    return <FaWineBottle className="text-amber-600" />;
  }
  if (
    lowerType === "paper" ||
    lowerType.includes("paper") ||
    lowerType.includes("cardboard")
  ) {
    return <MdForest className="text-green-800" />;
  }
  // Default icon
  return <MdForest className="text-green-600" />;
};

const isUrgent = (startDate: string): boolean => {
  const start = new Date(startDate);
  const now = new Date();

  // If campaign starts within 7 days, mark as urgent
  const differenceInDays = Math.ceil(
    (start.getTime() - now.getTime()) / (1000 * 3600 * 24)
  );
  return differenceInDays >= 0 && differenceInDays <= 7;
};

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCampaign = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await CampaignApi.getCampaign(id);
      console.log(res.data);
      setCampaign(res.data.data.campaign);
      setPercentage(
        Math.min(
          Math.round((res.data.data.progress / res.data.data.goal) * 100),
          100
        )
      );
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Error loading campaign details");
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchCampaign();
  }, [id, fetchCampaign]);

  const handleRecycleNowClick = () => {
    if (!campaign) return;

    // Properly store selected recyclables for compatibility
    const item = [campaign.material];
    localStorage.setItem("selectedRecyclables", JSON.stringify(item));

    // Navigate to dropoff/create with campaign mode and IDs
    navigate(
      `/dropoff/create?campaignId=${campaign.id}&campaignName=${campaign.name}&mode=campaign`
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loading />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Campaign not found</p>
        <Link to="/campaigns" className="text-green-600 mt-4 inline-block">
          ← Back to campaigns
        </Link>
      </div>
    );
  }

  // Get the first material type or "All" if it's an array
  const materialType = Array.isArray(campaign.materialTypes)
    ? campaign.materialTypes[0] || "All"
    : campaign.materialTypes || "All";

  const urgent = campaign.startDate ? isUrgent(campaign.startDate) : false;

  return (
    <div className="pb-20">
      <div className="bg-gray-50">
        <div className="p-4">
          <Link
            to="/campaigns"
            className="text-gray-600 flex items-center gap-1 mb-4"
          >
            <FaArrowLeft className="text-sm" /> Back to campaigns
          </Link>
        </div>

        <div className="relative">
          <img
            className="w-full h-56 object-cover"
            src={
              campaign.image?.url ||
              "https://via.placeholder.com/800x400?text=Campaign+Image"
            }
            alt={campaign.name}
          />

          {/* Floating material type icon */}
          <div className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md">
            {getIconForMaterialType(materialType)}
          </div>

          {urgent && (
            <div className="absolute top-4 left-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              Urgent
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {campaign.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-3">
            {Array.isArray(campaign.materialTypes)
              ? campaign.materialTypes.map((type, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize"
                  >
                    {type}
                  </span>
                ))
              : campaign.materialTypes && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize">
                    {campaign.materialTypes}
                  </span>
                )}

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                campaign.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {campaign.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <FaCalendarAlt className="text-gray-500" />
            <span className="text-sm">
              Ends:{" "}
              {new Date(campaign.endDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Progress bar */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex justify-between text-sm text-gray-700 mb-1">
              <span>Campaign Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            <div className="flex justify-between mt-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Goal</p>
                <p className="font-semibold">{campaign.goal}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Current</p>
                <p className="font-semibold">{campaign.progress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign description */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">About this Campaign</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {campaign.description}
          </p>
        </div>

        {/* Action button */}
        <div className=" bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
          <button
            onClick={() => handleRecycleNowClick()}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <MdCampaign className="text-xl" />
            Support This Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
