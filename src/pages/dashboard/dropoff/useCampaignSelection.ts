/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import CampaignApi from "../../../api/campaignApi";

/**
 * This is a helper module with functions to enhance campaign selection
 * in the CreateDropOff component. Import these functions into your
 * CreateDropOff component to implement seamless campaign selection.
 */

/**
 * Sets up the campaign selection enhancements
 * @param props Configuration options for campaign selection
 * @returns Configuration object with refs and handlers
 */
export const useCampaignSelection = (props: {
  campaignIdFromQuery: string;
  setDropoffMode: (mode: string) => void;
  setSelectedCampaign: (campaign: any) => void;
}) => {
  const { campaignIdFromQuery, setDropoffMode, setSelectedCampaign } = props;

  // Ref for the selected campaign card for scrolling
  const selectedCampaignRef = useRef<HTMLDivElement>(null);

  // Fetch campaign details when ID is provided - only once
  useEffect(() => {
    const fetchCampaignDetails = async () => {
      if (!campaignIdFromQuery) return;

      try {
        // Force campaign mode if campaign ID is provided
        setDropoffMode("campaign");

        // Add a cache check to prevent repeated calls
        const cachedCampaign = sessionStorage.getItem(
          `campaign_${campaignIdFromQuery}`
        );
        if (cachedCampaign) {
          setSelectedCampaign(JSON.parse(cachedCampaign));
          return;
        }

        const response = await CampaignApi.getCampaign(campaignIdFromQuery);
        if (response.data && response.data.data) {
          setSelectedCampaign(response.data.data);
          // Cache the campaign data
          sessionStorage.setItem(
            `campaign_${campaignIdFromQuery}`,
            JSON.stringify(response.data.data)
          );
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        toast.error("Could not load campaign information");
      }
    };

    if (campaignIdFromQuery) {
      fetchCampaignDetails();
    }
  }, []);

  // Scroll to selected campaign when it changes
  const scrollToSelectedCampaign = useRef<boolean>(false);

  // Effect to scroll to the selected campaign when it is set
  useEffect(() => {
    // Only execute scroll effect when selectedCampaignRef is set
    const scrollTimer = setTimeout(() => {
      if (selectedCampaignRef.current && !scrollToSelectedCampaign.current) {
        selectedCampaignRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        scrollToSelectedCampaign.current = true;
      }
    }, 500); // Slightly longer delay to ensure DOM is fully rendered

    return () => clearTimeout(scrollTimer);
  }, []);

  return {
    selectedCampaignRef,
    getCampaignClassName: (campaign: any, selectedCampaign: any) => {
      // Ensure consistent ID comparison
      const campaignId = campaign._id || campaign.id;
      const selectedId = selectedCampaign?._id || selectedCampaign?.id;

      return `p-3 rounded-lg border cursor-pointer transition-all ${
        selectedCampaign &&
        (campaignId === selectedId || campaignId === campaignIdFromQuery)
          ? "border-green-500 bg-green-50 ring-2 ring-green-500"
          : "border-gray-200 hover:border-green-300 hover:bg-green-50"
      }`;
    },
    getRefForCampaign: (campaign: any, selectedCampaign: any) => {
      // Ensure consistent ID comparison
      const campaignId = campaign._id || campaign.id;
      const selectedId = selectedCampaign?._id || selectedCampaign?.id;

      // Set ref if this campaign matches the selected one or the one from query params
      if (
        (selectedCampaign && campaignId === selectedId) ||
        campaignId === campaignIdFromQuery
      ) {
        // When we find the matching campaign, reset the scroll flag to allow scrolling
        scrollToSelectedCampaign.current = false;
        return selectedCampaignRef;
      }
      return null;
    },
  };
};

/**
 * Example usage in the CreateDropOff component:
 *
 * const { selectedCampaignRef, getCampaignClassName, getRefForCampaign } =
 *   useCampaignSelection({
 *     campaignIdFromQuery,
 *     setDropoffMode,
 *     setSelectedCampaign
 *   });
 *
 * Then in the campaign rendering:
 * <div
 *   key={campaign.id}
 *   ref={getRefForCampaign(campaign, selectedCampaign)}
 *   className={getCampaignClassName(campaign, selectedCampaign)}
 *   onClick={() => {
 *     setSelectedCampaign(campaign);
 *     handleCampaignSelect(campaign);
 *   }}
 * >
 */
