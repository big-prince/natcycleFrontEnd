/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { DropoffPoint } from "../dropoff/CreateDropOff";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
  FaPlus,
  FaMapMarkerAlt,
  FaRecycle,
  FaWineBottle,
  FaTrashAlt,
  FaLocationArrow,
} from "react-icons/fa";
import { MdClose, MdCheckroom, MdRecycling } from "react-icons/md";
import { FaBottleWater } from "react-icons/fa6";
import { GiPaperBagFolded } from "react-icons/gi";
import materialApi from "../../../api/materialApi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Improved icon function with extra debugging for plastic
const getIconForMaterialType = (materialType: string): JSX.Element => {
  const lowerType = materialType.toLowerCase();
  console.log("Getting icon for material type:", lowerType);

  if (lowerType === "plastic" || lowerType.includes("plastic")) {
    console.log("Selected plastic icon");
    return <FaBottleWater className="w-7 h-7 text-blue-500" />;
  }
  if (
    lowerType === "fabric" ||
    lowerType.includes("fabric") ||
    lowerType.includes("textile")
  ) {
    return <MdCheckroom className="w-7 h-7 text-green-600" />;
  }
  if (lowerType === "glass" || lowerType.includes("glass")) {
    return <FaWineBottle className="w-7 h-7 text-green-400" />;
  }
  if (
    lowerType === "aluminium" ||
    lowerType.includes("aluminium") ||
    lowerType === "metal" ||
    lowerType.includes("metal") ||
    lowerType.includes("can")
  ) {
    return <FaTrashAlt className="w-7 h-7 text-gray-500" />;
  }
  if (lowerType === "paper" || lowerType.includes("paper")) {
    return <GiPaperBagFolded className="w-7 h-7 text-yellow-600" />;
  }
  if (lowerType === "ewaste" || lowerType.includes("ewaste")) {
    return <MdRecycling className="w-7 h-7 text-purple-500" />;
  }

  console.log("No specific icon found, using default");
  return <FaRecycle className="w-7 h-7 text-teal-500" />;
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

  // Instead of using MapRef type, use any for now to avoid the TypeScript error
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
  }, []);

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

  // Filter locations by material type and fetch from API
  const fetchLocationsByMaterialType = async (materialType?: string) => {
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
        itemType: materialType || "",
      };

      console.log(
        `Fetching locations${materialType ? ` for ${materialType}` : " (all)"}`,
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
          const validMarkers = newMarkers.filter((marker) => !marker.isTooFar);

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
              fitMapToMarkers(nearbyMarkers);

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
              fitMapToMarkers(validMarkers);

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
  };

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

  // Initial data load - show all locations
  useEffect(() => {
    fetchLocationsByMaterialType();
  }, []);

  // Handle material type selection
  const handleMaterialTypeSelect = (materialType: string) => {
    console.log("Material type clicked:", materialType);

    if (selectedMaterialType === materialType) {
      console.log("Deselecting material type, showing all locations");
      setSelectedMaterialType(null);
      fetchLocationsByMaterialType(); // Reset to all locations
    } else {
      console.log("Selected material type:", materialType);
      setSelectedMaterialType(materialType);
      fetchLocationsByMaterialType(materialType); // Filter by material type
    }
  };

  // Handle marker click
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

  // Close location details and restore previous map view
  const closeLocationDetails = () => {
    setSelectedLocation(null);

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

  // Fit map to show all markers
  const fitMapToMarkers = (markersToFit: LocationMarker[]) => {
    if (
      !mapRef.current ||
      markersToFit.length === 0 ||
      !googleMapsApiRef.current
    )
      return;

    try {
      const bounds = new googleMapsApiRef.current.LatLngBounds();

      markersToFit.forEach((marker) => {
        bounds.extend(marker.location);
      });

      // Also include user location in bounds if available
      if (userLocation) {
        bounds.extend({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
      }

      mapRef.current.fitBounds(bounds, {
        padding: {
          top: 80, // Padding for the filter UI at the top
          bottom: selectedLocation ? 200 : 80, // Extra padding if location details are shown
          left: 40,
          right: 40,
        },
      });
    } catch (error) {
      console.error("Error fitting map to markers:", error);
    }
  };

  // Calculate map center and zoom based on user location or markers
  const mapConfig = useMemo(() => {
    if (userLocation) {
      return {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 12,
      };
    }

    // Default to center of Nigeria if no user location
    return {
      center: { lat: 9.0765, lng: 7.3986 },
      zoom: 6,
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
            {/* Marker base with conditional styling for highlighted state */}
            <div
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
                isHighlighted
                  ? "bg-yellow-50 border-2 border-yellow-400 ring-4 ring-yellow-200 ring-opacity-50"
                  : "bg-white border-2 border-gray-300"
              }`}
            >
              {/* Icon based on material type */}
              <div className="w-8 h-8 flex items-center justify-center">
                {markerIcon}
              </div>
            </div>

            {/* Bottom pointer with conditional styling */}
            <div
              className={`absolute top-8 w-4 h-4 transform rotate-45 translate-y-1 shadow-md ${
                isHighlighted
                  ? "bg-yellow-50 border-r border-b border-yellow-400"
                  : "bg-white border-r border-b border-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </AdvancedMarker>
    );
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Map Container */}
      <div className="absolute inset-0 z-0">
        {!loading ? (
          <APIProvider apiKey={GOOGLE_API_KEY}>
            <Map
              onIdle={onMapIdle}
              mapId="bbc0380a31cc144a" // Use your unique map style ID
              defaultZoom={mapConfig.zoom}
              defaultCenter={mapConfig.center}
              gestureHandling="greedy"
              disableDefaultUI={true}
              mapTypeControl={false}
            >
              {/* Map markers */}
              {markers.map((marker) => (
                <CustomMarker
                  key={marker.key}
                  position={marker.location}
                  materialType={marker.materialType}
                  onClick={() => handleMarkerClick(marker.key)}
                  title={marker.title}
                  markerId={marker.key}
                  isHighlighted={highlightedMarkerId === marker.key}
                />
              ))}
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
          <h2 className="text-xl font-bold mb-3">
            Where to recycle, drop-off?
          </h2>

          {loadingMaterials ? (
            <div className="flex space-x-2 overflow-x-auto py-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-2 overflow-x-auto py-1 scrollbar-hide">
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

          <p className="mt-4 text-sm text-green-700 text-center font-medium">
            Click on a marker to see more details
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
                    className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    onClick={() => {
                      if (selectedLocation.location?.coordinates) {
                        toast.info("Opening directions in Google Maps...");
                      }
                    }}
                  >
                    Get Directions{" "}
                    <span className="ml-2 inline-flex items-center justify-center">
                      <FaLocationArrow className="text-white text-xs" />
                    </span>
                  </button>
                  <button
                    className="mt-4 w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
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
      </AnimatePresence>
    </div>
  );
};

export default Where;
