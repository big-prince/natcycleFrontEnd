/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
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
} from "react-icons/md";
import { FaBottleWater } from "react-icons/fa6";

interface Location {
  type: string;
  coordinates: number[];
}

export interface DropoffPoint {
  googleMapId: string;
  location: Location;
  _id: string;
  name: string;
  itemType: string;
  description: string;
  address: string;
  __v: number;
  distance?: string;
}

// Sample structure for detailed quantity input based on item type
const subItemsData: {
  [key: string]: {
    id: string;
    name: string;
    icon: JSX.Element;
    unit: string;
  }[];
} = {
  plastic: [
    {
      id: "500ml plastic",
      name: "500ml Plastic Bottle",
      icon: <FaBottleWater className="w-7 h-7 text-blue-500" />,
      unit: "bottles",
    },
    {
      id: "1000ml plastic",
      name: "1L Plastic Bottle",
      icon: <FaBottleWater className="w-7 h-7 text-blue-500" />,
      unit: "bottles",
    },
    {
      id: "1500ml plastic",
      name: "1.5L Plastic Bottle",
      icon: <FaBottleWater className="w-7 h-7 text-blue-500" />,
      unit: "bottles",
    },
  ],
  fabric: [
    {
      id: "fabric_shirt",
      name: "T-Shirt",
      icon: <MdCheckroom className="w-7 h-7 text-green-600" />,
      unit: "items",
    },
  ],
};

const CreateDropOff = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // Allow setting params
  const campaignIdFromQuery = searchParams.get("campaignId") || "";
  const campaignNameFromQuery = searchParams.get("campaignName") || "";
  const typeFromQuery = searchParams.get("type") || "plastic";

  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [detailedQuantities, setDetailedQuantities] = useState<{
    [key: string]: string;
  }>({});

  const [dropOffForm, setDropOffForm] = useState({
    description: "", // Kept if needed, though not prominent in new UI
  });
  const [itemTypesForDisplay, setItemsForDisplay] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    // If there's a type from query, ensure it's set.
    if (typeFromQuery) {
      getNearestDropOffLocations(typeFromQuery);
      setDetailedQuantities({});
    }
  }, [typeFromQuery]);

  //use effect to set items for Display
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await MaterialApi.getAllMaterials();
        const materials = res.data.data.materials as {
          name: string;
          category: string;
        }[];

        const plasticMaterials = materials.filter((m) =>
          m.category.toLowerCase().includes("plastic")
        );
        const nonPlasticMaterials = materials.filter(
          (m) => !m.category.toLowerCase().includes("plastic")
        );

        const newItemTypesForDisplay: { label: string; value: string }[] = [];

        if (plasticMaterials.length > 0) {
          const plasticCategoryExists = newItemTypesForDisplay.find(
            (item) => item.value === "plastic"
          );
          if (!plasticCategoryExists) {
            newItemTypesForDisplay.push({
              label: "Plastic",
              value: "plastic",
            });
          }
        }

        // Add non-plastic materials
        for (const material of nonPlasticMaterials) {
          if (newItemTypesForDisplay.length >= 5) {
            break;
          }

          // Check if an item with this category (value) already exists
          const existingItem = newItemTypesForDisplay.find(
            (item) => item.value === material.category.toLowerCase()
          );

          if (!existingItem) {
            newItemTypesForDisplay.push({
              label: material.name, // Use the material's name as label
              value: material.category.toLowerCase(), // Use the material's category as value
            });
          }
        }
        if (plasticMaterials.length > 0 && newItemTypesForDisplay.length < 5) {
          const genericPlasticExists = newItemTypesForDisplay.find(
            (item) => item.value === "plastic"
          );
          if (!genericPlasticExists) {
            newItemTypesForDisplay.push({
              label: "Plastic",
              value: "plastic",
            });
          }
        }

        setItemsForDisplay(newItemTypesForDisplay);
      } catch (err) {
        console.error("Failed to fetch materials:", err);
        toast.error("Could not load item types.");
      }
    };
    fetchMaterials();
  }, [setItemsForDisplay]);

  const handleItemTypeSelect = (itemValue: string) => {
    setSearchParams({ type: itemValue }); // This will trigger the useEffect above
    setSelectedLocationId(null); // Reset selected location
  };

  const handleQuantityChange = (itemId: string, value: string) => {
    setDetailedQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleDropOffFormSubmit = async (e: any) => {
    e.preventDefault();
    // if (!localUser || !localUser.isAuthenticated) {
    //   const formDataToStore = {
    //     selectedLocationId,
    //     detailedQuantities,
    //     typeFromQuery,
    //     description: dropOffForm.description,
    //     campaignId: campaignIdFromQuery,
    //     campaignName: campaignNameFromQuery,
    //     timestamp: new Date().toISOString(),
    //   };
    //   sessionStorage.setItem("pendingDropoff", JSON.stringify(formDataToStore));
    //   if (file) {
    //     /* ... store file ... */
    //   }
    //   navigate("/", {
    //     state: {
    //       redirectAfterLogin: `/public/dropoff/create?type=${typeFromQuery}`,
    //     },
    //   });
    //   return toast.info("Please login or Signup to create a drop off");
    // }

    if (!selectedLocationId)
      return toast.error("Please select a drop-off location.");
    if (!file) return toast.error("Please capture a receipt image.");

    const totalQuantity = Object.values(detailedQuantities).reduce(
      (sum, qty) => sum + (parseInt(qty, 10) || 0),
      0
    );
    if (totalQuantity === 0 && Object.keys(detailedQuantities).length > 0) {
      // Only error if quantity inputs were shown but all are zero or empty
      return toast.error("Please enter the quantity for at least one item.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("location", selectedLocationId);
    formData.append("description", dropOffForm.description); // Optional
    formData.append("itemQuantity", totalQuantity.toString()); // Sum of detailed quantities
    formData.append("itemType", typeFromQuery);
    formData.append("file", file as Blob);
    if (campaignIdFromQuery) formData.append("campaignId", campaignIdFromQuery);

    // Log detailed quantities for plastic items if that's the selected type
    if (typeFromQuery === "plastic") {
      console.log("Plastic item breakdown:");
      for (const [itemId, quantity] of Object.entries(detailedQuantities)) {
        if (parseInt(quantity) > 0) {
          formData.set("itemType", itemId);
          console.log(`Setting itemType to specific plastic type: ${itemId}`);
          break;
        }
      }
    }

    // Log all formData entries
    formData.forEach((value, key) => {
      if (key === "file") {
        console.log(`${key}: [File object]`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });

    // ... (DropOffApi.addDropOff call - existing logic)
    DropOffApi.addDropOff(formData)
      .then(() => {
        toast.success("Drop off created successfully");
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
    setLoadingLocations(true);
    setSelectedLocationId(null); // Reset selection when fetching new locations
    try {
      const userCoords = await getUserLocation();
      const params = {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        distance: 0, // Initial search radius
        itemType: itemTypeValue,
      };
      let fetchedLocations = (
        await dropOffLocationApi.getNearestDropOffLocations(params)
      ).data.data;

      if (fetchedLocations.length === 0) {
        toast.info("No locations found nearby. Expanding search to 300km...");
        params.distance = 300000; // 300km
        fetchedLocations = (
          await dropOffLocationApi.getNearestDropOffLocations(params)
        ).data.data;
      }

      // Add a placeholder distance for UI demo purposes
      const locationsWithDistance = fetchedLocations.map(
        (loc: DropoffPoint, index: number) => ({
          ...loc,
          distance: `${(index + 1) * 2 + index * 0.5} miles`, // Placeholder
        })
      );

      setLocations(locationsWithDistance);
      if (locationsWithDistance.length > 0) {
        setSelectedLocationId(locationsWithDistance[0]._id); // Auto-select first one
      } else {
        toast.info(
          `No drop-off locations found for ${itemTypeValue} even within 300km.`
        );
      }
    } catch (error: any) {
      console.error("Error fetching locations:", error);
      toast.error("Error fetching locations: " + error.message);
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
  const canvasRef = useRef<HTMLCanvasElement>(null); // For capturing photo

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

  const startCamera = async (mode: "user" | "environment") => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
      setPreviewUrl(null);
      setFile(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const handleOpenCamera = () => {
    startCamera(facingMode);
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
            closeCamera(); // Close camera after capture
          },
          "image/jpeg",
          0.95
        ); // Adjust quality if needed
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
        if (pendingData.typeFromQuery)
          setSearchParams({ type: pendingData.typeFromQuery });
        if (pendingData.selectedLocationId)
          setSelectedLocationId(pendingData.selectedLocationId);
        if (pendingData.detailedQuantities)
          setDetailedQuantities(pendingData.detailedQuantities);
        if (pendingData.description)
          setDropOffForm((prev) => ({
            ...prev,
            description: pendingData.description,
          }));

        const pendingFileRaw = sessionStorage.getItem("pendingDropoffFile");
        if (pendingFileRaw) {
          // Logic to convert DataURL back to File and set preview
          // Example: setFile(dataURLtoFile(pendingFileRaw, "restored-image.jpg"));
          // Example: setPreviewUrl(pendingFileRaw); // If it was stored as a DataURL
        }
        toast.success("Your previous dropoff information has been restored.");
        sessionStorage.removeItem("pendingDropoff");
        sessionStorage.removeItem("pendingDropoffFile");
      } catch (error) {
        console.error("Error restoring dropoff data:", error);
      }
    }
  }, [localUser, setSearchParams]);

  const currentSubItems = subItemsData[typeFromQuery] || [];

  return (
    <div className="pb-20 px-4 max-w-md mx-auto">
      {" "}
      <div className="flex space-x-2 my-6 overflow-x-auto pb-2 scrollbar-hide">
        {itemTypesForDisplay.map((item) => (
          <button
            key={item.value}
            onClick={() => handleItemTypeSelect(item.value)}
            className={`px-6 py-3 text-sm font-semibold rounded-full transition-colors whitespace-nowrap
              ${
                typeFromQuery === item.value
                  ? "bg-slate-800 text-white"
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
              disabled={loadingLocations}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center transition-opacity disabled:opacity-50"
            >
              <MdLocationOn className="mr-1.5" />
              {loadingLocations ? "Locating..." : "Locate"}
            </button>
          </div>

          {loadingLocations && !locations.length && (
            <p className="text-center text-gray-500 py-4">
              Finding locations...
            </p>
          )}
          {!loadingLocations && locations.length === 0 && (
            <p className="text-center text-gray-500 py-4 bg-gray-50 rounded-md">
              No locations found for {typeFromQuery}. Try a different item type.
            </p>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-1">
            {locations.map((loc) => (
              <div
                key={loc._id}
                onClick={() => setSelectedLocationId(loc._id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all
                  ${
                    selectedLocationId === loc._id
                      ? "bg-teal-50 border-teal-500 ring-2 ring-teal-500"
                      : "bg-white border-gray-200 hover:border-gray-400"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{loc.name}</p>
                    <p className="text-xs text-gray-500">{loc.address}</p>
                    {loc.distance && (
                      <p className="text-xs text-green-600 mt-0.5">
                        {loc.distance} away
                      </p>
                    )}
                  </div>
                  {selectedLocationId === loc._id && (
                    <MdCheckCircle className="text-green-600 text-2xl flex-shrink-0 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Input Section - Dynamic */}
        {currentSubItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-md font-semibold text-slate-700 mb-3">
              How many <span className="lowercase">{typeFromQuery}</span> items
              were recycled?
            </h2>
            <div className="space-y-4">
              {currentSubItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded bg-white p-1 shadow-sm">
                    {item.icon}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-slate-600">{item.name}</p>
                    <input
                      type="number"
                      placeholder="How many"
                      min="0"
                      value={detailedQuantities[item.id] || ""}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Fallback for types without sub-items, or keep existing generic quantity if preferred */}
        {currentSubItems.length === 0 && typeFromQuery && (
          <div className="mb-6">
            <label
              htmlFor="generic_quantity"
              className="block text-md font-semibold text-slate-700 mb-1"
            >
              Quantity of {typeFromQuery}
            </label>
            <input
              type="number"
              id="generic_quantity"
              name="generic_quantity"
              min="0"
              placeholder="Enter quantity"
              value={detailedQuantities["generic"] || ""}
              onChange={(e) => handleQuantityChange("generic", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        )}

        {/* Receipt Upload Section */}
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
                    className="max-h-full max-w-full object-contain rounded-md" // Ensures preview fits
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
              {" "}
              {/* Changed from aspect-video to aspect-square */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover" // object-cover will fill the square, cropping if necessary
                style={{
                  transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
                }} // Mirror front camera
              />
              <canvas ref={canvasRef} className="hidden"></canvas>{" "}
              {/* Hidden canvas for capture */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-10">
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm" // Added backdrop-blur
                  aria-label="Switch camera"
                >
                  <MdFlipCameraAndroid size={24} />
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="p-4 bg-red-500 text-white rounded-full ring-2 ring-white hover:bg-red-600 shadow-lg" // Added shadow
                  aria-label="Capture photo"
                >
                  <MdCameraAlt size={28} />
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm" // Added backdrop-blur
                  aria-label="Close camera"
                >
                  <MdClose size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Removed the second "SCAN REDEEM RECEIPT" button as its functionality is merged */}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || loadingLocations || !file} // Disable if no file captured
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center text-lg transition-opacity disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Drop-off"}
          {!loading && <MdArrowForward className="ml-2 text-xl" />}
        </button>
      </form>
    </div>
  );
};

export default CreateDropOff;
