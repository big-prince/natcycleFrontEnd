import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CampaignApi from "../../../api/campaignApi";
import {
  FaBottleWater,
  FaWineBottle,
  FaLocationDot,
  FaFilter,
} from "react-icons/fa6";
import { MdCheckroom, MdForest, MdCampaign } from "react-icons/md";
import { toast } from "react-toastify";
import Loading from "../../../components/Loading";

// Import from the ICampaign interface
interface Campaign {
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
  distance?: number; // Added for nearby campaigns
}

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

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState(false);
  const [materialFilter, setMaterialFilter] = useState<string | null>(null);
  const [nearbyFilter, setNearbyFilter] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        // If nearbyFilter is active, use geolocation and the nearby campaigns API
        if (nearbyFilter) {
          try {
            const position = await getUserLocation();
            const response = await CampaignApi.getNearbyCampaigns(
              position.latitude,
              position.longitude,
              50000, // 50km radius
              materialFilter || undefined
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
            console.error("Error fetching nearby campaigns:", error);
            toast.error(
              "Failed to get your location. Showing all campaigns instead."
            );
            // Fall back to all campaigns if location fails
            await fetchAllCampaigns();
          }
        } else {
          // Fetch all campaigns if nearby filter is not active
          await fetchAllCampaigns();
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    };

    // Helper function to fetch all campaigns
    const fetchAllCampaigns = async () => {
      const response = await CampaignApi.getCampaigns();
      if (response.data && response.data.data) {
        // Filter active campaigns by default
        const activeCampaigns = (response.data.data.docs || []).filter(
          (campaign: Campaign) => campaign.status === "active"
        );
        setCampaigns(activeCampaigns);
      }
    };

    fetchCampaigns();
  }, [nearbyFilter, materialFilter]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    // Apply material type filter if selected
    if (materialFilter && campaign.materialTypes) {
      const materialTypes = Array.isArray(campaign.materialTypes)
        ? campaign.materialTypes
        : [campaign.materialTypes];

      if (
        !materialTypes.some((type) =>
          type.toLowerCase().includes(materialFilter.toLowerCase())
        )
      ) {
        return false;
      }
    }

    // We don't need additional filtering for nearby campaigns
    // since we're now fetching nearby campaigns directly from the API

    return true;
  });

  const uniqueMaterialTypes = Array.from(
    new Set(
      campaigns
        .flatMap((campaign) =>
          Array.isArray(campaign.materialTypes)
            ? campaign.materialTypes
            : [campaign.materialTypes]
        )
        .filter(Boolean) as string[]
    )
  );

  const toggleMaterialFilter = (material: string) => {
    if (materialFilter === material) {
      setMaterialFilter(null);
    } else {
      setMaterialFilter(material);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <MdCampaign className="text-green-600 mr-2" /> Campaign Events
          </h1>
        </div>
        <div className="flex justify-center mt-10">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <MdCampaign className="text-green-600 mr-2" /> Campaign Events
        </h1>
        <button
          onClick={() => setFilterActive(!filterActive)}
          className="bg-gray-100 p-2 rounded-full"
        >
          <FaFilter
            className={`${filterActive ? "text-green-600" : "text-gray-500"}`}
          />
        </button>
      </div>

      {filterActive && (
        <div className="mb-6 bg-gray-50 p-4 rounded-xl">
          <h2 className="font-semibold mb-2">Filter Campaigns</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Material Type</p>
            <div className="flex flex-wrap gap-2">
              {uniqueMaterialTypes.map((material) => (
                <button
                  key={material}
                  onClick={() => toggleMaterialFilter(material)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    materialFilter === material
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setNearbyFilter(!nearbyFilter)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                nearbyFilter
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <FaLocationDot /> Nearby Campaigns
            </button>
          </div>
        </div>
      )}

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No campaigns found with selected filters
          </p>
          {materialFilter && (
            <button
              onClick={() => setMaterialFilter(null)}
              className="mt-2 text-green-600 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCampaigns.map((campaign) => {
            // Get the first material type or "All" if it's an array
            const materialType = Array.isArray(campaign.materialTypes)
              ? campaign.materialTypes[0] || "All"
              : campaign.materialTypes || "All";

            const urgent = isUrgent(campaign.startDate);
            const progress = Math.min(
              Math.round((campaign.progress / campaign.goal) * 100),
              100
            );

            return (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                <div className="relative">
                  <img
                    src={
                      campaign.image?.url ||
                      "https://via.placeholder.com/300x150?text=Campaign+Image"
                    }
                    alt={campaign.name}
                    className="w-full h-40 object-cover"
                  />
                  {urgent && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      Urgent
                    </span>
                  )}
                  <div className="absolute top-2 left-2 bg-white p-2 rounded-full">
                    {getIconForMaterialType(materialType)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-bold text-gray-800 text-lg truncate mr-2">
                      {campaign.name}
                    </h2>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full capitalize">
                      {materialType}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {campaign.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500">
                        Ends: {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                      <span className="text-green-600 text-sm font-medium">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
