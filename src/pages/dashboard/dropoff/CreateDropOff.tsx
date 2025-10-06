/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import SimpleDropoffApi from "../../../api/simpleDropoffApi";
import CampaignApi from "../../../api/campaignApi";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { toast } from "react-toastify";
import DropOffApi from "../../../api/dropOffApi";
// Removed complex useDropoffSuccess hook for simple modal
import MaterialApi from "../../../api/materialApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DropoffMode, ISimpleDropoffLocation } from "../../../types";

// Enhanced Campaign interface to match the multi-location structure
export interface ICampaign {
  id: string;
  name: string;
  description: string;
  endDate?: string;
  startDate: string;
  isIndefinite?: boolean;
  materialTypes?: string[];
  status: string;
  material?: string;
  goal: number;
  progress: number;
  organizationName?: string;
  image?: {
    url: string;
  };
  itemType: string;
  locations?: Array<{
    simpleDropoffLocationId?: {
      _id: string;
      name: string;
      address: string;
      location?: {
        coordinates: [number, number];
      };
    };
    dropoffLocationId?: {
      _id: string;
      name: string;
      address: string;
      primaryMaterialType?: string;
      location?: {
        coordinates: [number, number];
      };
    };
    customLocation?: {
      coordinates: [number, number];
      address: string;
      name?: string;
    };
  }>;
  // Legacy fields for backward compatibility
  location?: {
    coordinates: [number, number];
  };
  address?: string;
  // Extended fields for expanded locations
  locationIndex?: number;
  specificLocation?: any;
}
import { motion } from "framer-motion";
import {
  MdLocationOn,
  MdCheckCircle,
  MdArrowForward,
  MdCameraAlt,
  MdCheckroom,
  MdClose,
  MdFlipCameraAndroid,
  MdArrowBack,
  MdRecycling, // Added for generic recycling
  MdCampaign, // Added for campaign icon
  MdExpandMore, // For accordion
  MdPlace, // For location pin
} from "react-icons/md";
import { FaBox, FaRecycle, FaWineBottle, FaTrashAlt } from "react-icons/fa"; // Added more icons
import { FaBottleWater } from "react-icons/fa6";
import { GiPaperBagFolded } from "react-icons/gi";

interface Location {
  type: string;
  coordinates: number[];
}

export interface DropoffPoint {
  googleMapId: string;
  location: Location;
  website?: string;
  locationType: string; // e.g., "dropoff", "pickup"
  _id: string;
  name: string;
  itemType: string;
  primaryMaterialType?: string;
  acceptedSubtypes?: string[];
  description: string;
  address: string;
  __v: number;
  distance?: string;
  numericDistance: number; // Ensure this is always calculated
  isTooFar: boolean; // Ensure this is always calculated
}

// Helper function to get an icon for a subtype
export const getIconForSubtype = (
  subtype: string,
  primaryType?: string
): JSX.Element => {
  const lowerSubtype = subtype.toLowerCase();
  const lowerPrimaryType = primaryType?.toLowerCase();

  if (lowerSubtype.includes("bottle") && lowerSubtype.includes("plastic"))
    return <FaBottleWater className="w-7 h-7 text-blue-500" />;
  if (
    lowerSubtype.includes("shirt") ||
    lowerSubtype.includes("fabric") ||
    lowerPrimaryType === "fabric"
  )
    return <MdCheckroom className="w-7 h-7 text-green-600" />;
  if (lowerSubtype.includes("glass") || lowerPrimaryType === "glass")
    return <FaWineBottle className="w-7 h-7 text-green-400" />;
  if (
    lowerSubtype.includes("can") ||
    lowerPrimaryType === "aluminium" ||
    lowerPrimaryType === "metal"
  )
    return <FaTrashAlt className="w-7 h-7 text-gray-500" />;
  if (lowerSubtype.includes("paper") || lowerPrimaryType === "paper")
    return <GiPaperBagFolded className="w-7 h-7 text-yellow-600" />;
  if (lowerSubtype.includes("bag") && lowerSubtype.includes("plastic"))
    return <FaRecycle className="w-7 h-7 text-blue-400" />;

  // Fallback to primary type or generic
  if (lowerPrimaryType === "plastic")
    return <FaRecycle className="w-7 h-7 text-blue-400" />;
  if (lowerPrimaryType === "ewaste")
    return <MdRecycling className="w-7 h-7 text-green-500" />;

  return <FaBox className="w-7 h-7 text-gray-400" />; // Default generic box
};

const CreateDropOff = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const campaignIdFromQuery = searchParams.get("campaignId") || "";
  const campaignNameFromQuery = searchParams.get("campaignName") || "";
  const typeFromQuery = searchParams.get("type") || "";
  const modeFromQuery = searchParams.get("mode") || "regular";
  const locationIdFromQuery = searchParams.get("locationId") || "";
  const campaignLocationIndexFromQuery =
    searchParams.get("campaignLocationIndex") || "";

  // Simple dropoff mode state
  const [dropoffMode, setDropoffMode] = useState<DropoffMode>(
    (modeFromQuery === "simple"
      ? "simple"
      : modeFromQuery === "campaign"
      ? "campaign"
      : "regular") as DropoffMode
  );
  const [simpleLocations, setSimpleLocations] = useState<
    ISimpleDropoffLocation[]
  >([]);
  const [selectedSimpleLocationId, setSelectedSimpleLocationId] = useState<
    string | null
  >(locationIdFromQuery || null);

  // Ref to access the selected location element for auto-scrolling
  const selectedLocationRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [detailedQuantities, setDetailedQuantities] = useState<{
    [key: string]: string;
  }>({});

  // Simple dropoff specific state
  const [simpleDropoffForm, setSimpleDropoffForm] = useState({
    description: "",
    itemCount: "1", // Changed to string for better UX when editing
  });

  // Campaign dropoff specific state
  const [campaignDropoffForm, setCampaignDropoffForm] = useState({
    itemCount: "1", // Using string like in simple mode
  });

  const [dropOffForm, setDropOffForm] = useState({
    description: "",
  });

  const [itemTypesForDisplay, setItemsForDisplay] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const itemTypeButtonsContainerRef = useRef<HTMLDivElement>(null);

  // Effect to fetch campaign details and select it when campaign ID is in URL
  useEffect(() => {
    if (modeFromQuery === "simple" && locationIdFromQuery) {
      setDropoffMode("simple");
      setSelectedSimpleLocationId(locationIdFromQuery);
      getNearestSimpleDropOffLocations();
    } else if (modeFromQuery === "simple") {
      setDropoffMode("simple");
      getNearestSimpleDropOffLocations();
    } else if (modeFromQuery === "campaign") {
      setDropoffMode("campaign");
      if (typeFromQuery) {
        fetchNearbyCampaigns(typeFromQuery);
      } else {
        fetchNearbyCampaigns();
      }
    }
  }, [modeFromQuery, locationIdFromQuery]);

  useEffect(() => {
    const fetchPrimaryMaterialTypes = async () => {
      // Consider a more specific loading state e.g., setLoadingCategories(true)
      try {
        const res = await MaterialApi.getMaterialsCategory();
        const primaryTypesFromServer = res.data.data.primaryTypes as string[];

        if (primaryTypesFromServer && primaryTypesFromServer.length > 0) {
          const newTypes = primaryTypesFromServer.map((type: string) => ({
            label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
            value: type.toLowerCase(),
          }));
          setItemsForDisplay(newTypes);

          if ((dropoffMode as string) === "regular") {
            const currentTypeIsValid =
              typeFromQuery &&
              newTypes.some((nt) => nt.value === typeFromQuery);
            if (!currentTypeIsValid && newTypes.length > 0) {
              const paramsToSet: {
                type: string;
                campaignId?: string;
                campaignName?: string;
                mode?: string;
              } = { type: newTypes[0].value };
              if (campaignIdFromQuery)
                paramsToSet.campaignId = campaignIdFromQuery;
              if (campaignNameFromQuery)
                paramsToSet.campaignName = campaignNameFromQuery;
              if ((dropoffMode as string) === "simple")
                paramsToSet.mode = "simple";
              setSearchParams(paramsToSet, { replace: true });
            }
          }
        } else {
          setItemsForDisplay([]);
          toast.info("No item categories found.");
        }
      } catch (err) {
        console.error("Failed to fetch primary material types:", err);
        toast.error("Could not load item types.");
        setItemsForDisplay([]);
      }
    };
    fetchPrimaryMaterialTypes();
  }, [
    setSearchParams,
    campaignIdFromQuery,
    campaignNameFromQuery,
    dropoffMode,
  ]);

  // This useEffect reacts to changes in typeFromQuery - only for regular mode
  useEffect(() => {
    if (
      (dropoffMode as string) === "regular" &&
      typeFromQuery &&
      itemTypesForDisplay.length > 0
    ) {
      const isValidType = itemTypesForDisplay.some(
        (item) => item.value === typeFromQuery
      );

      if (isValidType) {
        getNearestDropOffLocations(typeFromQuery); // This will also reset selectedLocationId, detailedQuantities, selectedSubtypeForLogging
        // Auto-scroll to the selected item type button
        if (itemTypeButtonsContainerRef.current) {
          const activeButton =
            itemTypeButtonsContainerRef.current.querySelector(
              `button[data-item-type-value="${typeFromQuery}"]`
            ) as HTMLElement;

          if (activeButton) {
            activeButton.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          }
        }
      } else {
        if (itemTypesForDisplay.length > 0) {
          const paramsToSet: {
            type: string;
            campaignId?: string;
            campaignName?: string;
            mode?: string;
          } = { type: itemTypesForDisplay[0].value };
          if (campaignIdFromQuery) paramsToSet.campaignId = campaignIdFromQuery;
          if (campaignNameFromQuery)
            paramsToSet.campaignName = campaignNameFromQuery;
          if ((dropoffMode as string) === "simple") paramsToSet.mode = "simple";
          setSearchParams(paramsToSet, { replace: true });
        }
      }
    } else if (
      (dropoffMode as string) === "regular" &&
      !typeFromQuery &&
      itemTypesForDisplay.length > 0
    ) {
      const paramsToSet: {
        type: string;
        campaignId?: string;
        campaignName?: string;
        mode?: string;
      } = { type: itemTypesForDisplay[0].value };
      if (campaignIdFromQuery) paramsToSet.campaignId = campaignIdFromQuery;
      if (campaignNameFromQuery)
        paramsToSet.campaignName = campaignNameFromQuery;
      if ((dropoffMode as string) === "simple") paramsToSet.mode = "simple";
      setSearchParams(paramsToSet, { replace: true });
    }
  }, [
    typeFromQuery,
    itemTypesForDisplay,
    setSearchParams,
    campaignIdFromQuery,
    campaignNameFromQuery,
    dropoffMode,
  ]);

  const handleItemTypeSelect = (itemValue: string) => {
    const paramsToSet: {
      type: string;
      campaignId?: string;
      campaignName?: string;
    } = { type: itemValue };
    if (campaignIdFromQuery) paramsToSet.campaignId = campaignIdFromQuery;
    if (campaignNameFromQuery) paramsToSet.campaignName = campaignNameFromQuery;
    setSearchParams(paramsToSet);
  };

  const handleQuantityChange = (subtypeId: string, value: string) => {
    setDetailedQuantities((prev) => {
      const updatedQuantities = { ...prev };
      const numericValue = parseInt(value, 10);
      if (!isNaN(numericValue) && numericValue > 0) {
        updatedQuantities[subtypeId] = value;
      } else if (value === "" || (numericValue === 0 && value !== "")) {
        // Allow clearing or explicit zero
        updatedQuantities[subtypeId] = value; // Store empty or "0" to allow user to clear
      } else {
        // If invalid (e.g. negative, non-numeric not handled by type="number" but good to be safe)
        // delete updatedQuantities[subtypeId]; // Or keep as is, input type="number" helps
      }
      return updatedQuantities;
    });
  };

  const handleDropOffFormSubmit = async (e: any) => {
    e.preventDefault();

    if (!file) return toast.error("Please capture a receipt image.");

    if ((dropoffMode as string) === "simple") {
      if (!selectedSimpleLocationId) {
        return toast.error("Please select a simple drop-off location.");
      }

      const itemCount = parseInt(simpleDropoffForm.itemCount);
      if (isNaN(itemCount) || itemCount <= 0) {
        return toast.error("Please enter a valid item count.");
      }

      setLoading(true);

      const selectedLocation = simpleLocations.find(
        (loc) => loc.id === selectedSimpleLocationId
      );

      const materialType =
        selectedLocation?.bulkMaterialTypes &&
        selectedLocation.bulkMaterialTypes.length > 0
          ? selectedLocation.bulkMaterialTypes[0] === "All"
            ? "plastic"
            : selectedLocation.bulkMaterialTypes[0]
          : "plastic";

      try {
        const userCoords = await getUserLocation();

        console.log("User coordinates:", userCoords);

        const selectedLocation = simpleLocations.find(
          (loc) => loc.id === selectedSimpleLocationId
        );
        console.log("Selected location:", selectedLocation);

        const submitData = {
          simpleDropOffLocationId: selectedSimpleLocationId,
          materialType: materialType,
          quantity: parseInt(simpleDropoffForm.itemCount) || 0,
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          proofPicture: file as File,
        };

        console.log("Final submit data:", {
          ...submitData,
          proofPicture: "[File object]",
        });

        const response = await SimpleDropoffApi.createSimpleDropoff(submitData);

        // Remove session storage
        sessionStorage.removeItem("pendingDropoff");
        sessionStorage.removeItem("pendingDropoffFile");

        // Find the selected location
        const selectedSimpleLocation = simpleLocations.find(
          (loc) => loc.id === selectedSimpleLocationId
        );

        // Calculate carbon units earned and navigate with success data
        const carbonUnitsEarned =
          response.data?.carbonUnits ||
          estimateCarbonUnits(
            selectedSimpleLocation?.bulkMaterialTypes?.[0] || "plastic",
            parseInt(simpleDropoffForm.itemCount)
          );

        // Store success data for homepage modal
        const successData = {
          carbonUnits: carbonUnitsEarned,
          materialType:
            selectedSimpleLocation?.bulkMaterialTypes?.[0] || "plastic",
          dropoffType: "simple",
        };

        sessionStorage.setItem("dropoffSuccess", JSON.stringify(successData));

        // Navigate immediately to home
        navigate("/home");
      } catch (error: any) {
        console.log(error);
        toast.error(
          "Error logging simple drop off: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    } else if ((dropoffMode as string) === "campaign") {
      // Campaign dropoff logic
      if (!selectedCampaign || selectedCampaignLocationIndex === null) {
        return toast.error("Please select a campaign location.");
      }

      // Check if itemCount is empty or not a valid number greater than 0
      const itemCount = parseInt(campaignDropoffForm.itemCount);
      if (isNaN(itemCount) || itemCount <= 0) {
        return toast.error("Please enter a valid item count.");
      }

      setLoading(true);

      try {
        const userCoords = await getUserLocation();

        // Get the primary material type from the campaign for the API
        const primaryMaterialType = selectedCampaign.materialTypes
          ? Array.isArray(selectedCampaign.materialTypes)
            ? typeof selectedCampaign.materialTypes[0] === "string"
              ? selectedCampaign.materialTypes[0]
              : selectedCampaign.materialTypes[0] || "plastic"
            : selectedCampaign.materialTypes
          : selectedCampaign.itemType || selectedCampaign.material || "plastic";

        // Get the selected location details
        const selectedLocation =
          selectedCampaign.locations?.[selectedCampaignLocationIndex];
        if (!selectedLocation) {
          return toast.error("Selected campaign location not found.");
        }

        // Create form data for submission
        const formData = new FormData();
        formData.append("materialType", primaryMaterialType);

        // Create a simple dropOffQuantity array with just one entry for the campaign
        const dropOffQuantityArray = [
          {
            materialType: primaryMaterialType,
            units: itemCount,
          },
        ];

        formData.append(
          "dropOffQuantity",
          JSON.stringify(dropOffQuantityArray)
        );
        formData.append("latitude", userCoords.latitude.toString());
        formData.append("longitude", userCoords.longitude.toString());
        formData.append(
          "description",
          dropOffForm.description || "Campaign dropoff"
        );
        formData.append("file", file as Blob);

        // Add campaign location information
        formData.append(
          "campaignLocationIndex",
          selectedCampaignLocationIndex.toString()
        );

        // Add specific location details based on type
        console.log("Selected Location Debug:", selectedLocation);
        console.log(
          "Simple Dropoff Location ID:",
          selectedLocation.simpleDropoffLocationId
        );

        if (selectedLocation.simpleDropoffLocationId) {
          const locationId =
            (selectedLocation.simpleDropoffLocationId as any).id ||
            selectedLocation.simpleDropoffLocationId._id;
          console.log("Simple Dropoff Location ID:", locationId);
          formData.append("locationId", locationId);
          formData.append("locationType", "simple");
          if (selectedLocation.simpleDropoffLocationId.location?.coordinates) {
            formData.append(
              "locationCoordinates",
              JSON.stringify(
                selectedLocation.simpleDropoffLocationId.location.coordinates
              )
            );
          }
        } else if (selectedLocation.dropoffLocationId) {
          const locationId =
            (selectedLocation.dropoffLocationId as any).id ||
            selectedLocation.dropoffLocationId._id;
          formData.append("locationId", locationId);
          formData.append("locationType", "centre");
          if (selectedLocation.dropoffLocationId.location?.coordinates) {
            formData.append(
              "locationCoordinates",
              JSON.stringify(
                selectedLocation.dropoffLocationId.location.coordinates
              )
            );
          }
        } else if (selectedLocation.customLocation) {
          formData.append("locationType", "custom");
          formData.append(
            "customLocationName",
            selectedLocation.customLocation.name || "Custom Location"
          );
          formData.append(
            "customLocationAddress",
            selectedLocation.customLocation.address
          );
          formData.append(
            "locationCoordinates",
            JSON.stringify(selectedLocation.customLocation.coordinates)
          );
        }
        formData.forEach((value, key) => {
          if (key === "file") {
            console.log(`${key}: [File object]`);
          } else {
            console.log(`${key}: ${value}`);
          }
        });

        // Use the campaign-specific API endpoint with the campaign ID
        const campaignResponse = await CampaignApi.createCampaignDropOff(
          selectedCampaign.id || selectedCampaign.id,
          formData
        );

        // Remove session storage
        sessionStorage.removeItem("pendingDropoff");
        sessionStorage.removeItem("pendingDropoffFile");

        // Store success data for homepage modal
        const totalCarbonUnits =
          campaignResponse.data?.data?.carbonUnits ||
          campaignResponse.data?.data?.pointsEarned ||
          campaignResponse.data?.carbonUnits ||
          campaignResponse.data?.pointsEarned ||
          calculateTotalCarbonUnits(detailedQuantities);
        console.log(
          "🚀 ~ handleDropOffFormSubmit ~ totalCarbonUnits:",
          totalCarbonUnits
        );

        const successData = {
          carbonUnits:
            totalCarbonUnits < 1
              ? Math.ceil(totalCarbonUnits * 10) / 10
              : Math.floor(totalCarbonUnits),
          materialType: typeFromQuery || "mixed",
          dropoffType: "campaign",
        };

        sessionStorage.setItem("dropoffSuccess", JSON.stringify(successData));

        // Navigate immediately to home
        navigate("/home");
      } catch (error: any) {
        console.error("Error submitting campaign drop off:", error);
        toast.error(
          "Error submitting campaign drop off: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    } else {
      // Regular dropoff logic
      if (!selectedLocationId)
        return toast.error("Please select a drop-off location.");
      if (!typeFromQuery) return toast.error("Primary item type is missing.");

      const dropOffQuantityArray = Object.entries(detailedQuantities)
        .map(([materialType, quantityString]) => {
          const units = parseInt(quantityString, 10);
          if (!isNaN(units) && units > 0) {
            return { materialType, units };
          }
          return null;
        })
        .filter((item) => item !== null) as {
        materialType: string;
        units: number;
      }[];

      if (dropOffQuantityArray.length === 0) {
        return toast.error(
          "Please enter a valid quantity for at least one item type."
        );
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("location", selectedLocationId);
      formData.append("itemType", typeFromQuery);
      formData.append("dropOffQuantity", JSON.stringify(dropOffQuantityArray));
      formData.append("description", dropOffForm.description);
      formData.append("file", file as Blob);
      if (campaignIdFromQuery)
        formData.append("campaignId", campaignIdFromQuery);

      formData.forEach((value, key) => {
        if (key === "file") {
          console.log(`${key}: [File object]`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });

      try {
        const regularResponse = await DropOffApi.addDropOff(formData);

        // Remove session storage
        sessionStorage.removeItem("pendingDropoff");
        sessionStorage.removeItem("pendingDropoffFile");

        // Store success data for homepage modal
        const totalCU =
          regularResponse.data?.carbonUnits ||
          calculateTotalCarbonUnits(detailedQuantities);

        const successData = {
          carbonUnits: totalCU,
          materialType: typeFromQuery || "mixed",
          dropoffType: "regular",
        };

        sessionStorage.setItem("dropoffSuccess", JSON.stringify(successData));

        // Navigate immediately to home
        navigate("/home");
      } catch (error: any) {
        console.log(error);
        toast.error(
          "Error creating drop off: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const [locations, setLocations] = useState<DropoffPoint[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<ICampaign | null>(
    null
  );
  const [nearbyCampaigns, setNearbyCampaigns] = useState<ICampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedCampaignLocationIndex, setSelectedCampaignLocationIndex] =
    useState<number | null>(null);
  // Expanded campaign locations - each location becomes a separate selectable item
  const [expandedCampaignLocations, setExpandedCampaignLocations] = useState<
    Array<{
      campaignId: string;
      campaignName: string;
      campaignDescription: string;
      campaignStatus: string;
      campaignMaterialTypes: string[];
      campaignGoal?: number;
      campaignProgress?: number;
      locationIndex: number;
      locationId: string;
      locationName: string;
      locationAddress: string;
      locationType: "simple" | "centre" | "custom";
      locationCoordinates?: [number, number];
    }>
  >([]);

  // Accordion state for campaign groups
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(
    new Set()
  );

  // Group expanded locations by campaign
  const groupedCampaignLocations = useMemo(() => {
    const groups: {
      [campaignId: string]: {
        campaign: {
          id: string;
          name: string;
          description: string;
          status: string;
          materialTypes: string[];
          goal?: number;
          progress?: number;
        };
        locations: typeof expandedCampaignLocations;
      };
    } = {};

    expandedCampaignLocations.forEach((location) => {
      if (!groups[location.campaignId]) {
        groups[location.campaignId] = {
          campaign: {
            id: location.campaignId,
            name: location.campaignName,
            description: location.campaignDescription,
            status: location.campaignStatus,
            materialTypes: location.campaignMaterialTypes,
            goal: location.campaignGoal,
            progress: location.campaignProgress,
          },
          locations: [],
        };
      }
      groups[location.campaignId].locations.push(location);
    });

    return groups;
  }, [expandedCampaignLocations]);

  // Toggle accordion
  const toggleCampaignExpansion = (campaignId: string) => {
    setExpandedCampaigns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  // Auto-expand accordion for pre-selected campaigns
  useEffect(() => {
    if (
      campaignIdFromQuery &&
      campaignLocationIndexFromQuery &&
      expandedCampaignLocations.length > 0 &&
      selectedCampaign?.id === campaignIdFromQuery
    ) {
      // Check if the selected campaign has multiple locations
      const campaignGroup = groupedCampaignLocations[campaignIdFromQuery];
      if (campaignGroup && campaignGroup.locations.length > 1) {
        // Only auto-expand if there are multiple locations to choose from
        setExpandedCampaigns((prev) => new Set([...prev, campaignIdFromQuery]));
      }
    }
  }, [
    campaignIdFromQuery,
    campaignLocationIndexFromQuery,
    expandedCampaignLocations,
    selectedCampaign,
    groupedCampaignLocations,
  ]);

  // Fetch nearby campaigns based on user's location and material type
  const fetchNearbyCampaigns = useCallback(
    async (materialType?: string) => {
      setLoadingCampaigns(true);
      setNearbyCampaigns([]);
      setExpandedCampaignLocations([]);

      try {
        const userCoords = await getUserLocation();

        // Fetch nearby campaigns using the CampaignApi.getNearbyCampaigns method
        const response = await CampaignApi.getNearbyCampaigns(
          userCoords.latitude,
          userCoords.longitude,
          50000, // 50km radius
          materialType || undefined
        );

        if (response.data && response.data.data) {
          const campaigns = response.data.data;
          setNearbyCampaigns(campaigns);

          // Expand each campaign's locations into separate selectable items
          const expandedLocations: Array<{
            campaignId: string;
            campaignName: string;
            campaignDescription: string;
            campaignStatus: string;
            campaignMaterialTypes: string[];
            campaignGoal?: number;
            campaignProgress?: number;
            locationIndex: number;
            locationId: string;
            locationName: string;
            locationAddress: string;
            locationType: "simple" | "centre" | "custom";
            locationCoordinates?: [number, number];
          }> = [];

          campaigns.forEach((campaign) => {
            if (campaign.locations && campaign.locations.length > 0) {
              // Each location becomes a separate item
              campaign.locations.forEach((location, index) => {
                let locationId = "";
                let locationName = "";
                let locationAddress = "";
                let locationType: "simple" | "centre" | "custom" = "custom";
                let locationCoordinates: [number, number] | undefined;

                if (location.simpleDropoffLocationId) {
                  locationId = location.simpleDropoffLocationId._id;
                  locationName = location.simpleDropoffLocationId.name;
                  locationAddress = location.simpleDropoffLocationId.address;
                  locationType = "simple";
                  locationCoordinates =
                    location.simpleDropoffLocationId.location?.coordinates;
                } else if (location.dropoffLocationId) {
                  locationId = location.dropoffLocationId._id;
                  locationName = location.dropoffLocationId.name;
                  locationAddress = location.dropoffLocationId.address;
                  locationType = "centre";
                  locationCoordinates =
                    location.dropoffLocationId.location?.coordinates;
                } else if (location.customLocation) {
                  locationId = `custom_${campaign.id}_${index}`;
                  locationName =
                    location.customLocation.name || "Custom Location";
                  locationAddress = location.customLocation.address;
                  locationType = "custom";
                  locationCoordinates = location.customLocation.coordinates;
                }

                expandedLocations.push({
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  campaignDescription: campaign.description,
                  campaignStatus: campaign.status,
                  campaignMaterialTypes: Array.isArray(campaign.materialTypes)
                    ? campaign.materialTypes
                    : campaign.materialTypes
                    ? [campaign.materialTypes]
                    : [campaign.material || campaign.itemType || "Mixed"],
                  campaignGoal: campaign.goal,
                  campaignProgress: campaign.progress,
                  locationIndex: index,
                  locationId,
                  locationName,
                  locationAddress,
                  locationType,
                  locationCoordinates,
                });
              });
            } else {
              // Legacy campaign without specific locations
              expandedLocations.push({
                campaignId: campaign.id,
                campaignName: campaign.name,
                campaignDescription: campaign.description,
                campaignStatus: campaign.status,
                campaignMaterialTypes: Array.isArray(campaign.materialTypes)
                  ? campaign.materialTypes
                  : campaign.materialTypes
                  ? [campaign.materialTypes]
                  : [campaign.material || campaign.itemType || "Mixed"],
                campaignGoal: campaign.goal,
                campaignProgress: campaign.progress,
                locationIndex: 0,
                locationId: "legacy",
                locationName: "Campaign Location",
                locationAddress: campaign.address || "Location to be confirmed",
                locationType: "custom",
                locationCoordinates: campaign.location?.coordinates,
              });
            }
          });

          setExpandedCampaignLocations(expandedLocations);

          // Handle pre-selection from URL
          if (campaignIdFromQuery && campaignLocationIndexFromQuery) {
            const targetLocation = expandedLocations.find(
              (loc) =>
                loc.campaignId === campaignIdFromQuery &&
                loc.locationIndex === parseInt(campaignLocationIndexFromQuery)
            );
            if (targetLocation) {
              const targetCampaign = campaigns.find(
                (c) => c.id === campaignIdFromQuery
              );
              if (targetCampaign) {
                setSelectedCampaign(targetCampaign);
                setSelectedCampaignLocationIndex(
                  parseInt(campaignLocationIndexFromQuery)
                );
                // Auto-expand the accordion for the pre-selected campaign
                setExpandedCampaigns(new Set([campaignIdFromQuery]));
              }
            }
          }
        } else {
          setNearbyCampaigns([]);
          setExpandedCampaignLocations([]);
        }
      } catch (error) {
        console.error("Error fetching nearby campaigns:", error);
        toast.error("Could not load nearby campaigns");
        setNearbyCampaigns([]);
        setExpandedCampaignLocations([]);
      } finally {
        setLoadingCampaigns(false);
      }
    },
    [campaignIdFromQuery, campaignLocationIndexFromQuery]
  );

  // Handle expanded location selection (replaces handleCampaignLocationSelect)
  const handleExpandedLocationSelect = (expandedLocation: {
    campaignId: string;
    campaignName: string;
    campaignDescription: string;
    campaignStatus: string;
    campaignMaterialTypes: string[];
    campaignGoal?: number;
    campaignProgress?: number;
    locationIndex: number;
    locationId: string;
    locationName: string;
    locationAddress: string;
    locationType: "simple" | "centre" | "custom";
    locationCoordinates?: [number, number];
  }) => {
    // Find the original campaign
    const originalCampaign = nearbyCampaigns.find(
      (c) => c.id === expandedLocation.campaignId
    );
    if (originalCampaign) {
      setSelectedCampaign(originalCampaign);
      setSelectedCampaignLocationIndex(expandedLocation.locationIndex);

      // Update URL with the selected campaign and location
      const paramsToSet: {
        mode: string;
        campaignId: string;
        campaignName: string;
        campaignLocationIndex: string;
        type?: string;
      } = {
        mode: "campaign",
        campaignId: expandedLocation.campaignId,
        campaignName: expandedLocation.campaignName,
        campaignLocationIndex: expandedLocation.locationIndex.toString(),
      };

      // Add material type
      if (expandedLocation.campaignMaterialTypes.length > 0) {
        paramsToSet.type =
          expandedLocation.campaignMaterialTypes[0].toLowerCase();
      }

      setSearchParams(paramsToSet);
    }
  };

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

  const getNearestDropOffLocations = async (itemTypeValue = typeFromQuery) => {
    if (!itemTypeValue) return;
    setLoadingLocations(true);
    setSelectedLocationId(null);
    setDetailedQuantities({});
    setLocations([]);

    try {
      const userCoords = await getUserLocation();
      const baseApiParams = {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        distance: 0,
        itemType: itemTypeValue,
      };

      let fetchedLocationsData = (
        await dropOffLocationApi.getNearestDropOffLocations(baseApiParams)
      ).data.data;

      if (fetchedLocationsData.length === 0 && baseApiParams.distance === 0) {
        toast.info("No locations found nearby. Expanding search to 300km...");
        const expandedApiParams = { ...baseApiParams, distance: 300000 };
        fetchedLocationsData = (
          await dropOffLocationApi.getNearestDropOffLocations(expandedApiParams)
        ).data.data;
      }

      const relevantLocations = fetchedLocationsData.filter(
        (loc: any): loc is DropoffPoint => {
          // Type guard for stricter typing
          const locPrimaryType = (
            loc.primaryMaterialType || loc.itemType
          )?.toLowerCase();
          const matchesPrimaryType =
            locPrimaryType === itemTypeValue.toLowerCase();
          const hasAcceptedSubtypes =
            loc.acceptedSubtypes && loc.acceptedSubtypes.length > 0;
          return (
            matchesPrimaryType &&
            hasAcceptedSubtypes &&
            loc.location &&
            loc.location.coordinates &&
            loc.location.coordinates.length === 2
          );
        }
      );

      const MAX_DISTANCE_KM = 500; // Adjust as needed

      const locationsWithDistanceProcessing = relevantLocations
        .map((loc: DropoffPoint) => {
          // Ensure coordinates exist before calculating distance
          const longitude = loc.location.coordinates[0];
          const latitude = loc.location.coordinates[1];
          const distanceKm = calculateHaversineDistance(
            userCoords.latitude,
            userCoords.longitude,
            latitude,
            longitude
          );
          return {
            ...loc,
            numericDistance: distanceKm,
            distance: `${distanceKm.toFixed(1)} km`,
            isTooFar: distanceKm > MAX_DISTANCE_KM,
          };
        })
        .sort((a, b) => a.numericDistance - b.numericDistance);
      setLocations(locationsWithDistanceProcessing);

      if (locationsWithDistanceProcessing.length > 0) {
        const firstSelectableLocation = locationsWithDistanceProcessing.find(
          (loc) => !loc.isTooFar
        );
        if (firstSelectableLocation) {
          setSelectedLocationId(firstSelectableLocation._id);
        } else {
          // No locations within the MAX_DISTANCE_KM
          toast.info(
            `All found locations for ${itemTypeValue} are further than ${MAX_DISTANCE_KM}km.`
          );
        }
      } else {
        toast.info(
          `No drop-off locations found that accept specific ${itemTypeValue} items, even within 300km.`
        );
      }
    } catch (error: any) {
      console.error("Error fetching locations:", error);
      toast.error(
        "Error fetching locations: " + (error.message || "Unknown error")
      );
    } finally {
      setLoadingLocations(false);
    }
  };

  // Effect to auto-scroll to selected location after it's rendered
  useEffect(() => {
    // Timeout gives DOM time to render and position elements correctly
    const scrollTimeout = setTimeout(() => {
      if (selectedLocationRef.current) {
        selectedLocationRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300); // Short delay to ensure DOM is ready

    return () => clearTimeout(scrollTimeout);
  }, [
    selectedSimpleLocationId,
    selectedLocationId,
    simpleLocations.length,
    locations.length,
  ]);

  // Fetch simple dropoff locations - always sorted by proximity, not material type
  const getNearestSimpleDropOffLocations = async () => {
    setLoadingLocations(true);
    // Don't clear the selected location ID here, we'll handle it after fetching
    setSimpleLocations([]);

    try {
      const userCoords = await getUserLocation();

      const response = await SimpleDropoffApi.getNearbyLocations({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        radius: 50000, // 50km radius
        limit: 50,
      });

      const fetchedSimpleLocations = response.data.data || [];

      // Calculate distances and sort by proximity
      const locationsWithDistance = fetchedSimpleLocations
        .map((loc: ISimpleDropoffLocation) => {
          const distanceKm = calculateHaversineDistance(
            userCoords.latitude,
            userCoords.longitude,
            loc.location.coordinates[1],
            loc.location.coordinates[0]
          );
          return {
            ...loc,
            distance: distanceKm,
          };
        })
        .sort((a, b) => a.distance - b.distance);

      setSimpleLocations(locationsWithDistance);

      // Check if we should restore a pre-selected location or use the closest one
      if (locationsWithDistance.length > 0) {
        const currentSelection =
          selectedSimpleLocationId || locationIdFromQuery;

        if (currentSelection) {
          // Check if the pre-selected location is in the fetched locations
          const preSelectedExists = locationsWithDistance.some(
            (loc) => loc.id === currentSelection
          );
          if (preSelectedExists) {
            // Keep the pre-selected location
            setSelectedSimpleLocationId(currentSelection);
          } else {
            // Pre-selected location not found, use closest one as fallback
            const closestLocation = locationsWithDistance[0];
            setSelectedSimpleLocationId(closestLocation.id);
            // Optional: Inform the user their selected location was not found
            toast.info(
              "Selected location not found, showing closest location instead."
            );
          }
        } else {
          // No pre-selection, use closest location
          const closestLocation = locationsWithDistance[0];
          setSelectedSimpleLocationId(closestLocation.id);
        }
      } else {
        toast.info("No simple drop-off locations found nearby.");
      }
    } catch (error: any) {
      console.error("Error fetching simple locations:", error);
      toast.error(
        "Error fetching simple locations: " + (error.message || "Unknown error")
      );
    } finally {
      setLoadingLocations(false);
    }
  };

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  // Video recording states for simple dropoffs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [maxRecordingTime] = useState(10); // 10 seconds max

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordingTimerRef = useRef<number | null>(null);

  // Cleanup object URL and video stream
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [previewUrl, videoStream]);

  // Update the startCamera function to ensure it properly initializes with fallback constraints
  const startCamera = async (mode: "user" | "environment") => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }

    try {
      // Try with ideal constraints first
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      let stream;
      try {
        // First attempt with ideal constraints
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.log("Ideal constraints failed, trying with basic constraints");
        // Fallback to basic constraints if ideal fails
        constraints = {
          video: {
            facingMode: mode,
          },
        } as MediaStreamConstraints;
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      setVideoStream(stream);
      setIsCameraOpen(true);

      // Wait for the component to update and video element to be available
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Force video to load
        videoRef.current.load();

        // Try to play immediately
        try {
          await videoRef.current.play();
          console.log("Video started playing successfully");
        } catch (playError) {
          console.log("Immediate play failed, waiting for loadedmetadata");
          // Fallback to waiting for metadata if immediate play fails
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              console.log("Video started playing after metadata loaded");
            } catch (e) {
              console.error("Error playing video after metadata:", e);
            }
          };
        }

        // Additional fallback - try play after a short delay
        setTimeout(async () => {
          if (videoRef.current && videoRef.current.paused) {
            try {
              await videoRef.current.play();
              console.log("Video started playing after timeout");
            } catch (e) {
              console.error("Error playing video after timeout:", e);
            }
          }
        }, 100);
      }

      setPreviewUrl(null);
      setFile(null);
    } catch (err) {
      console.error("Error accessing camera:", err);

      // Final fallback - try any available camera
      try {
        console.log("Falling back to any available camera");
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        setVideoStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .catch((e) => console.error("Error playing fallback video:", e));
          };
        }

        setIsCameraOpen(true);
        return;
      } catch (fallbackErr) {
        console.error("All camera access attempts failed:", fallbackErr);
        toast.error("Could not access camera. Please check permissions.");
        setIsCameraOpen(false);
      }
    }
  };

  const handleOpenCamera = () => {
    setFacingMode("environment");
    startCamera("environment");
  };

  const handleSwitchCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && videoStream) {
      const videoNode = videoRef.current;
      const canvasNode = canvasRef.current;
      // Set canvas dimensions to video stream's actual dimensions
      const trackSettings = videoStream.getVideoTracks()[0].getSettings();
      canvasNode.width = trackSettings.width || videoNode.videoWidth;
      canvasNode.height = trackSettings.height || videoNode.videoHeight;

      const context = canvasNode.getContext("2d");
      if (context) {
        context.drawImage(videoNode, 0, 0, canvasNode.width, canvasNode.height);
        canvasNode.toBlob(
          (blob) => {
            if (blob) {
              const capturedFile = new File(
                [blob],
                `receipt-${Date.now()}.jpg`,
                {
                  type: "image/jpeg",
                }
              );
              setFile(capturedFile);
              setPreviewUrl(URL.createObjectURL(capturedFile));
            }
            closeCamera();
          },
          "image/jpeg",
          0.95
        );
      }
    }
  };

  const closeCamera = () => {
    // Stop any ongoing recording
    if (isRecording) {
      stopVideoRecording();
    }

    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
    setVideoStream(null);
    setRecordingDuration(0);
  };

  const retakePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    handleOpenCamera();
  };

  // Video recording functions for simple dropoffs
  const startVideoRecording = () => {
    if (!videoStream) {
      toast.error("Camera not available for recording");
      return;
    }

    try {
      const options = {
        mimeType: 'video/mp4; codecs="avc1.424028, mp4a.40.2"',
        videoBitsPerSecond: 1000000, // 1 Mbps for good quality but reasonable file size
      };

      // Fallback for browsers that don't support the preferred codec
      let recorder;
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(videoStream, options);
      } else {
        // Try webm format as fallback
        const webmOptions = {
          mimeType: 'video/webm; codecs="vp8, vorbis"',
          videoBitsPerSecond: 1000000,
        };
        if (MediaRecorder.isTypeSupported(webmOptions.mimeType)) {
          recorder = new MediaRecorder(videoStream, webmOptions);
        } else {
          // Use default without specifying codec
          recorder = new MediaRecorder(videoStream);
        }
      }

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, {
          type: recorder.mimeType || "video/mp4",
        });

        const videoFile = new File(
          [videoBlob],
          `dropoff-video-${Date.now()}.mp4`,
          { type: videoBlob.type }
        );

        setFile(videoFile);
        setPreviewUrl(URL.createObjectURL(videoBlob));
        closeCamera();
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event);
        toast.error("Error occurred during recording");
        stopVideoRecording();
      };

      setMediaRecorder(recorder);
      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= maxRecordingTime - 1) {
            stopVideoRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Auto-stop after max time
      setTimeout(() => {
        if (recorder && recorder.state === "recording") {
          stopVideoRecording();
        }
      }, maxRecordingTime * 1000);
    } catch (error) {
      console.error("Error starting video recording:", error);
      toast.error("Failed to start video recording");
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecording(false);
    setMediaRecorder(null);
  };

  const retakeVideo = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setRecordingDuration(0);
    handleOpenCamera();
  };

  // Restore from session storage
  useEffect(() => {
    const pendingDropoffRaw = sessionStorage.getItem("pendingDropoff");
    if (localUser && localUser.isAuthenticated && pendingDropoffRaw) {
      try {
        const pendingData = JSON.parse(pendingDropoffRaw);
        // Restore basic form data, but avoid restoring file or complex states like selected location directly
        // as data might be stale. User should re-select location and re-capture image.
        if (pendingData.typeFromQuery)
          setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("type", pendingData.typeFromQuery);
            if (pendingData.campaignId)
              newParams.set("campaignId", pendingData.campaignId);
            if (pendingData.campaignName)
              newParams.set("campaignName", pendingData.campaignName);
            return newParams;
          });
        if (pendingData.description)
          setDropOffForm((prev) => ({
            ...prev,
            description: pendingData.description,
          }));

        toast.info(
          "Some of your previous dropoff information has been restored. Please re-select location and receipt."
        );
        sessionStorage.removeItem("pendingDropoff");
        sessionStorage.removeItem("pendingDropoffFile");
      } catch (error) {
        console.error("Error restoring dropoff data:", error);
        sessionStorage.removeItem("pendingDropoff");
        sessionStorage.removeItem("pendingDropoffFile");
      }
    }
  }, [localUser, setSearchParams]);

  const currentSubItems = useMemo(() => {
    // For campaign mode
    if ((dropoffMode as string) === "campaign" && selectedCampaign) {
      // Use campaign itemType or material as the primary type
      const campaignItemType =
        selectedCampaign.itemType || selectedCampaign.material || "plastic";

      // If we don't have specific subtypes for the campaign, create a default one
      return [
        {
          id: campaignItemType.toLowerCase(),
          name:
            campaignItemType.charAt(0).toUpperCase() +
            campaignItemType.slice(1),
          icon: getIconForSubtype(
            campaignItemType.toLowerCase(),
            campaignItemType
          ),
          unit: campaignItemType.toLowerCase().includes("bottle")
            ? "bottles"
            : "items",
        },
      ];
    }

    // For regular mode
    if (!selectedLocationId) return [];
    const selectedLocation = locations.find(
      (loc) => loc._id === selectedLocationId
    );
    if (
      selectedLocation &&
      selectedLocation.acceptedSubtypes &&
      selectedLocation.acceptedSubtypes.length > 0
    ) {
      return selectedLocation.acceptedSubtypes.map((subtype) => ({
        id: subtype, // The subtype string itself is the ID
        name: subtype.charAt(0).toUpperCase() + subtype.slice(1), // Capitalize for display
        icon: getIconForSubtype(
          subtype,
          selectedLocation.primaryMaterialType || typeFromQuery
        ),
        unit: subtype.toLowerCase().includes("bottle") ? "bottles" : "items", // Basic unit inference
      }));
    }
    return [];
  }, [
    selectedLocationId,
    locations,
    typeFromQuery,
    dropoffMode,
    selectedCampaign,
  ]);

  // Calculate if any valid quantity has been entered for enabling submit button
  const hasValidQuantities = useMemo(() => {
    if ((dropoffMode as string) === "simple") {
      const itemCount = parseInt(simpleDropoffForm.itemCount);
      return selectedSimpleLocationId && !isNaN(itemCount) && itemCount > 0;
    } else if ((dropoffMode as string) === "campaign") {
      // For campaign mode, check if we have a valid quantity and a selected campaign
      const itemCount = parseInt(campaignDropoffForm.itemCount);
      return selectedCampaign && !isNaN(itemCount) && itemCount > 0;
    } else {
      // For regular mode
      return (
        selectedLocationId &&
        Object.values(detailedQuantities).some((q) => parseInt(q, 10) > 0)
      );
    }
  }, [
    detailedQuantities,
    dropoffMode,
    selectedSimpleLocationId,
    simpleDropoffForm.itemCount,
    selectedCampaign,
    selectedLocationId,
  ]);

  // Fetch nearby campaigns when in campaign mode
  useEffect(() => {
    if (dropoffMode === "campaign" && !campaignIdFromQuery) {
      // If no specific campaign ID is provided, fetch nearby campaigns
      fetchNearbyCampaigns(typeFromQuery);
    }
  }, [dropoffMode, typeFromQuery, campaignIdFromQuery, fetchNearbyCampaigns]);

  // Helper function to estimate carbon units
  const estimateCarbonUnits = (
    materialType: string,
    quantity: number
  ): number => {
    // Basic estimation - replace with actual calculation logic
    const baseValues: { [key: string]: number } = {
      plastic: 0.5,
      organic: 0.1,
      fabric: 0.4,
      glass: 0.3,
      paper: 0.2,
      metal: 0.6,
      ewaste: 1.0,
      aluminium: 0.6,
    };

    return (baseValues[materialType] || 0.3) * (quantity / 2); // Using server formula
  };

  // Helper function to calculate total carbon units from quantity values
  const calculateTotalCarbonUnits = (quantityValues: {
    [key: string]: string;
  }): number => {
    let total = 0;
    Object.entries(quantityValues).forEach(([materialType, quantity]) => {
      const numQuantity = parseInt(quantity, 10);
      if (numQuantity > 0) {
        total += estimateCarbonUnits(materialType, numQuantity);
      }
    });
    return total;
  };

  return (
    <div className="pb-20 px-4 max-w-md mx-auto">
      {localUser && (
        <button
          onClick={() => navigate("/home")}
          className="mb-5 mt-3 inline-flex items-center text-sm text-slate-600 hover:text-green-700 font-medium transition-colors group"
        >
          <MdArrowBack className="mr-2 transition-transform group-hover:-translate-x-1 h-5 w-5" />
          Back
        </button>
      )}

      {/* Dropoff Mode Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-0.5 max-w-xs mx-auto border border-gray-200">
          <button
            onClick={() => {
              setDropoffMode("regular");
              // Update URL params
              const paramsToSet: {
                mode?: string;
                type?: string;
                campaignId?: string;
                campaignName?: string;
              } = {};
              if (typeFromQuery) paramsToSet.type = typeFromQuery;
              if (campaignIdFromQuery)
                paramsToSet.campaignId = campaignIdFromQuery;
              if (campaignNameFromQuery)
                paramsToSet.campaignName = campaignNameFromQuery;
              setSearchParams(paramsToSet);
              // Fetch regular locations if we have a type
              if (typeFromQuery) {
                getNearestDropOffLocations(typeFromQuery);
              }
              // Clear campaign form data
              setCampaignDropoffForm({ itemCount: "1" });
            }}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              dropoffMode === "regular"
                ? "bg-white text-gray-800 shadow-sm border border-gray-200"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Regular
          </button>
          <button
            onClick={() => {
              setDropoffMode("simple");
              const paramsToSet: {
                mode: string;
              } = { mode: "simple" };
              setSearchParams(paramsToSet);
              getNearestSimpleDropOffLocations();
              setCampaignDropoffForm({ itemCount: "1" });
            }}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              dropoffMode === "simple"
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Quick Drop
          </button>
          <button
            onClick={() => {
              setDropoffMode("campaign");
              // Update URL params
              const paramsToSet: {
                mode: string;
                campaignId?: string;
                campaignName?: string;
              } = { mode: "campaign" };
              if (campaignIdFromQuery)
                paramsToSet.campaignId = campaignIdFromQuery;
              if (campaignNameFromQuery)
                paramsToSet.campaignName = campaignNameFromQuery;
              setSearchParams(paramsToSet);

              // Fetch nearby campaigns when toggling to campaign mode
              if (!campaignIdFromQuery) {
                fetchNearbyCampaigns(typeFromQuery);
              }
            }}
            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              dropoffMode === "campaign"
                ? "bg-green-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Campaign
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-1.5">
          {dropoffMode === "simple"
            ? "Single items with photo verification"
            : dropoffMode === "campaign"
            ? "Participate in recycling campaigns for bonus rewards"
            : "Bulk items at recycling centers"}
        </p>
      </div>

      {/* Item Type Selection - Only for Regular Mode */}
      {(dropoffMode as string) === "regular" && (
        <div
          ref={itemTypeButtonsContainerRef}
          className="flex space-x-2 my-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {itemTypesForDisplay.length === 0 &&
            !loadingLocations && ( // Check loadingLocations too
              <p className="text-sm text-slate-500">No item types available.</p>
            )}
          {itemTypesForDisplay.map((item) => (
            <button
              key={item.value}
              data-item-type-value={item.value}
              onClick={() => handleItemTypeSelect(item.value)}
              className={`px-6 py-3 text-sm font-semibold rounded-full transition-colors whitespace-nowrap
                ${
                  typeFromQuery === item.value
                    ? "bg-black text-white"
                    : "bg-gray-100 text-slate-700 border border-gray-300 hover:bg-gray-200"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleDropOffFormSubmit}>
        {/* Campaign Details Section - Only visible in campaign mode */}
        {(dropoffMode as string) === "campaign" && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-md font-semibold underline text-slate-700">
                Select Campaign
              </h2>
              <button
                type="button"
                onClick={() => fetchNearbyCampaigns(typeFromQuery)}
                disabled={loadingCampaigns}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-opacity disabled:opacity-50"
              >
                <MdLocationOn className="mr-1.5" />
                {loadingCampaigns ? "Searching..." : "Find Campaigns"}
              </button>
            </div>

            {loadingCampaigns && (
              <p className="text-center text-gray-500 py-4">
                Finding campaigns...
              </p>
            )}

            {!loadingCampaigns &&
              Object.keys(groupedCampaignLocations).length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <MdCampaign className="mx-auto text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium mb-2">
                      No Active Campaigns Found
                    </p>
                    <p className="text-sm text-gray-500">
                      No campaigns are currently active in your area. Try
                      adjusting your material type or create a regular drop-off.
                    </p>
                  </div>
                </div>
              )}

            {!loadingCampaigns &&
              Object.keys(groupedCampaignLocations).length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-2">
                    {Object.entries(groupedCampaignLocations).map(
                      ([campaignId, group]) => {
                        const isExpanded = expandedCampaigns.has(campaignId);
                        const hasMultipleLocations = group.locations.length > 1;

                        return (
                          <motion.div
                            key={campaignId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                          >
                            {/* Campaign Header */}
                            <div
                              className={`p-4 cursor-pointer transition-colors ${
                                hasMultipleLocations ? "hover:bg-gray-50" : ""
                              }`}
                              onClick={() => {
                                if (hasMultipleLocations) {
                                  toggleCampaignExpansion(campaignId);
                                } else {
                                  // Single location - select directly
                                  handleExpandedLocationSelect(
                                    group.locations[0]
                                  );
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                                      <MdCampaign className="text-green-700 text-lg" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900 text-lg">
                                        {group.campaign.name}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1"></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Expand/Select Button */}
                                <div className="ml-3">
                                  {hasMultipleLocations ? (
                                    <motion.div
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                      <MdExpandMore className="text-gray-500 text-xl" />
                                    </motion.div>
                                  ) : (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                      <MdCheckCircle className="text-sm" />
                                      Select
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Locations List - Only show if expanded and has multiple locations */}
                            {hasMultipleLocations && (
                              <motion.div
                                initial={false}
                                animate={{
                                  height: isExpanded ? "auto" : 0,
                                  opacity: isExpanded ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.3,
                                  ease: "easeInOut",
                                }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-gray-100 bg-gray-50">
                                  <div className="p-4 space-y-3">
                                    <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                      <MdPlace className="text-gray-500" />
                                      Choose Location
                                    </h5>
                                    {group.locations.map((location, index) => (
                                      <motion.div
                                        key={`${location.campaignId}_${location.locationIndex}_${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleExpandedLocationSelect(
                                            location
                                          );
                                        }}
                                        className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                                          selectedCampaign?.id ===
                                            location.campaignId &&
                                          selectedCampaignLocationIndex ===
                                            location.locationIndex
                                            ? "bg-green-50 border-green-500 ring-2 ring-green-200"
                                            : "bg-white border-gray-200 hover:border-green-300 hover:bg-green-25"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <MdPlace className="text-green-600 text-sm" />
                                              <h6 className="font-medium text-gray-800 text-sm">
                                                {location.locationName}
                                              </h6>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                              {location.locationAddress}
                                            </p>
                                          </div>
                                          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MdArrowForward className="text-green-600 text-sm" />
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Drop-Off Locations Section - Only for regular and simple modes */}
        {dropoffMode !== "campaign" && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-md font-semibold underline text-slate-700">
                {(dropoffMode as string) === "simple"
                  ? "Select nearby location"
                  : "Select dropoff location"}
              </h2>
              <button
                type="button"
                onClick={() =>
                  (dropoffMode as string) === "simple"
                    ? getNearestSimpleDropOffLocations()
                    : getNearestDropOffLocations()
                }
                disabled={
                  loadingLocations ||
                  ((dropoffMode as string) === "regular" && !typeFromQuery)
                }
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-opacity disabled:opacity-50"
              >
                <MdLocationOn className="mr-1.5" />
                {loadingLocations ? "Locating..." : "Find Locations"}
              </button>
            </div>

            {loadingLocations && ( // Show loading indicator more consistently
              <p className="text-center text-gray-500 py-4">
                Finding locations...
              </p>
            )}

            {/* Regular Mode Locations */}
            {(dropoffMode as string) === "regular" && (
              <>
                {!loadingLocations &&
                  locations.length === 0 &&
                  typeFromQuery && (
                    <p className="text-center text-gray-500 py-4 bg-gray-50 rounded-md">
                      No locations found for "{typeFromQuery}" that accept
                      specific items. Try another primary type or check back
                      later.
                    </p>
                  )}
                {!typeFromQuery && !loadingLocations && (
                  <p className="text-center text-gray-500 py-4 bg-gray-50 rounded-md">
                    Please select an item type above to see available locations.
                  </p>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-1">
                  {locations.map((loc) => (
                    <div
                      key={loc._id}
                      ref={
                        selectedLocationId === loc._id
                          ? selectedLocationRef
                          : null
                      }
                      onClick={() => {
                        if (!loc.isTooFar) {
                          setSelectedLocationId(loc._id);
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all
                      ${
                        selectedLocationId === loc._id && !loc.isTooFar
                          ? "bg-teal-50 border-teal-500 ring-2 ring-teal-500 cursor-pointer"
                          : loc.isTooFar
                          ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-white border-gray-200 hover:border-gray-400 cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {loc.name}
                          </p>
                          <p className="text-xs text-gray-500">{loc.address}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Accepts: {loc.primaryMaterialType || loc.itemType}
                          </p>
                          {loc.acceptedSubtypes &&
                            loc.acceptedSubtypes.length > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Specific items:{" "}
                                {loc.acceptedSubtypes.slice(0, 3).join(", ")}
                                {loc.acceptedSubtypes.length > 3 ? "..." : ""}
                              </p>
                            )}
                          {loc.distance && (
                            <p
                              className={`text-xs mt-0.5 ${
                                loc.isTooFar ? "text-red-500" : "text-green-600"
                              }`}
                            >
                              {loc.distance} away
                              {loc.isTooFar && " (Too far)"}
                            </p>
                          )}
                        </div>
                        {selectedLocationId === loc._id && !loc.isTooFar && (
                          <MdCheckCircle className="text-green-600 text-2xl flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Simple Mode Locations */}
            {(dropoffMode as string) === "simple" && (
              <>
                {!loadingLocations && simpleLocations.length === 0 && (
                  <p className="text-center text-gray-500 py-4 bg-orange-50 rounded-md">
                    No simple drop-off locations found nearby. Try refreshing or
                    check back later.
                  </p>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-1">
                  {simpleLocations.map((loc) => (
                    <div
                      key={loc.id}
                      ref={
                        selectedSimpleLocationId === loc.id
                          ? selectedLocationRef
                          : null
                      }
                      onClick={() => {
                        // Toggle selection: deselect if already selected, select if different location
                        if (selectedSimpleLocationId === loc.id) {
                          setSelectedSimpleLocationId(null); // Deselect current location
                        } else {
                          setSelectedSimpleLocationId(loc.id); // Select new location
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer
                      ${
                        selectedSimpleLocationId === loc.id
                          ? "bg-orange-50 border-orange-500 ring-2 ring-orange-500"
                          : "bg-white border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {loc.name}
                          </p>
                          <p className="text-xs text-gray-500">{loc.address}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Material:{" "}
                            {loc.bulkMaterialTypes &&
                            loc.bulkMaterialTypes.length > 0
                              ? loc.bulkMaterialTypes.length === 1 &&
                                loc.bulkMaterialTypes[0] === "All"
                                ? "All Materials"
                                : loc.bulkMaterialTypes.map((type, index) => (
                                    <span key={type}>
                                      {type === "All"
                                        ? "All Materials"
                                        : type.charAt(0).toUpperCase() +
                                          type.slice(1)}
                                      {index < loc.bulkMaterialTypes!.length - 1
                                        ? ", "
                                        : ""}
                                    </span>
                                  ))
                              : "No materials listed"}
                          </p>
                          {loc.distance !== undefined && (
                            <p className="text-xs text-orange-600 mt-0.5">
                              {loc.distance.toFixed(1)} km away
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          {selectedSimpleLocationId === loc.id && (
                            <MdCheckCircle className="text-orange-500 text-2xl flex-shrink-0 ml-2" />
                          )}
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 mt-1">
                            {getIconForSubtype(
                              loc.bulkMaterialTypes &&
                                loc.bulkMaterialTypes.length > 0
                                ? loc.bulkMaterialTypes[0] === "All"
                                  ? "plastic"
                                  : loc.bulkMaterialTypes[0]
                                : "plastic"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Quantity Input Section - Different for each mode */}
        {(dropoffMode as string) === "regular" &&
          selectedLocationId &&
          currentSubItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-md font-semibold text-slate-700 mb-3">
                How many items were recycled at the selected location?
                <p className="text-xs text-gray-500 font-normal">
                  Enter quantities for items you dropped off.
                </p>
              </h2>
              <div className="space-y-4">
                {currentSubItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-opacity duration-300"
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded bg-white p-1 shadow-sm">
                        {item.icon}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-slate-600">{item.name}</p>
                        <input
                          type="number"
                          placeholder={`Quantity of ${item.unit}`}
                          min="0"
                          value={detailedQuantities[item.id] || ""}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Campaign Quantity Input Section */}
        {(dropoffMode as string) === "campaign" && selectedCampaign && (
          <div className="mb-6">
            <h2 className="text-md font-semibold text-slate-800 mb-3">
              Contribution Details
              <p className="text-xs text-gray-600 font-normal mt-1">
                How many items are you contributing to this campaign?
              </p>
            </h2>
            <div className="p-3 bg-green-50 rounded-lg ">
              <label className="block text-sm font-medium text-slate-800 mb-2">
                Number of Items
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={campaignDropoffForm.itemCount}
                onChange={(e) => {
                  // Allow empty string or valid numbers
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    setCampaignDropoffForm((prev) => ({
                      ...prev,
                      itemCount: value,
                    }));
                  }
                }}
                className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-slate-500 focus:border-green-500 text-sm bg-slate-50/50"
                placeholder="Enter number of items"
              />
            </div>
          </div>
        )}

        {/* No Sub-items Message - Regular Mode */}
        {(dropoffMode as string) === "regular" &&
          selectedLocationId &&
          currentSubItems.length === 0 && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
              The selected location does not have specific item types listed for
              individual quantity entry. You can still log a general drop-off if
              applicable, or contact support if this seems incorrect.
            </div>
          )}

        {/* No Sub-items Message - Campaign Mode */}
        {(dropoffMode as string) === "campaign" &&
          selectedCampaign &&
          currentSubItems.length === 0 && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
              This campaign does not have specific item types listed. Please
              contact the campaign organizer for more information.
            </div>
          )}

        {/* Simple dropoff form */}
        {(dropoffMode as string) === "simple" && selectedSimpleLocationId && (
          <div className="mb-6">
            <h2 className="text-md font-semibold text-slate-700 mb-3">
              Quick Drop Details
              <p className="text-xs text-gray-500 font-normal">
                Log your single item drop-off.
              </p>
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Items
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={simpleDropoffForm.itemCount}
                  onChange={(e) => {
                    // Allow empty string or valid numbers
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      setSimpleDropoffForm((prev) => ({
                        ...prev,
                        itemCount: value,
                      }));
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Enter number of items"
                />
              </div>

              <div className="hidden p-3 bg-orange-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={simpleDropoffForm.description}
                  onChange={(e) =>
                    setSimpleDropoffForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Any additional details about your drop-off..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Description field for regular mode */}
        {(dropoffMode as string) === "regular" && (
          <div className="hidden mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Description (Optional)
            </label>
            <textarea
              rows={3}
              value={dropOffForm.description}
              onChange={(e) =>
                setDropOffForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Any additional details about your drop-off..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        )}

        <div className="mb-8">
          <h2
            className={`text-md font-semibold mb-3 ${
              dropoffMode === "campaign" ? "text-green-800" : "text-slate-700"
            }`}
          >
            {dropoffMode === "simple"
              ? "Record verification video"
              : dropoffMode === "campaign"
              ? "Take proof photo"
              : "Confirm your drop-off"}
          </h2>
          {dropoffMode === "simple" && (
            <p className="text-sm text-gray-600 mb-3">
              Please take a photo as proof of your campaign contribution.
            </p>
          )}
          {!isCameraOpen && (
            <div
              className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-4 cursor-pointer ${
                dropoffMode === "campaign"
                  ? "border-green-300 hover:border-green-400 bg-green-50/50"
                  : dropoffMode === "simple"
                  ? "border-orange-300 hover:border-orange-400 bg-orange-50/50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50"
              }`}
              onClick={
                previewUrl
                  ? dropoffMode === "simple"
                    ? retakeVideo
                    : retakePhoto
                  : handleOpenCamera
              }
            >
              {previewUrl ? (
                <>
                  {file?.type.startsWith("video/") ? (
                    // Video preview for simple dropoffs
                    <video
                      src={previewUrl}
                      controls
                      muted
                      className="max-h-full max-w-full object-contain rounded-md"
                      style={{ maxHeight: "300px" }}
                    />
                  ) : (
                    // Image preview for regular dropoffs
                    <img
                      src={previewUrl}
                      alt={
                        dropoffMode === "simple"
                          ? "Dropoff video preview"
                          : "Receipt preview"
                      }
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                  )}
                  <span className="mt-2 text-xs text-blue-600 font-medium">
                    Tap to retake
                  </span>
                </>
              ) : (
                <>
                  <MdCameraAlt className="text-4xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    {dropoffMode === "simple"
                      ? "Record Dropoff Video"
                      : "Take Receipt Photo"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dropoffMode === "simple"
                      ? "Record a 10-second video of you dropping the item"
                      : "Tap here to open camera"}
                  </p>
                </>
              )}
            </div>
          )}

          {isCameraOpen && (
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
                }}
              />
              <canvas ref={canvasRef} className="hidden"></canvas>

              {/* Recording Progress Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 right-4 z-20">
                  <div className="bg-red-500 text-white p-3 rounded-lg text-center">
                    <p className="text-sm font-bold">RECORDING</p>
                    <div className="w-full bg-red-300 rounded-full h-2 mt-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${
                            (recordingDuration / maxRecordingTime) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mt-1">
                      {recordingDuration}s / {maxRecordingTime}s
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-10">
                <motion.button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
                  aria-label="Switch camera"
                >
                  <MdFlipCameraAndroid size={24} />
                </motion.button>

                {/* Capture/Recording Button - Different for simple vs regular mode */}
                {dropoffMode === "simple" ? (
                  // Video recording button for simple dropoffs
                  <div className="flex flex-col items-center">
                    {isRecording && (
                      <div className="mb-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {recordingDuration}s / {maxRecordingTime}s
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={
                        isRecording ? stopVideoRecording : startVideoRecording
                      }
                      className={`p-4 text-white rounded-full ring-2 ring-white shadow-lg ${
                        isRecording
                          ? "bg-red-600 hover:bg-red-700 animate-pulse"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                      aria-label={
                        isRecording ? "Stop recording" : "Start recording"
                      }
                      title={isRecording ? "Stop Recording" : "Start Recording"}
                    >
                      {isRecording ? (
                        <div className="w-7 h-7 bg-white rounded"></div>
                      ) : (
                        <div className="w-7 h-7 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </button>
                  </div>
                ) : (
                  // Photo capture button for regular dropoffs
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="p-4 bg-red-500 text-white rounded-full ring-2 ring-white hover:bg-red-600 shadow-lg"
                    aria-label="Capture receipt photo"
                    title="Capture Receipt"
                  >
                    <MdCameraAlt size={28} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeCamera}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
                  aria-label="Close camera"
                >
                  <MdClose size={24} />
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            loadingLocations ||
            !file ||
            !hasValidQuantities ||
            ((dropoffMode as string) === "campaign" && !selectedCampaign)
          }
          className={`w-full font-semibold py-4 px-6 rounded-full flex items-center justify-center text-lg transition-all shadow-md disabled:opacity-60 disabled:shadow-none ${
            (dropoffMode as string) === "simple"
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : (dropoffMode as string) === "campaign"
              ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
              : "bg-slate-800 hover:bg-slate-900 text-white"
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            <>
              {(dropoffMode as string) === "campaign"
                ? "Submit Campaign Contribution"
                : "Submit Drop-off"}
              <MdArrowForward className="ml-2 text-xl" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
};

export default CreateDropOff;
