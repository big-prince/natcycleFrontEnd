/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useMemo } from "react";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { toast } from "react-toastify";
import DropOffApi from "../../../api/dropOffApi";
import MaterialApi from "../../../api/materialApi";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    return <MdRecycling className="w-7 h-7 text-purple-500" />;

  return <FaBox className="w-7 h-7 text-gray-400" />; // Default generic box
};

const CreateDropOff = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignIdFromQuery = searchParams.get("campaignId") || "";
  const campaignNameFromQuery = searchParams.get("campaignName") || "";
  const typeFromQuery = searchParams.get("type") || "";

  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [detailedQuantities, setDetailedQuantities] = useState<{
    [key: string]: string;
  }>({});

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

  // Effect to fetch primary material types for the filter buttons and set initial type
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

          const currentTypeIsValid =
            typeFromQuery && newTypes.some((nt) => nt.value === typeFromQuery);
          if (!currentTypeIsValid && newTypes.length > 0) {
            const paramsToSet: {
              type: string;
              campaignId?: string;
              campaignName?: string;
            } = { type: newTypes[0].value };
            if (campaignIdFromQuery)
              paramsToSet.campaignId = campaignIdFromQuery;
            if (campaignNameFromQuery)
              paramsToSet.campaignName = campaignNameFromQuery;
            setSearchParams(paramsToSet, { replace: true });
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
  }, [setSearchParams, campaignIdFromQuery, campaignNameFromQuery]);

  // This useEffect reacts to changes in typeFromQuery
  useEffect(() => {
    if (typeFromQuery && itemTypesForDisplay.length > 0) {
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
          } = { type: itemTypesForDisplay[0].value };
          if (campaignIdFromQuery) paramsToSet.campaignId = campaignIdFromQuery;
          if (campaignNameFromQuery)
            paramsToSet.campaignName = campaignNameFromQuery;
          setSearchParams(paramsToSet, { replace: true });
        }
      }
    } else if (!typeFromQuery && itemTypesForDisplay.length > 0) {
      const paramsToSet: {
        type: string;
        campaignId?: string;
        campaignName?: string;
      } = { type: itemTypesForDisplay[0].value };
      if (campaignIdFromQuery) paramsToSet.campaignId = campaignIdFromQuery;
      if (campaignNameFromQuery)
        paramsToSet.campaignName = campaignNameFromQuery;
      setSearchParams(paramsToSet, { replace: true });
    }
  }, [
    typeFromQuery,
    itemTypesForDisplay,
    setSearchParams,
    campaignIdFromQuery,
    campaignNameFromQuery,
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
    // getNearestDropOffLocations will be called by the useEffect watching typeFromQuery,
    // which will also reset selectedLocationId and detailedQuantities.
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

    if (!selectedLocationId)
      return toast.error("Please select a drop-off location.");
    if (!file) return toast.error("Please capture a receipt image.");
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
    if (campaignIdFromQuery) formData.append("campaignId", campaignIdFromQuery);

    console.log("Submitting Drop Off Data:");
    formData.forEach((value, key) => {
      if (key === "file") {
        console.log(`${key}: [File object]`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });

    DropOffApi.addDropOff(formData)
      .then(() => {
        toast.success("Drop off created successfully");
        sessionStorage.removeItem("pendingDropoff"); // Clear any pending data
        sessionStorage.removeItem("pendingDropoffFile");
        navigate("/home");
      })
      .catch((error) => {
        console.log(error);
        toast.error(
          "Error creating drop off: " +
            (error.response?.data?.message || error.message)
        );
      })
      .finally(() => setLoading(false));
  };

  const [locations, setLocations] = useState<DropoffPoint[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

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

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup object URL and video stream
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewUrl, videoStream]);

  // Update the startCamera function to ensure it properly initializes with the environment camera
  const startCamera = async (mode: "user" | "environment") => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    try {
      // Be more specific with constraints to ensure the rear camera is selected
      const constraints = {
        video: {
          facingMode: { exact: mode }, // Use 'exact' to be more specific
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays when ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch((e) => console.error("Error playing video:", e));
        };
      }

      setIsCameraOpen(true);
      setPreviewUrl(null);
      setFile(null);
    } catch (err) {
      console.error("Error accessing camera:", err);

      // If exact constraint fails, fall back to a simpler request
      if (mode === "environment") {
        try {
          console.log("Falling back to simpler camera request");
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true, // Just
          });

          setVideoStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current
                ?.play()
                .catch((e) =>
                  console.error("Error playing fallback video:", e)
                );
            };
          }

          setIsCameraOpen(true);
          return;
        } catch (fallbackErr) {
          console.error("Fallback camera access also failed:", fallbackErr);
        }
      }

      toast.error("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  // Update the handleOpenCamera function to explicitly use "environment" mode first
  const handleOpenCamera = () => {
    // Always start with environment (rear) camera regardless of facingMode state
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
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
    setVideoStream(null);
  };

  const retakePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
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
        sessionStorage.removeItem("pendingDropoff"); // Clear after attempting restore
        sessionStorage.removeItem("pendingDropoffFile");
      } catch (error) {
        console.error("Error restoring dropoff data:", error);
        sessionStorage.removeItem("pendingDropoff"); // Clear if corrupt
        sessionStorage.removeItem("pendingDropoffFile");
      }
    }
  }, [localUser, setSearchParams]);

  const currentSubItems = useMemo(() => {
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
  }, [selectedLocationId, locations, typeFromQuery]);

  // Calculate if any valid quantity has been entered for enabling submit button
  const hasValidQuantities = useMemo(() => {
    return Object.values(detailedQuantities).some((q) => parseInt(q, 10) > 0);
  }, [detailedQuantities]);

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
      {/* Campaign Info */}
      {campaignNameFromQuery && campaignIdFromQuery && (
        <div className="mb-4 p-3 bg-indigo-600 text-white rounded-lg text-center">
          Supporting Campaign: <strong>{campaignNameFromQuery}</strong>
        </div>
      )}
      <form onSubmit={handleDropOffFormSubmit}>
        {/* Drop-Off Locations Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-semibold underline text-slate-700">
              Select dropoff location
            </h2>
            <button
              type="button"
              onClick={() => getNearestDropOffLocations()}
              disabled={loadingLocations || !typeFromQuery}
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
          {!loadingLocations && locations.length === 0 && typeFromQuery && (
            <p className="text-center text-gray-500 py-4 bg-gray-50 rounded-md">
              No locations found for "{typeFromQuery}" that accept specific
              items. Try another primary type or check back later.
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
                onClick={() => {
                  if (!loc.isTooFar) {
                    setSelectedLocationId(loc._id);
                    // setDetailedQuantities({}); // This is now handled by useEffect on selectedLocationId change
                  }
                }}
                className={`p-3 rounded-lg border transition-all
                  ${
                    selectedLocationId === loc._id && !loc.isTooFar
                      ? "bg-teal-50 border-teal-500 ring-2 ring-teal-500 cursor-pointer"
                      : loc.isTooFar
                      ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed" // Faded and not allowed
                      : "bg-white border-gray-200 hover:border-gray-400 cursor-pointer"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{loc.name}</p>
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
                    {loc.distance && ( // loc.distance should always be present now
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
        </div>

        {/* Quantity Input Section - Dynamic based on selected location */}
        {selectedLocationId && currentSubItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-md font-semibold text-slate-700 mb-3">
              How many items were recycled at the selected location?
              <p className="text-xs text-gray-500 font-normal">
                Enter quantities for items you dropped off.
              </p>
            </h2>
            <div className="space-y-4">
              {currentSubItems.map((item) => {
                // const isInactive = selectedSubtypeForLogging !== null && selectedSubtypeForLogging !== item.id; // Remove this logic
                return (
                  <div
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-opacity duration-300`} // Removed inactive class logic
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded bg-white p-1 shadow-sm">
                      {item.icon}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-slate-600">{item.name}</p>
                      <input
                        type="number"
                        placeholder={`Quantity of ${item.unit}`}
                        min="0" // Allow 0 for clearing, validation handles submission
                        value={detailedQuantities[item.id] || ""}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        // disabled={isInactive} // Remove disabled logic
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {selectedLocationId && currentSubItems.length === 0 && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
            The selected location does not have specific item types listed for
            individual quantity entry. You can still log a general drop-off if
            applicable, or contact support if this seems incorrect.
            {/* Consider if a generic quantity input should appear here if no subtypes */}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-md font-semibold text-slate-700 mb-3">
            Confirm your drop-off
          </h2>
          {!isCameraOpen && (
            <div
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-gray-400 bg-gray-50"
              onClick={previewUrl ? retakePhoto : handleOpenCamera}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="max-h-full max-w-full object-contain rounded-md"
                  />
                  <span className="mt-2 text-xs text-blue-600 font-medium">
                    Tap to retake
                  </span>
                </>
              ) : (
                <>
                  <MdCameraAlt className="text-4xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Take Receipt Photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tap here to open camera
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
                className="w-full h-full object-cover"
                style={{
                  transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
                }}
              />
              <canvas ref={canvasRef} className="hidden"></canvas>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-10">
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
                  aria-label="Switch camera"
                >
                  <MdFlipCameraAndroid size={24} />
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="p-4 bg-red-500 text-white rounded-full ring-2 ring-white hover:bg-red-600 shadow-lg"
                  aria-label="Capture photo"
                >
                  <MdCameraAlt size={28} />
                </button>
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
          disabled={loading || loadingLocations || !file || !hasValidQuantities} // Updated disabled condition
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center text-lg transition-opacity disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Drop-off"}
          {!loading && <MdArrowForward className="ml-2 text-xl" />}
        </button>
      </form>
    </div>
  );
};

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

export default CreateDropOff;
