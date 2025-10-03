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
  endDate?: string;
  startDate: string;
  isIndefinite?: boolean;
  materialTypes?: string[];
  status: string;
  material?: string;
  goal: number;
  progress: number;
  image?: {
    url: string;
  };
  itemType: string;
  locations?: Array<{
    simpleDropoffLocationId?: {
      _id: string;
      name: string;
      address: string;
      materialType?: string;
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
  // Legacy field for backward compatibility
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

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<
    number | null
  >(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearestLocationIndex, setNearestLocationIndex] = useState<
    number | null
  >(null);

  const fetchCampaign = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await CampaignApi.getCampaign(id);
      const campaignData = res.data.data.campaign;

      setCampaign(campaignData);

      // Calculate percentage with proper null checks
      const currentProgress = campaignData.progress || 0;
      const goalAmount = campaignData.goal || 1; // Avoid division by zero
      const calculatedPercentage = Math.min(
        Math.round((currentProgress / goalAmount) * 100),
        100
      );

      setPercentage(isNaN(calculatedPercentage) ? 0 : calculatedPercentage);
      setLoading(false);
    } catch (err) {
      toast.error("Error loading campaign details");
      setLoading(false);
    }
  }, [id]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationError(null);
        },
        () => {
          const errorMessage =
            "Unable to get your location. No nearest location will be shown.";
          setLocationError(errorMessage);
          toast.info(errorMessage, {
            position: "top-center",
            autoClose: 3000,
          });
        }
      );
    } else {
      const errorMessage = "Geolocation is not supported by this browser.";
      setLocationError(errorMessage);
      toast.info(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, []);

  // Helper function to get coordinates from any location type
  const getLocationCoordinates = (
    location: NonNullable<ICampaign["locations"]>[0]
  ): { lat: number; lng: number } | null => {
    // Custom location coordinates
    if (location.customLocation && location.customLocation.coordinates) {
      return {
        lat: location.customLocation.coordinates[1],
        lng: location.customLocation.coordinates[0],
      };
    }

    // Simple dropoff location coordinates
    if (location.simpleDropoffLocationId) {
      if (
        location.simpleDropoffLocationId.location &&
        location.simpleDropoffLocationId.location.coordinates &&
        Array.isArray(location.simpleDropoffLocationId.location.coordinates) &&
        location.simpleDropoffLocationId.location.coordinates.length >= 2
      ) {
        const coords = location.simpleDropoffLocationId.location.coordinates;
        return {
          lat: coords[1],
          lng: coords[0],
        };
      }
    }

    // Dropoff location coordinates
    if (location.dropoffLocationId) {
      if (
        location.dropoffLocationId.location &&
        location.dropoffLocationId.location.coordinates &&
        Array.isArray(location.dropoffLocationId.location.coordinates) &&
        location.dropoffLocationId.location.coordinates.length >= 2
      ) {
        const coords = location.dropoffLocationId.location.coordinates;
        return {
          lat: coords[1],
          lng: coords[0],
        };
      }
    }

    return null;
  };

  // Auto-select nearest location when campaign and user location are loaded
  useEffect(() => {
    if (campaign && campaign.locations && campaign.locations.length > 0) {
      if (userLocation) {
        let nearestIndex = 0;
        let shortestDistance = Infinity;

        campaign.locations.forEach((location, index) => {
          const locationCoords = getLocationCoordinates(location);

          if (locationCoords) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              locationCoords.lat,
              locationCoords.lng
            );

            if (distance < shortestDistance) {
              shortestDistance = distance;
              nearestIndex = index;
            }
          }
        });

        setNearestLocationIndex(nearestIndex);
        setSelectedLocationIndex(nearestIndex); // Auto-select the nearest
      } else {
        // If no user location, select the first location
        setNearestLocationIndex(null);
        setSelectedLocationIndex(0);
      }
    }
  }, [campaign, userLocation]);

  useEffect(() => {
    fetchCampaign();
  }, [id, fetchCampaign]);

  const handleRecycleNowClick = () => {
    if (!campaign) return;

    // Properly store selected recyclables for compatibility
    const item = [campaign.material];
    localStorage.setItem("selectedRecyclables", JSON.stringify(item));

    // Include selected location information if available
    let locationParam = "";
    if (
      selectedLocationIndex !== null &&
      campaign.locations &&
      campaign.locations[selectedLocationIndex]
    ) {
      const selectedLocation = campaign.locations[selectedLocationIndex];
      if (selectedLocation.simpleDropoffLocationId) {
        locationParam = `&campaignLocationIndex=${selectedLocationIndex}`;
      } else if (selectedLocation.dropoffLocationId) {
        locationParam = `&campaignLocationIndex=${selectedLocationIndex}`;
      } else if (selectedLocation.customLocation) {
        locationParam = `&campaignLocationIndex=${selectedLocationIndex}`;
      }
    }

    // Navigate to dropoff/create with campaign mode and IDs
    navigate(
      `/dropoff/create?campaignId=${campaign.id}&campaignName=${campaign.name}&mode=campaign${locationParam}`
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
              {campaign.isIndefinite ? (
                <span className="font-medium text-green-800">
                  Ongoing Campaign
                </span>
              ) : (
                <>
                  Ends:{" "}
                  {campaign.endDate &&
                    new Date(campaign.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </>
              )}
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

        {/* Campaign Locations */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Collection Locations
          </h2>
          {locationError && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-blue-700">{locationError}</p>
              </div>
            </div>
          )}
          {campaign.locations && campaign.locations.length > 0 ? (
            <div className="space-y-4">
              {campaign.locations.map((location, index) => {
                const isSelected = selectedLocationIndex === index;
                const isNearest =
                  nearestLocationIndex === index && userLocation;

                if (location.simpleDropoffLocationId) {
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedLocationIndex(index)}
                      className={`cursor-pointer bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
                        isSelected
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? "bg-green-500" : "bg-blue-500"
                              }`}
                            ></div>
                            <h3 className="font-semibold text-gray-900">
                              {location.simpleDropoffLocationId.name}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {location.simpleDropoffLocationId.address}
                          </p>
                          {location.simpleDropoffLocationId.materialType && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              Accepts:{" "}
                              {location.simpleDropoffLocationId.materialType}
                            </span>
                          )}
                        </div>
                        {isNearest && (
                          <div className="ml-3 flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm">
                              Nearest
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Linked Centre Dropoff Location
                if (location.dropoffLocationId) {
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedLocationIndex(index)}
                      className={`cursor-pointer bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
                        isSelected
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? "bg-green-500" : "bg-green-500"
                              }`}
                            ></div>
                            <h3 className="font-semibold text-gray-900">
                              {location.dropoffLocationId.name}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {location.dropoffLocationId.address}
                          </p>
                          {location.dropoffLocationId.primaryMaterialType && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              Primary:{" "}
                              {location.dropoffLocationId.primaryMaterialType}
                            </span>
                          )}
                        </div>
                        {isNearest && (
                          <div className="ml-3 flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm">
                              Nearest
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Custom Location
                if (location.customLocation) {
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedLocationIndex(index)}
                      className={`cursor-pointer bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
                        isSelected
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? "bg-green-500" : "bg-orange-500"
                              }`}
                            ></div>
                            <h3 className="font-semibold text-gray-900">
                              {location.customLocation.name ||
                                "Custom Location"}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {location.customLocation.address}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                              📍{" "}
                              {location.customLocation.coordinates[1].toFixed(
                                4
                              )}
                              ,{" "}
                              {location.customLocation.coordinates[0].toFixed(
                                4
                              )}
                            </span>
                          </div>
                        </div>
                        {isNearest && (
                          <div className="ml-3 flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm">
                              Nearest
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                No Collection Locations
              </p>
              <p className="text-gray-400 text-sm mt-1">
                This campaign doesn't have any specific collection locations
                yet.
              </p>
            </div>
          )}
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
