import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBottleWater, FaWineBottle, FaChevronRight } from "react-icons/fa6";
import { MdCheckroom, MdForest, MdCampaign } from "react-icons/md";
import CampaignApi from "../../../api/campaignApi";
import { toast } from "react-toastify";

interface Campaign {
  id: string;
  name: string;
  materialTypes: string[] | string;
  startDate: string;
  endDate: string;
  image?: {
    url: string;
  };
  status: string;
}

const getIconForMaterialType = (materialType: string): JSX.Element => {
  const lowerType = materialType?.toLowerCase() || "";

  if (lowerType === "plastic" || lowerType.includes("plastic")) {
    return <FaBottleWater className="w-6 h-6 text-green-600" />;
  }
  if (
    lowerType === "fabric" ||
    lowerType.includes("fabric") ||
    lowerType.includes("textile")
  ) {
    return <MdCheckroom className="w-6 h-6 text-blue-600" />;
  }
  if (lowerType === "glass" || lowerType.includes("glass")) {
    return <FaWineBottle className="w-6 h-6 text-amber-600" />;
  }
  if (
    lowerType === "paper" ||
    lowerType.includes("paper") ||
    lowerType.includes("cardboard")
  ) {
    return <MdForest className="w-6 h-6 text-green-800" />;
  }
  // Default icon
  return <MdForest className="w-6 h-6 text-green-600" />;
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

// Helper function to get user's current location
const getUserLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting user location:", error);
        reject(error);
      }
    );
  });
};

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        // Get user's location
        const position = await getUserLocation();

        // Use getNearbyCampaigns to fetch only campaigns near the user
        const response = await CampaignApi.getNearbyCampaigns(
          position.latitude,
          position.longitude,
          50000 // 50km radius
        );

        if (response.data && response.data.data) {
          // Filter active campaigns
          const activeCampaigns = Array.isArray(response.data.data)
            ? response.data.data.filter(
                (campaign: Campaign) => campaign.status === "active"
              )
            : [];
          setCampaigns(activeCampaigns);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        // If getting user location or nearby campaigns fails, fall back to all campaigns
        try {
          const fallbackResponse = await CampaignApi.getCampaigns();
          if (fallbackResponse.data && fallbackResponse.data.data) {
            const activeCampaigns = (
              fallbackResponse.data.data.docs || []
            ).filter((campaign: Campaign) => campaign.status === "active");
            setCampaigns(activeCampaigns);
          }
        } catch (fallbackError) {
          toast.error("Failed to load campaigns");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          <MdCampaign className="text-green-600 mr-2" /> Campaign Events
        </h2>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-3 pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 animate-pulse bg-gray-100 rounded-lg p-3 flex items-center min-w-[200px]"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 mr-3"></div>
                <div className="flex-grow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-md font-semibold flex items-center">
          <MdCampaign className="text-green-600 mr-2" /> Nearby Campaign Events
        </h2>
        <Link
          to="/campaigns"
          className="text-green-600 text-sm flex items-center gap-1"
        >
          See all <FaChevronRight className="text-xs" />
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex space-x-3 pb-2">
          {campaigns.map((campaign) => {
            // Get the first material type or "All" if it's an array
            const materialType = Array.isArray(campaign.materialTypes)
              ? campaign.materialTypes[0] || "All"
              : campaign.materialTypes || "All";

            const urgent = isUrgent(campaign.startDate);

            return (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="flex-shrink-0 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors overflow-hidden flex items-center w-auto min-w-[200px] p-2"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mr-3">
                  {campaign.image?.url ? (
                    <img
                      src={campaign.image.url}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getIconForMaterialType(materialType)
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-xs text-gray-800 text-sm truncate">
                    {campaign.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {materialType}
                  </p>
                </div>
                {urgent && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-1.5 py-0.5 rounded-full text-[10px] ml-1 flex-shrink-0">
                    urgent
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CampaignsList;
