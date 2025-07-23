import { useEffect, useState, useCallback } from "react";
import CampaignApi from "../../../api/campaignApi";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DropoffMode, ICampaign } from "../../../types";
import { useCampaignSelection } from "./useCampaignSelection";

/**
 * This is a simplified version of CreateDropOff that demonstrates
 * how to implement the campaign selection enhancements.
 */
const CreateDropOffUpdates = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignIdFromQuery = searchParams.get("campaignId") || "";
  const typeFromQuery = searchParams.get("type") || "";
  const modeFromQuery = searchParams.get("mode") || "regular";

  // Mode state with campaign mode handling
  const [dropoffMode, setDropoffMode] = useState<DropoffMode>(
    (modeFromQuery === "simple"
      ? "simple"
      : modeFromQuery === "campaign"
      ? "campaign"
      : "regular") as DropoffMode
  );

  // Campaign state
  const [selectedCampaign, setSelectedCampaign] = useState<ICampaign | null>(
    null
  );
  const [nearbyCampaigns, setNearbyCampaigns] = useState<ICampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Use the campaign selection hook to get refs and handlers
  const { getCampaignClassName, getRefForCampaign } = useCampaignSelection({
    campaignIdFromQuery,
    setDropoffMode: (mode: string) => setDropoffMode(mode as DropoffMode),
    setSelectedCampaign,
  });

  // Fetch nearby campaigns based on user's location and material type
  const fetchNearbyCampaigns = useCallback(
    async (materialType?: string) => {
      setLoadingCampaigns(true);
      setNearbyCampaigns([]);

      try {
        const userCoords = await getUserLocation();

        // Fetch nearby campaigns
        const response = await CampaignApi.getNearbyCampaigns(
          userCoords.latitude,
          userCoords.longitude,
          50000, // 50km radius
          materialType || undefined
        );

        if (response.data && response.data.data) {
          setNearbyCampaigns(response.data.data);

          // If we found campaigns and none is selected yet, select the first one
          if (
            response.data.data.length > 0 &&
            !selectedCampaign &&
            !campaignIdFromQuery
          ) {
            setSelectedCampaign(response.data.data[0]);
          }
        } else {
          setNearbyCampaigns([]);
        }
      } catch (error) {
        console.error("Error fetching nearby campaigns:", error);
        toast.error("Could not load nearby campaigns");
        setNearbyCampaigns([]);
      } finally {
        setLoadingCampaigns(false);
      }
    },
    [campaignIdFromQuery, selectedCampaign]
  );

  // Helper function to get user location
  const getUserLocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        (error) => reject(error)
      );
    });
  };

  // Handle campaign selection
  const handleCampaignSelect = (campaign: ICampaign) => {
    // Update URL with the selected campaign ID and name
    const paramsToSet: {
      mode: string;
      campaignId: string;
      campaignName: string;
      type?: string;
    } = {
      mode: "campaign",
      campaignId: campaign.id,
      campaignName: campaign.name,
    };

    // If there's a material type from the campaign, use it
    if (
      campaign.materialTypes &&
      Array.isArray(campaign.materialTypes) &&
      campaign.materialTypes.length > 0
    ) {
      paramsToSet.type = campaign.materialTypes[0].toLowerCase();
    } else if (
      campaign.materialTypes &&
      typeof campaign.materialTypes === "string"
    ) {
      paramsToSet.type = campaign.materialTypes.toLowerCase();
    } else if (campaign.material) {
      paramsToSet.type = campaign.material.toLowerCase();
    } else if (campaign.itemType) {
      paramsToSet.type = campaign.itemType.toLowerCase();
    } else if (typeFromQuery) {
      paramsToSet.type = typeFromQuery;
    }

    setSearchParams(paramsToSet);
  };

  // Fetch nearby campaigns when in campaign mode
  useEffect(() => {
    if (dropoffMode === "campaign" && !campaignIdFromQuery) {
      // If no specific campaign ID is provided, fetch nearby campaigns
      fetchNearbyCampaigns(typeFromQuery);
    }
  }, [dropoffMode, typeFromQuery, campaignIdFromQuery, fetchNearbyCampaigns]);

  // Render the campaign selection list
  const renderCampaigns = () => {
    if (loadingCampaigns) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading campaigns...</p>
        </div>
      );
    }

    if (nearbyCampaigns.length === 0) {
      return (
        <div className="text-center py-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">No campaigns found nearby.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-1">
        {nearbyCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            // Use the ref helper function from the hook
            ref={getRefForCampaign(campaign, selectedCampaign)}
            onClick={(e) => {
              e.preventDefault(); // Prevent event bubbling
              // Immediately set the selected campaign
              setSelectedCampaign(campaign);
              // Then update URL params and other state
              handleCampaignSelect(campaign);
            }}
            // Use the className helper function from the hook
            className={getCampaignClassName(campaign, selectedCampaign)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                    {campaign.status}
                  </span>
                  {campaign.materialTypes && (
                    <span className="text-xs text-gray-500">
                      {Array.isArray(campaign.materialTypes)
                        ? campaign.materialTypes.join(", ")
                        : campaign.materialTypes ||
                          campaign.material ||
                          campaign.itemType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {campaign.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simple demo UI that shows just the campaign section
  return (
    <div className="pb-20 px-4 max-w-md mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">CreateDropOff Updates Demo</h1>
        <p className="text-gray-600">
          This demonstrates the campaign selection with auto-scrolling to the
          selected campaign.
        </p>
      </div>

      {/* Campaign section */}
      {(dropoffMode as string) === "campaign" && (
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-lg mb-3">Select Campaign</h2>
          {renderCampaigns()}
        </div>
      )}

      {/* Display current selection */}
      {selectedCampaign && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
          <h2 className="font-semibold text-lg mb-2">Selected Campaign</h2>
          <div>
            <p>
              <strong>Name:</strong> {selectedCampaign.name}
            </p>
            <p>
              <strong>ID:</strong> {selectedCampaign.id}
            </p>
            <p>
              <strong>Material:</strong>{" "}
              {Array.isArray(selectedCampaign.materialTypes)
                ? selectedCampaign.materialTypes.join(", ")
                : selectedCampaign.materialTypes ||
                  selectedCampaign.material ||
                  "N/A"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDropOffUpdates;
