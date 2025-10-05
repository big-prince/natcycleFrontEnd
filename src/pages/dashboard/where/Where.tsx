/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import SimpleDropoffApi from "../../../api/simpleDropoffApi";
import CampaignApi from "../../../api/campaignApi";
import { DropoffPoint } from "../dropoff/CreateDropOff";
import { ICampaign } from "../dropoff/CreateDropOff";
import { LocationType, ISimpleDropoffLocation } from "../../../types";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaRecycle,
  FaWineBottle,
  FaTrashAlt,
  FaLocationArrow,
  FaBullhorn,
  FaShoppingBag,
} from "react-icons/fa";
import { MdClose, MdCheckroom, MdRecycling } from "react-icons/md";
import { FaBottleWater } from "react-icons/fa6";
import { GiPaperBagFolded } from "react-icons/gi";
import { HiCalendar } from "react-icons/hi";
import materialApi from "../../../api/materialApi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

// Improved icon function with white colors for map markers
const getIconForMaterialType = (materialType: string): JSX.Element => {
  const lowerType = materialType.toLowerCase();
  console.log("Getting icon for material type:", lowerType);

  if (lowerType === "plastic" || lowerType.includes("plastic")) {
    console.log("Selected plastic icon");
    return <FaBottleWater className="w-6 h-6 text-white" />;
  }
  if (
    lowerType === "fabric" ||
    lowerType.includes("fabric") ||
    lowerType.includes("textile")
  ) {
    return <MdCheckroom className="w-6 h-6 text-white" />;
  }
  if (lowerType === "glass" || lowerType.includes("glass")) {
    return <FaWineBottle className="w-6 h-6 text-white" />;
  }
  if (
    lowerType === "aluminium" ||
    lowerType.includes("aluminium") ||
    lowerType === "metal" ||
    lowerType.includes("metal") ||
    lowerType.includes("can")
  ) {
    return <FaTrashAlt className="w-6 h-6 text-white" />;
  }
  if (lowerType === "paper" || lowerType.includes("paper")) {
    return <GiPaperBagFolded className="w-6 h-6 text-white" />;
  }
  if (lowerType === "ewaste" || lowerType.includes("ewaste")) {
    return <MdRecycling className="w-6 h-6 text-white" />;
  }

  console.log("No specific icon found, using default");
  return <FaRecycle className="w-6 h-6 text-white" />;
};

type LocationMarker = {
  key: string;
  location: google.maps.LatLngLiteral;
  materialType: string;
  locationType: string;
  title: string;
  isTooFar?: boolean;
  distance?: number;
};

const Where = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const GOOGLE_API_KEY = import.meta.env.VITE_APP_GOOGLE_API_KEY;
  const [locations, setLocations] = useState<DropoffPoint[]>([]);
  const [markers, setMarkers] = useState<LocationMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<DropoffPoint | null>(
    null
  );
  const [selectedMaterialType, setSelectedMaterialType] = useState<
    string | null
  >(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  // Store previous map view state to return to when closing location details
  const [previousMapState, setPreviousMapState] = useState<{
    center: google.maps.LatLngLiteral;
    zoom: number;
  } | null>(null);
  const [highlightedMarkerId, setHighlightedMarkerId] = useState<string | null>(
    null
  );

  // Simple dropoff location states
  const [locationType, setLocationType] = useState<LocationType>("all");
  const [simpleLocations, setSimpleLocations] = useState<
    ISimpleDropoffLocation[]
  >([]);
  const [selectedSimpleLocation, setSelectedSimpleLocation] =
    useState<ISimpleDropoffLocation | null>(null);

  // Campaign states
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<ICampaign | null>(
    null
  );
  const [selectedCampaignLocationIndex, setSelectedCampaignLocationIndex] =
    useState<number | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const mapRef = useRef<any>(null);
  const googleMapsApiRef = useRef<any>(null);

  // Fetch material categories for filters
  useEffect(() => {
    const fetchMaterialCategories = async () => {
      setLoadingMaterials(true);
      try {
        const response = await materialApi.getMaterialsCategory();
        if (response.data?.data?.primaryTypes) {
          setMaterialTypes(response.data.data.primaryTypes);

          // Check for query parameter and set selected material type
          const typeFromQuery = searchParams.get("type");
          if (typeFromQuery) {
            const normalizedQuery = typeFromQuery.toLowerCase();
            const matchingType = response.data.data.primaryTypes.find(
              (type: string) => type.toLowerCase() === normalizedQuery
            );
            if (matchingType) {
              setSelectedMaterialType(matchingType);
              // Will trigger fetchLocationsByMaterialType in the next useEffect
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch material types:", error);
        toast.error("Could not load filter options");
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterialCategories();
    getUserLocation();
  }, [searchParams]);

  // Get user's current location
  const getUserLocation = async () => {
    return new Promise<{ latitude: number; longitude: number }>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("Got user location:", { latitude, longitude });
            setUserLocation({ latitude, longitude });
            resolve({ latitude, longitude });
          },
          (error) => {
            console.error("Error getting user location:", error);
            // Default to a central location if geolocation fails
            const defaultLocation = { latitude: 9.0765, longitude: 7.3986 }; // Nigeria center
            setUserLocation(defaultLocation);
            resolve(defaultLocation);
            reject(error);
          }
        );
      }
    );
  };

  // Fetch simple dropoff locations
  const fetchSimpleLocations = useCallback(
    async (materialType?: string) => {
      if (!userLocation) return;

      try {
        const response = await SimpleDropoffApi.getNearbyLocations({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 50000, // 50km radius
          materialType: materialType,
          limit: 50,
        });

        const simpleLocationsData = response.data.data || [];
        setSimpleLocations(simpleLocationsData);
      } catch (error) {
        console.error("Failed to fetch simple locations:", error);
        toast.error("Could not load simple drop-off locations");
      }
    },
    [userLocation]
  );

  // Filter locations by material type and fetch from API
  const fetchLocationsByMaterialType = useCallback(
    async (materialType?: string) => {
      setLoading(true);
      setSelectedLocation(null);

      try {
        let userCoords = userLocation;
        if (!userCoords) {
          try {
            userCoords = await getUserLocation();
          } catch (error) {
            userCoords = { latitude: 9.0765, longitude: 7.3986 }; // Nigeria default
          }
        }

        const data = {
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          distance: materialType ? 500000 : 100000, // 500km for filtered, 100km for all
          itemType: materialType || "", // For regular locations, use itemType not materialType
        };

        console.log(
          `Fetching locations${
            materialType ? ` for ${materialType}` : " (all)"
          }`,
          data
        );
        const response = await dropOffLocationApi.getNearestDropOffLocations(
          data
        );
        const locationsData = response.data.data;

        // Filter by actually having coordinates to display on map
        const validLocations = locationsData.filter(
          (loc: DropoffPoint) =>
            loc.location &&
            loc.location.coordinates &&
            loc.location.coordinates.length === 2
        );

        console.log(
          `Found ${validLocations.length} valid locations${
            materialType ? ` for ${materialType}` : ""
          }`
        );

        // For debugging - log what we found
        if (materialType) {
          console.log(
            "Locations for material type:",
            materialType,
            validLocations
          );
        }

        setLocations(validLocations);

        // Calculate distance and set "too far" flag for locations
        const MAX_DISTANCE_KM = 500;
        const newMarkers: LocationMarker[] = validLocations.map(
          (location: DropoffPoint) => {
            // Calculate distance
            const distanceKm = calculateHaversineDistance(
              userCoords!.latitude,
              userCoords!.longitude,
              location.location.coordinates[1],
              location.location.coordinates[0]
            );

            const isTooFar = distanceKm > MAX_DISTANCE_KM;

            return {
              key: location.googleMapId || location._id,
              location: {
                lat: location.location.coordinates[1],
                lng: location.location.coordinates[0],
              },
              materialType: (
                location.primaryMaterialType ||
                location.itemType ||
                "default"
              ).toLowerCase(),
              locationType: (location.locationType || "default").toLowerCase(),
              title: location.name,
              isTooFar: isTooFar,
              distance: distanceKm,
            };
          }
        );

        setMarkers(newMarkers);

        // Auto-fit map bounds to show all markers if material type is selected
        if (materialType && newMarkers.length > 0) {
          setTimeout(() => {
            // Define what's considered "nearby" - roughly same state/vicinity (50km radius)
            const NEARBY_THRESHOLD_KM = 50;
            const nearbyMarkers = newMarkers.filter(
              (marker) =>
                marker.distance !== undefined &&
                marker.distance <= NEARBY_THRESHOLD_KM &&
                !marker.isTooFar
            );

            // Find closest location regardless of distance
            const validMarkers = newMarkers.filter(
              (marker) => !marker.isTooFar
            );

            if (validMarkers.length > 0) {
              // Sort all valid markers by distance
              const sortedMarkers = [...validMarkers].sort(
                (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
              );

              // Get the closest marker
              const closestMarker = sortedMarkers[0];
              console.log("Closest location:", closestMarker);

              if (nearbyMarkers.length > 0) {
                // There are nearby locations - show them all and highlight closest
                console.log(
                  `Found ${nearbyMarkers.length} nearby ${materialType} recycling points`
                );

                // Fit map to show all nearby markers
                // Auto-fit map to markers
                const bounds = new window.google.maps.LatLngBounds();
                nearbyMarkers.forEach((marker) =>
                  bounds.extend(marker.location)
                );
                if (userLocation) {
                  bounds.extend({
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                  });
                }
                mapRef.current?.fitBounds(bounds);

                // Show toast notification
                if (nearbyMarkers.length === 1) {
                  toast.success(
                    `Found 1 ${materialType} recycling point near you`
                  );
                } else {
                  toast.success(
                    `Found ${nearbyMarkers.length} ${materialType} recycling points near you`
                  );
                }

                // Highlight the closest one with a small animation/bounce
                // We'll implement this by saving the closest marker ID to state
                setHighlightedMarkerId(closestMarker.key);

                // Clear the highlight after 3 seconds
                setTimeout(() => setHighlightedMarkerId(null), 3000);
              } else {
                // No nearby locations - show all valid locations with toast
                console.log("No nearby locations found, showing all in region");

                // Save current state before changing it
                if (
                  mapRef.current &&
                  mapRef.current.getCenter &&
                  mapRef.current.getZoom
                ) {
                  setPreviousMapState({
                    center: mapRef.current.getCenter().toJSON(),
                    zoom: mapRef.current.getZoom(),
                  });
                }

                // Fit map to show all valid markers
                // Auto-fit map to markers
                const bounds = new window.google.maps.LatLngBounds();
                validMarkers.forEach((marker) =>
                  bounds.extend(marker.location)
                );
                if (userLocation) {
                  bounds.extend({
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                  });
                }
                mapRef.current?.fitBounds(bounds);

                // Show toast notification
                toast.info(
                  `No ${materialType} recycling points found in your vicinity. Showing all locations in your region.`,
                  { autoClose: 5000 }
                );
              }
            } else {
              // If no valid markers (all too far), show a message
              toast.info(
                `No ${materialType} recycling points available in your region.`,
                { autoClose: 5000 }
              );
            }
          }, 500);
        } else {
          // Center map on user location if showing all
          if (mapRef.current && userLocation) {
            const center = {
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            };
            if (mapRef.current.panTo) {
              mapRef.current.panTo(center);
            }
            if (mapRef.current.setZoom) {
              mapRef.current.setZoom(12); // Set appropriate zoom level for showing area around user
            }
          }
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Error loading recycling locations");
      } finally {
        setLoading(false);
      }

      // Fetch campaigns and simple locations in separate useEffects
    },
    [userLocation]
  );

  // Fetch campaigns near user location
  const fetchCampaigns = useCallback(
    async (materialType?: string) => {
      if (!userLocation) return;

      setLoadingCampaigns(true);
      try {
        // Create params object with user location and radius
        const params: any = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 50000, // 50km radius
        };

        // Add materialType to params if specified
        if (materialType) {
          params.materialType = materialType;
        }

        const response = await CampaignApi.getNearbyCampaigns(
          userLocation.latitude,
          userLocation.longitude,
          50000, // 50km radius
          materialType // Pass materialType parameter to API
        );

        let campaignsData = response.data.data || [];

        // If materialType is specified, filter on client side too (backend should already filter)
        if (materialType) {
          campaignsData = campaignsData.filter((campaign: ICampaign) => {
            // Check the materialTypes field which is a string array
            const campaignMaterialTypes = campaign.materialTypes || [];

            // Handle array of materialTypes
            if (Array.isArray(campaignMaterialTypes)) {
              // If campaign has "All" in its materialTypes, it accepts any material
              if (campaignMaterialTypes.includes("All")) {
                return true;
              }
              // Check if any of the campaign's materialTypes match the selected type
              return campaignMaterialTypes.some(
                (type: string) =>
                  type.toLowerCase() === materialType.toLowerCase()
              );
            }

            // Handle string materialTypes (for backward compatibility)
            if (typeof campaignMaterialTypes === "string") {
              const materialTypeString = campaignMaterialTypes as string;
              // If campaign materialTypes is "All", it accepts any material
              if (materialTypeString.toLowerCase() === "all") {
                return true;
              }

              // Check if string contains the materialType
              return (
                materialTypeString.toLowerCase() ===
                  materialType.toLowerCase() ||
                materialTypeString
                  .toLowerCase()
                  .includes(materialType.toLowerCase())
              );
            }

            return false;
          });
        }

        // Only show active campaigns
        campaignsData = campaignsData.filter(
          (campaign: ICampaign) => campaign.status === "active"
        );

        // Filter campaigns to only include those with valid coordinates
        const validCampaigns = campaignsData.filter((campaign: ICampaign) => {
          // Check legacy location structure first
          if (
            campaign.location?.coordinates &&
            campaign.location.coordinates.length === 2
          ) {
            return true;
          }

          // Check new multi-location structure
          if (campaign.locations && campaign.locations.length > 0) {
            return campaign.locations.some((loc) => {
              const coords =
                loc.simpleDropoffLocationId?.location?.coordinates &&
                loc.simpleDropoffLocationId.location.coordinates.length === 2
                  ? loc.simpleDropoffLocationId.location.coordinates
                  : loc.dropoffLocationId?.location?.coordinates &&
                    loc.dropoffLocationId.location.coordinates.length === 2
                  ? loc.dropoffLocationId.location.coordinates
                  : loc.customLocation?.coordinates &&
                    loc.customLocation.coordinates.length === 2
                  ? loc.customLocation.coordinates
                  : null;
              return coords && coords.length === 2;
            });
          }

          return false;
        });

        console.log(
          `Filtered ${validCampaigns.length} campaigns with valid coordinates from ${campaignsData.length} total`
        );
        setCampaigns(validCampaigns);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        toast.error("Could not load campaigns");
      } finally {
        setLoadingCampaigns(false);
      }
    },
    [userLocation]
  );

  // Helper function for distance calculation
  function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Initial data load - show all locations or filtered if query param exists
  useEffect(() => {
    if (!loadingMaterials && materialTypes.length > 0 && userLocation) {
      // Fetch regular locations if needed - uses itemType
      if (locationType === "regular" || locationType === "all") {
        if (selectedMaterialType) {
          fetchLocationsByMaterialType(selectedMaterialType);
        } else {
          fetchLocationsByMaterialType();
        }
      }

      // Fetch simple locations if needed - uses materialType
      if (locationType === "simple" || locationType === "all") {
        // Now filter simple locations by material type if specified
        if (selectedMaterialType) {
          fetchSimpleLocations(selectedMaterialType);
        } else {
          fetchSimpleLocations();
        }
      }

      // Fetch campaigns if needed - uses materialType
      if (locationType === "campaign" || locationType === "all") {
        // Filter campaigns by material type if specified
        if (selectedMaterialType) {
          fetchCampaigns(selectedMaterialType);
        } else {
          fetchCampaigns();
        }
      }
    }
  }, [
    loadingMaterials,
    materialTypes.length,
    userLocation,
    selectedMaterialType,
    locationType,
    fetchSimpleLocations,
    fetchCampaigns,
    fetchLocationsByMaterialType,
  ]);

  // Handle material type selection
  const handleMaterialTypeSelect = (materialType: string) => {
    console.log("Material type clicked:", materialType);

    if (selectedMaterialType === materialType) {
      // Deselecting the current material type - reset to show all
      console.log("Deselecting material type, showing all locations");
      setSelectedMaterialType(null);

      // Reset all location types using appropriate field names
      fetchLocationsByMaterialType(); // Reset regular locations - uses itemType
      fetchSimpleLocations(); // Reset simple locations - uses materialType
      fetchCampaigns(); // Reset campaigns - uses materialType
    } else {
      console.log("Selected material type:", materialType);
      setSelectedMaterialType(materialType);

      // Filter all location types by the selected material using appropriate field names
      fetchLocationsByMaterialType(materialType); // Filter regular locations - uses itemType
      fetchSimpleLocations(materialType); // Filter simple locations - uses materialType
      fetchCampaigns(materialType); // Filter campaigns - uses materialType
    }
  };

  // Handle marker click for regular locations
  const handleMarkerClick = (key: string) => {
    const location = locations.find(
      (loc) => loc.googleMapId === key || loc._id === key
    );
    if (location) {
      console.log("Selected location:", location);

      // Save current map state before changing it
      if (
        mapRef.current &&
        mapRef.current.getCenter &&
        mapRef.current.getZoom
      ) {
        setPreviousMapState({
          center: mapRef.current.getCenter().toJSON(),
          zoom: mapRef.current.getZoom(),
        });
      }

      setSelectedLocation(location);
      setSelectedSimpleLocation(null); // Clear simple location selection

      // Center the map on the selected location
      if (mapRef.current && location.location?.coordinates) {
        const center = {
          lat: location.location.coordinates[1],
          lng: location.location.coordinates[0],
        };

        // Use map instance methods without MapRef type
        if (mapRef.current.panTo) {
          mapRef.current.panTo(center);
        }
        if (mapRef.current.setZoom) {
          mapRef.current.setZoom(16); // Zoom in more to show the location clearly
        }
      }
    }
  };

  // Handle marker click for simple locations
  const handleSimpleMarkerClick = (id: string) => {
    const location = simpleLocations.find((loc) => loc.id === id);
    if (location) {
      console.log("Selected simple location:", location);

      // Save current map state before changing it
      if (
        mapRef.current &&
        mapRef.current.getCenter &&
        mapRef.current.getZoom
      ) {
        setPreviousMapState({
          center: mapRef.current.getCenter().toJSON(),
          zoom: mapRef.current.getZoom(),
        });
      }

      setSelectedSimpleLocation(location);
      setSelectedLocation(null); // Clear regular location selection

      // Center the map on the selected location
      if (mapRef.current && location.location?.coordinates) {
        const center = {
          lat: location.location.coordinates[1],
          lng: location.location.coordinates[0],
        };

        // Use map instance methods without MapRef type
        if (mapRef.current.panTo) {
          mapRef.current.panTo(center);
        }
        if (mapRef.current.setZoom) {
          mapRef.current.setZoom(16); // Zoom in more to show the location clearly
        }
      }
    }
  };

  // Handle marker click for campaigns
  const handleCampaignMarkerClick = (campaignId: string) => {
    const campaign = campaigns.find(
      (c) => c.id === campaignId || c.id === campaignId
    );
    if (campaign) {
      console.log("Selected campaign:", campaign);

      // Save current map state before changing it
      if (
        mapRef.current &&
        mapRef.current.getCenter &&
        mapRef.current.getZoom
      ) {
        setPreviousMapState({
          center: mapRef.current.getCenter().toJSON(),
          zoom: mapRef.current.getZoom(),
        });
      }

      setSelectedCampaign(campaign);
      setSelectedLocation(null);
      setSelectedSimpleLocation(null);

      // Center the map on the selected campaign
      if (mapRef.current && campaign.location?.coordinates) {
        const center = {
          lat: campaign.location.coordinates[1],
          lng: campaign.location.coordinates[0],
        };

        if (mapRef.current.panTo) {
          mapRef.current.panTo(center);
        }
        if (mapRef.current.setZoom) {
          mapRef.current.setZoom(16);
        }
      }
    }
  };

  // Handle individual campaign location marker clicks - show details card
  const handleCampaignLocationMarkerClick = (
    campaignId: string,
    locationIndex: number
  ) => {
    console.log("Campaign location marker clicked:", {
      campaignId,
      locationIndex,
    });

    // Get the campaign to show in details card
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    // Set selected campaign and specific location index
    setSelectedCampaign(campaign);
    setSelectedCampaignLocationIndex(locationIndex);

    // Clear other selections
    setSelectedLocation(null);
    setSelectedSimpleLocation(null);

    // Center map on the selected location
    if (campaign.locations && campaign.locations[locationIndex]) {
      const location = campaign.locations[locationIndex];
      let coordinates: [number, number] | null = null;

      if (location.simpleDropoffLocationId?.location?.coordinates) {
        coordinates = location.simpleDropoffLocationId.location.coordinates;
      } else if (location.dropoffLocationId?.location?.coordinates) {
        coordinates = location.dropoffLocationId.location.coordinates;
      } else if (location.customLocation?.coordinates) {
        coordinates = location.customLocation.coordinates;
      }

      if (coordinates && mapRef.current) {
        mapRef.current.panTo({
          lat: coordinates[1],
          lng: coordinates[0],
        });
        mapRef.current.setZoom(15);
      }
    }
  };

  // Close location details and restore previous map view
  const closeLocationDetails = () => {
    setSelectedLocation(null);
    setSelectedSimpleLocation(null);
    setSelectedCampaign(null);
    setSelectedCampaignLocationIndex(null);

    // Return to previous map view if available
    if (previousMapState && mapRef.current) {
      if (mapRef.current.panTo) {
        mapRef.current.panTo(previousMapState.center);
      }
      if (mapRef.current.setZoom) {
        mapRef.current.setZoom(previousMapState.zoom);
      }
    }
  };

  // Store a reference to the Google Maps API when it's loaded
  const onMapIdle = (e: any) => {
    mapRef.current = e.map;

    // Wait for Google Maps API to be completely loaded
    if (window.google && window.google.maps) {
      googleMapsApiRef.current = window.google.maps;
    }
  };

  // Calculate map center and zoom based on user location or markers
  const mapConfig = useMemo(() => {
    if (userLocation) {
      return {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 17,
      };
    }

    // Default to center of Nigeria if no user location
    return {
      center: { lat: 9.0765, lng: 7.3986 },
      zoom: 8,
    };
  }, [userLocation]);

  // Custom marker component for the map with improved visibility
  const CustomMarker = ({
    position,
    materialType,
    onClick,
    title,
    isHighlighted,
  }: {
    position: google.maps.LatLngLiteral;
    materialType: string;
    onClick: () => void;
    title: string;
    markerId: string;
    isHighlighted?: boolean;
  }) => {
    // Get icon based on material type
    const markerIcon = useMemo(() => {
      return getIconForMaterialType(materialType);
    }, [materialType]);

    return (
      <AdvancedMarker position={position} onClick={onClick} title={title}>
        <div
          className={`cursor-pointer transform transition-all duration-300 ${
            isHighlighted ? "scale-125 animate-bounce z-10" : "hover:scale-110"
          }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Bigger, more prominent marker dot */}
            <div
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 ${
                isHighlighted
                  ? "bg-teal-500 border-teal-600 ring-2 ring-teal-300"
                  : "bg-teal-400 border-teal-500"
              }`}
            >
              {/* Bigger icon */}
              <div className="w-6 h-6 flex items-center justify-center text-white">
                {markerIcon}
              </div>
            </div>
          </div>
        </div>
      </AdvancedMarker>
    );
  };

  // Simple location marker component with different styling
  const SimpleLocationMarker = ({
    position,
    onClick,
    title,
    isHighlighted,
  }: {
    position: google.maps.LatLngLiteral;
    onClick: () => void;
    title: string;
    markerId: string;
    isHighlighted?: boolean;
  }) => {
    return (
      <AdvancedMarker position={position} onClick={onClick} title={title}>
        <div
          className={`cursor-pointer transform transition-all duration-300 ${
            isHighlighted ? "scale-125 animate-bounce z-10" : "hover:scale-110"
          }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Simple location marker with bigger dot styling */}
            <div
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 ${
                isHighlighted
                  ? "bg-orange-500 border-orange-600 ring-2 ring-orange-300"
                  : "bg-orange-400 border-orange-500"
              }`}
            >
              {/* Better icon for simple locations */}
              <FaShoppingBag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </AdvancedMarker>
    );
  };

  // Campaign marker component with special event styling
  const CampaignMarker = ({
    position,
    onClick,
    title,
    isHighlighted,
  }: {
    position: google.maps.LatLngLiteral;
    onClick: () => void;
    title: string;
    campaign: ICampaign; // Required for typing but not used directly
    markerId: string;
    isHighlighted?: boolean;
    locationIndex?: number;
    locationName?: string;
  }) => {
    return (
      <AdvancedMarker position={position} onClick={onClick} title={title}>
        <div
          className={`cursor-pointer transform transition-all duration-300 ${
            isHighlighted ? "scale-125 animate-bounce z-10" : "hover:scale-110"
          }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Campaign marker with bigger dot styling */}
            <div
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 ${
                isHighlighted
                  ? "bg-green-500 border-green-600 ring-2 ring-green-300"
                  : "bg-green-400 border-green-500"
              }`}
            >
              {/* Campaign icon */}
              <FaBullhorn className="w-6 h-6 text-white" />
            </div>

            {/* Event badge indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>
      </AdvancedMarker>
    );
  };

  // Add this function to handle opening maps with directions
  const openDirections = (lat: number, lng: number, name: string) => {
    const encodedName = encodeURIComponent(name);

    // Get user's platform
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      const appleMapsUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}&travelmode=driving`;

      // Try to open in platform-specific app first
      if (isIOS) {
        window.open(appleMapsUrl, "_blank");

        setTimeout(() => {
          window.open(googleMapsUrl, "_blank");
        }, 1500);
      } else {
        // On Android, try Google Maps directly
        window.open(googleMapsUrl, "_blank");
      }
    } else {
      // For desktop, open Google Maps in browser
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedName}&travelmode=driving`,
        "_blank"
      );
    }

    // Show toast to indicate action
    toast.info(`Opening directions to ${name}`);
  };

  // Function to center map on user location
  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      const center = {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      };

      if (mapRef.current.panTo) {
        mapRef.current.panTo(center);
      }
      if (mapRef.current.setZoom) {
        mapRef.current.setZoom(15); // Zoom in closer when user clicks their location
      }

      toast.success("Centered on your location");
    } else {
      toast.error("Unable to get your location");
    }
  };

  return (
    <div className="relative h-screen overflow-hidden ">
      {/* Map Container */}
      <div className=" absolute inset-0 z-0">
        {!loading ? (
          <APIProvider apiKey={GOOGLE_API_KEY}>
            <Map
              onIdle={onMapIdle}
              mapId="bbc0380a31cc144a"
              defaultZoom={mapConfig.zoom}
              defaultCenter={mapConfig.center}
              gestureHandling="greedy"
              disableDefaultUI={true}
              mapTypeControl={false}
              clickableIcons={false}
              styles={[
                // COMPREHENSIVE POI REMOVAL - Hide ALL POI icons and labels
                {
                  featureType: "poi",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.establishment",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.attraction",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.government",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.medical",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.park",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.place_of_worship",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.school",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.sports_complex",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.lodging",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.shopping",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.restaurant",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.food_and_drink",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.gas_station",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.bank",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.atm",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.pharmacy",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.hospital",
                  stylers: [{ visibility: "off" }],
                },
                // Additional POI types to ensure complete removal
                {
                  featureType: "poi.store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.church",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.mosque",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.lodging",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.food_and_drink",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.retail",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.automotive",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.beauty_and_spa",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.health_and_medical",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.entertainment",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.professional_services",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.real_estate",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.business.travel",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.auto_services",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.beauty_and_spa",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.entertainment",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.finance",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.health",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.legal",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.library",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.personal_care",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.professional_services",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.real_estate",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.storage",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.travel_agency",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.veterinary_care",
                  stylers: [{ visibility: "off" }],
                },
                // Additional comprehensive POI types
                {
                  featureType: "poi.automotive",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.car_dealer",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.car_rental",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.car_repair",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.car_wash",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.church",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.embassy",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.fire_station",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.funeral_home",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.grocery_or_supermarket",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.gym",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.hair_care",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.hardware_store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.home_goods_store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.insurance_agency",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.jewelry_store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.laundry",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.lawyer",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.liquor_store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.local_government_office",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.locksmith",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.meal_delivery",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.meal_takeaway",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.movie_rental",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.movie_theater",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.moving_company",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.museum",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.night_club",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.painter",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.pet_store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.physiotherapist",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.plumber",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.police",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.post_office",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.roofing_contractor",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.rv_park",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.shoe_store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.shopping_mall",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.spa",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.stadium",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.store",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.subway_station",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.supermarket",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.synagogue",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.taxi_stand",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.tourist_attraction",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.train_station",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.university",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.zoo",
                  stylers: [{ visibility: "off" }],
                },
                // Transit related
                {
                  featureType: "transit",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "transit.station",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "transit.line",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "transit.station.airport",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "transit.station.bus",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "transit.station.rail",
                  stylers: [{ visibility: "off" }],
                },
                // Alternative approach - hide all establishment types
                {
                  featureType: "establishment",
                  stylers: [{ visibility: "off" }],
                },
                // Nigeria/Africa specific POI types
                {
                  featureType: "poi.mosque",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.market",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.filling_station",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.bus_station",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.motor_park",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.church_christian",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.religious_place",
                  stylers: [{ visibility: "off" }],
                },
                // Additional comprehensive coverage
                {
                  featureType: "point_of_interest",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.food",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.drink",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.accommodation",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.commercial",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.service",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.retail",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.dining",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.recreation",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.civic",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.industrial",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.transport",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.landmark",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.natural",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.religious",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.educational",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.cultural",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.historic",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.outdoor",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.indoor",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.venue",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.facility",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.activity",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.organization",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.institution",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.building",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.structure",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.location",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.place",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.site",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.area",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.zone",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.district",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.region",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.neighborhood",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.block",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.complex",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.center",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.hub",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.node",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.terminal",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.depot",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.garage",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.workshop",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.factory",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.office",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.clinic",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.laboratory",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.studio",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.gallery",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.theater",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.cinema",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.auditorium",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.hall",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.plaza",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.square",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.court",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.field",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.ground",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.track",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.course",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.range",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.camp",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.resort",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.lodge",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.inn",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.motel",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.hostel",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.apartment",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.house",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.residence",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.dwelling",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.compound",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.estate",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.villa",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.mansion",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.palace",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.castle",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.fort",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.tower",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.monument",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.memorial",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.statue",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.fountain",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.bridge",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.tunnel",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.dam",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.reservoir",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.lake",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.river",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.stream",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.creek",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.pond",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.pool",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.well",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.spring",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.waterfall",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.beach",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.coast",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.bay",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.harbor",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.port",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.dock",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.pier",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.marina",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.wharf",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.jetty",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.breakwater",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.lighthouse",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.beacon",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.buoy",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.anchor",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.mooring",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.berth",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.slip",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.ramp",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.launch",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.landing",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.ferry",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.terminal_ferry",
                  stylers: [{ visibility: "off" }],
                },
                {
                  featureType: "poi.wharf_ferry",
                  stylers: [{ visibility: "off" }],
                },
              ]}
            >
              {/* Regular location markers */}
              {(locationType === "regular" || locationType === "all") &&
                markers.map((marker) => (
                  <CustomMarker
                    key={`regular-${marker.key}`}
                    position={marker.location}
                    materialType={marker.materialType}
                    onClick={() => handleMarkerClick(marker.key)}
                    title={marker.title}
                    markerId={marker.key}
                    isHighlighted={highlightedMarkerId === marker.key}
                  />
                ))}

              {/* Simple location markers */}
              {(locationType === "simple" || locationType === "all") &&
                simpleLocations.map((location) => (
                  <SimpleLocationMarker
                    key={`simple-${location.id}`}
                    position={{
                      lat: location.location.coordinates[1],
                      lng: location.location.coordinates[0],
                    }}
                    onClick={() => handleSimpleMarkerClick(location.id)}
                    title={location.name}
                    markerId={location.id}
                    isHighlighted={false}
                  />
                ))}

              {/* Campaign markers - individual markers for each location */}
              {campaigns.flatMap((campaign) => {
                if (!campaign.locations || campaign.locations.length === 0) {
                  // Handle legacy single location campaigns
                  let coordinates: [number, number] | null = null;
                  if (
                    campaign.location?.coordinates &&
                    campaign.location.coordinates.length === 2
                  ) {
                    coordinates = [
                      campaign.location.coordinates[0],
                      campaign.location.coordinates[1],
                    ];
                  }

                  if (!coordinates) return [];

                  return (
                    <CampaignMarker
                      key={`campaign-${campaign.id}-legacy`}
                      position={{
                        lat: coordinates[1],
                        lng: coordinates[0],
                      }}
                      onClick={() => handleCampaignMarkerClick(campaign.id)}
                      title={campaign.name}
                      campaign={campaign}
                      markerId={campaign.id}
                      isHighlighted={selectedCampaign?.id === campaign.id}
                      locationIndex={-1}
                    />
                  );
                }

                // Create individual markers for each location in the campaign
                return campaign.locations
                  .map((location, locationIndex) => {
                    let coordinates: [number, number] | null = null;
                    let locationName = "";

                    if (
                      location.simpleDropoffLocationId?.location?.coordinates &&
                      location.simpleDropoffLocationId.location.coordinates
                        .length === 2
                    ) {
                      coordinates =
                        location.simpleDropoffLocationId.location.coordinates;
                      locationName = location.simpleDropoffLocationId.name;
                    } else if (
                      location.dropoffLocationId?.location?.coordinates &&
                      location.dropoffLocationId.location.coordinates.length ===
                        2
                    ) {
                      coordinates =
                        location.dropoffLocationId.location.coordinates;
                      locationName = location.dropoffLocationId.name;
                    } else if (
                      location.customLocation?.coordinates &&
                      location.customLocation.coordinates.length === 2
                    ) {
                      coordinates = location.customLocation.coordinates;
                      locationName =
                        location.customLocation.name ||
                        `${campaign.name} Location`;
                    }

                    if (!coordinates || coordinates.length !== 2) return null;

                    return (
                      <CampaignMarker
                        key={`campaign-${campaign.id}-location-${locationIndex}`}
                        position={{
                          lat: coordinates[1],
                          lng: coordinates[0],
                        }}
                        onClick={() =>
                          handleCampaignLocationMarkerClick(
                            campaign.id,
                            locationIndex
                          )
                        }
                        title={`${campaign.name} - ${locationName}`}
                        campaign={campaign}
                        markerId={`${campaign.id}-${locationIndex}`}
                        isHighlighted={selectedCampaign?.id === campaign.id}
                        locationIndex={locationIndex}
                        locationName={locationName}
                      />
                    );
                  })
                  .filter(Boolean);
              })}

              {/* User location marker */}
              {userLocation && (
                <UserLocationMarker
                  position={{
                    lat: userLocation.latitude,
                    lng: userLocation.longitude,
                  }}
                  onClick={centerOnUserLocation}
                  title="Your Location"
                />
              )}
            </Map>
          </APIProvider>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center p-5">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-600 font-medium">
                Discovering recycling locations near you...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top Filter Card */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Diversion Point</h2>

            {/* My Location Button */}
            <button
              onClick={centerOnUserLocation}
              className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
              disabled={!userLocation}
            >
              <FaLocationArrow className="w-3 h-3 mr-1" />
              My Location
            </button>
          </div>

          {/* Location Type Toggle */}
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setLocationType("regular")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  locationType === "regular"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Centers
              </button>
              <button
                onClick={() => setLocationType("simple")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  locationType === "simple"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Quick Drop
              </button>
              <button
                onClick={() => setLocationType("campaign")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  locationType === "campaign"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setLocationType("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  locationType === "all"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Material Type Filters */}
          {loadingMaterials ? (
            <div className="flex space-x-2 overflow-x-auto py-1 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex space-x-2 overflow-x-auto py-1 scrollbar-hide">
              {/* All button */}
              <button
                onClick={() => {
                  setSelectedMaterialType(null);
                  // Reset to show all locations
                  fetchLocationsByMaterialType();
                  fetchSimpleLocations();
                  fetchCampaigns();
                }}
                className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${
                    selectedMaterialType === null
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
              >
                All
              </button>

              {/* Material type filters */}
              {materialTypes.slice(0, 8).map((material) => (
                <button
                  key={material}
                  onClick={() => handleMaterialTypeSelect(material)}
                  className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      selectedMaterialType === material
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                  {material.charAt(0).toUpperCase() + material.slice(1)}
                </button>
              ))}
              <button
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                onClick={() => toast.info("More material types coming soon!")}
              >
                <FaPlus />
              </button>
            </div>
          )}

          <p className="hidden mt-4 text-sm text-green-700 text-center font-medium">
            {loadingCampaigns
              ? "Loading campaigns..."
              : "Click on a marker to see more details"}
          </p>
        </div>
      </div>

      {/* Selected Location Details Card */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            className="absolute bottom-20 left-0 right-0 z-20 px-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Header with close button */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedLocation.name}
                </h3>
                <button
                  onClick={closeLocationDetails}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                >
                  <MdClose size={20} />
                </button>
              </div>

              {/* Location details */}
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3 flex items-start">
                  <FaMapMarkerAlt className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                  <span>{selectedLocation.address}</span>
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {selectedLocation.primaryMaterialType ||
                      selectedLocation.itemType}
                  </span>

                  {selectedLocation.locationType && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {selectedLocation.locationType}
                    </span>
                  )}
                </div>

                {selectedLocation.description && (
                  <p className="text-sm mb-3 text-gray-700">
                    {selectedLocation.description}
                  </p>
                )}

                {selectedLocation.website && (
                  <div>
                    <a
                      href={selectedLocation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedLocation.website}
                    </a>
                  </div>
                )}

                {selectedLocation.acceptedSubtypes &&
                  selectedLocation.acceptedSubtypes.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1">
                        Accepts:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedLocation.acceptedSubtypes.map(
                          (subtype, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {subtype}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Add a CTA button if needed */}
                <div className="w-full flex justify-between items-center gap-4 mt-4">
                  <button
                    className="mt-4 w-full bg-green-600 text-white text-sm py-3 rounded-lg font-medium hover:bg-green-700 transition-colors px-1"
                    onClick={() => {
                      if (selectedLocation.location?.coordinates) {
                        const [lng, lat] =
                          selectedLocation.location.coordinates;
                        openDirections(lat, lng, selectedLocation.name);
                      }
                    }}
                  >
                    Get Directions{" "}
                    <span className="ml-2 inline-flex items-center justify-center">
                      <FaLocationArrow className="text-white text-xs" />
                    </span>
                  </button>
                  <button
                    className="mt-4 w-full bg-black text-white text-sm py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors px-1"
                    onClick={() =>
                      navigate(
                        `/dropoff/create?type=${
                          selectedLocation.primaryMaterialType ||
                          selectedLocation.itemType
                        }`
                      )
                    }
                  >
                    Drop Off Here
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Simple Location Details Card */}
        {selectedSimpleLocation && (
          <motion.div
            className="absolute bottom-20 left-0 right-0 z-20 px-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-l-4 border-orange-400">
              {/* Header with close button */}
              <div className="bg-orange-50 px-4 py-3 flex justify-between items-center border-b">
                <div className="flex items-center">
                  <FaShoppingBag className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedSimpleLocation.name}
                  </h3>
                </div>
                <button
                  onClick={closeLocationDetails}
                  className="p-1 rounded-full hover:bg-orange-100 text-gray-500"
                >
                  <MdClose size={20} />
                </button>
              </div>

              {/* Location details */}
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3 flex items-start">
                  <FaMapMarkerAlt className="text-orange-500 mr-2 mt-1 flex-shrink-0" />
                  <span>
                    {selectedSimpleLocation.address ||
                      "Location coordinates available"}
                  </span>
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                    Quick Drop Point
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {selectedSimpleLocation.materialType}
                  </span>
                </div>

                {selectedSimpleLocation.organizationName && (
                  <p className="text-sm mb-3 text-gray-700">
                    <span className="font-medium">Managed by:</span>{" "}
                    {selectedSimpleLocation.organizationName}
                  </p>
                )}

                {selectedSimpleLocation.operatingHours && (
                  <p className="text-sm mb-3 text-gray-700">
                    <span className="font-medium">Hours:</span>{" "}
                    {selectedSimpleLocation.operatingHours}
                  </p>
                )}

                {selectedSimpleLocation.contactNumber && (
                  <p className="text-sm mb-3 text-gray-700">
                    <span className="font-medium">Contact:</span>{" "}
                    {selectedSimpleLocation.contactNumber}
                  </p>
                )}

                {/* Max items info */}
                <div className="bg-orange-50 rounded-lg p-3 mb-3">
                  <p className="text-xs text-orange-700">
                    <span className="font-medium">Max items per drop:</span>{" "}
                    {selectedSimpleLocation.maxItemsPerDropOff}
                  </p>
                  {selectedSimpleLocation.verificationRequired && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Photo verification required
                    </p>
                  )}
                </div>

                {/* Add a CTA button if needed */}
                <div className="w-full flex justify-between items-center gap-4 mt-4">
                  <button
                    className="mt-4 w-full bg-orange-500 text-white text-sm py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors px-1"
                    onClick={() => {
                      if (selectedSimpleLocation.location?.coordinates) {
                        const [lng, lat] =
                          selectedSimpleLocation.location.coordinates;
                        openDirections(lat, lng, selectedSimpleLocation.name);
                      }
                    }}
                  >
                    Get Directions{" "}
                    <span className="ml-2 inline-flex items-center justify-center">
                      <FaLocationArrow className="text-white text-xs" />
                    </span>
                  </button>
                  <button
                    className="mt-4 w-full bg-black text-white text-sm py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors px-1"
                    onClick={() =>
                      navigate(
                        `/dropoff/create?type=${selectedSimpleLocation.materialType}&mode=simple&locationId=${selectedSimpleLocation.id}`
                      )
                    }
                  >
                    Quick Drop
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Campaign Details Card */}
        {selectedCampaign && (
          <motion.div
            className="absolute bottom-20 left-0 right-0 z-20 px-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-l-4 border-green-400">
              {/* Header with close button */}
              <div className="bg-green-50 px-4 py-3 flex justify-between items-center border-b">
                <div className="flex items-center">
                  <HiCalendar className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedCampaign.name}
                  </h3>
                </div>
                <button
                  onClick={closeLocationDetails}
                  className="p-1 rounded-full hover:bg-green-100 text-gray-500"
                >
                  <MdClose size={20} />
                </button>
              </div>

              {/* Campaign details */}
              <div className="p-4">
                {selectedCampaign.address && (
                  <p className="text-sm text-gray-600 mb-3 flex items-start">
                    <FaMapMarkerAlt className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>{selectedCampaign.address}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Campaign
                  </span>
                  {selectedCampaign.materialTypes && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {(() => {
                        if (Array.isArray(selectedCampaign.materialTypes)) {
                          if (
                            selectedCampaign.materialTypes.includes("All") ||
                            selectedCampaign.materialTypes.length > 3
                          ) {
                            return "All Materials";
                          }
                          return selectedCampaign.materialTypes.join(", ");
                        }
                        const materialType =
                          selectedCampaign.materialTypes ||
                          selectedCampaign.material ||
                          selectedCampaign.itemType ||
                          "";
                        return materialType === "All" || materialType === "all"
                          ? "All Materials"
                          : materialType;
                      })()}
                    </span>
                  )}
                </div>

                {selectedCampaign.description && (
                  <p className="text-sm mb-3 text-gray-700">
                    {selectedCampaign.description}
                  </p>
                )}

                {/* Selected Location Info */}
                {selectedCampaignLocationIndex !== null &&
                  selectedCampaign.locations &&
                  selectedCampaign.locations[selectedCampaignLocationIndex] && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Selected Location:
                      </h4>
                      {(() => {
                        const location =
                          selectedCampaign.locations[
                            selectedCampaignLocationIndex
                          ];
                        if (location.simpleDropoffLocationId) {
                          return (
                            <div>
                              <p className="text-sm text-blue-700 font-medium">
                                {location.simpleDropoffLocationId.name}
                              </p>
                              <p className="text-xs text-blue-600">
                                {location.simpleDropoffLocationId.address}
                              </p>
                            </div>
                          );
                        } else if (location.dropoffLocationId) {
                          return (
                            <div>
                              <p className="text-sm text-blue-700 font-medium">
                                {location.dropoffLocationId.name}
                              </p>
                              <p className="text-xs text-blue-600">
                                {location.dropoffLocationId.address}
                              </p>
                            </div>
                          );
                        } else if (location.customLocation) {
                          return (
                            <div>
                              <p className="text-sm text-blue-700 font-medium">
                                {location.customLocation.name ||
                                  `${selectedCampaign.name} Location`}
                              </p>
                              <p className="text-xs text-blue-600">
                                {location.customLocation.address}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                {/* Add CTA buttons */}
                <div className="w-full flex justify-between items-center gap-4 mt-4">
                  <button
                    className="mt-4 w-full bg-green-500 text-white text-sm py-3 rounded-lg font-medium hover:bg-green-600 transition-colors px-1"
                    onClick={() => {
                      if (selectedCampaign.location?.coordinates) {
                        const [lng, lat] =
                          selectedCampaign.location.coordinates;
                        openDirections(lat, lng, selectedCampaign.name);
                      }
                    }}
                  >
                    Get Directions{" "}
                    <span className="ml-2 inline-flex items-center justify-center">
                      <FaLocationArrow className="text-white text-xs" />
                    </span>
                  </button>
                  <button
                    className="mt-4 w-full bg-black text-white text-sm py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors px-1"
                    onClick={() => {
                      // Determine material type for the URL
                      const materialType = Array.isArray(
                        selectedCampaign.materialTypes
                      )
                        ? selectedCampaign.materialTypes[0]
                        : selectedCampaign.materialTypes ||
                          selectedCampaign.material ||
                          selectedCampaign.itemType ||
                          "";

                      // Build URL with location index if specific location was selected
                      let url = `/dropoff/create?mode=campaign&campaignId=${
                        selectedCampaign.id || selectedCampaign.id
                      }&campaignName=${encodeURIComponent(
                        selectedCampaign.name
                      )}&type=${materialType}&from=where`;

                      if (selectedCampaignLocationIndex !== null) {
                        url += `&campaignLocationIndex=${selectedCampaignLocationIndex}`;
                      }

                      navigate(url);
                    }}
                  >
                    {selectedCampaignLocationIndex !== null
                      ? "Drop Off Here"
                      : "Contribute"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Where;

// User location marker component
const UserLocationMarker = ({
  position,
  onClick,
  title,
}: {
  position: google.maps.LatLngLiteral;
  onClick: () => void;
  title: string;
}) => {
  return (
    <AdvancedMarker position={position} onClick={onClick} title={title}>
      <div className="cursor-pointer transform transition-all duration-300 hover:scale-110">
        <div className="relative flex items-center justify-center">
          {/* Small red dot for user location */}
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
          {/* Pulsing glow effect */}
          <div className="absolute w-8 h-8 bg-red-500 bg-opacity-20 rounded-full animate-ping"></div>
          <div className="absolute w-6 h-6 bg-red-500 bg-opacity-30 rounded-full animate-pulse"></div>
        </div>
      </div>
    </AdvancedMarker>
  );
};
