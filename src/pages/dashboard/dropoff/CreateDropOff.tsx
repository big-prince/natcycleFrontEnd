/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { toast } from "react-toastify";
import DropOffApi from "../../../api/dropOffApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MdLocationOn,
  MdCheckCircle,
  MdArrowForward,
  MdCameraAlt,
  MdCheckroom, // Added MdCheckroom for fabric
} from "react-icons/md";
// Removed FaBottleWater, FaArchive from "react-icons/fa"
import { BsCupFill, BsArchiveFill } from "react-icons/bs"; // Added Bootstrap Icons

// Interfaces (DropoffPoint, Location) remain the same
interface Location {
  type: string;
  coordinates: number[];
}

export interface DropoffPoint {
  googleMapId: string;
  location: Location;
  _id: string;
  name: string;
  itemType: string; // Ensure this is present if used for filtering/display
  description: string;
  address: string;
  __v: number;
  distance?: string; // Optional: for displaying distance like "2 miles"
}

// Updated to match UI prototype's simplicity for selection
const itemTypesForDisplay = [
  { label: "Plastic", value: "plastic" },
  { label: "Fabrics", value: "fabric" },
  { label: "Food", value: "food" }, // Kept for consistency, though not in image's top bar
  { label: "E-waste", value: "ewaste" },
  { label: "Glass", value: "glass" },
  // Add more as needed, the UI shows "Plastic" and "Fabrics" prominently
];

// Sample structure for detailed quantity input based on item type
const subItemsData: {
  [key: string]: {
    id: string;
    name: string;
    icon: JSX.Element;
    unit: string;
  }[]; // Changed 'image' to 'icon' and type to JSX.Element
} = {
  plastic: [
    {
      id: "plastic_bottle_500ml",
      name: "500ml water bottle",
      icon: <BsCupFill className="w-7 h-7 text-blue-500" />, // Using BsCupFill icon
      unit: "bottles",
    },
    {
      id: "plastic_jug_1l",
      name: "1L plastic jug",
      icon: <BsArchiveFill className="w-7 h-7 text-gray-500" />, // Using BsArchiveFill icon
      unit: "jugs",
    },
  ],
  fabric: [
    {
      id: "fabric_shirt",
      name: "T-Shirt",
      icon: <MdCheckroom className="w-7 h-7 text-green-600" />, // Using MdCheckroom for fabric
      unit: "items",
    },
  ],
  // Define for other types as needed
};

const CreateDropOff = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // Allow setting params
  const campaignIdFromQuery = searchParams.get("campaignId") || "";
  const campaignNameFromQuery = searchParams.get("campaignName") || "";
  const typeFromQuery = searchParams.get("type") || "plastic"; // Default to plastic if none

  const [loading, setLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  );
  const [detailedQuantities, setDetailedQuantities] = useState<{
    [key: string]: string;
  }>({});

  const [dropOffForm, setDropOffForm] = useState({
    // location: "", // Replaced by selectedLocationId
    description: "", // Kept if needed, though not prominent in new UI
    // itemType: typeFromQuery, // Handled by typeFromQuery directly
    // quantity: "", // Replaced by detailedQuantities
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If there's a type from query, ensure it's set.
    // This effect also helps in re-fetching locations if type changes via item bar.
    if (typeFromQuery) {
      getNearestDropOffLocations(typeFromQuery);
      setDetailedQuantities({}); // Reset quantities when type changes
    }
  }, [typeFromQuery]);

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
    console.log("LOCAL USER AVAILBLE");

    if (!selectedLocationId)
      return toast.error("Please select a drop-off location.");
    if (!file) return toast.error("Please upload a receipt image.");

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

  // useEffect(() => { getNearestDropOffLocations(); }, [typeFromQuery]); // Initial fetch and on type change

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
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
      {/* Added max-width and centering */}
      {/* Item Type Selection Bar */}
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
                  {/* Updated to render icon component */}
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
          <div className="grid grid-cols-2 gap-4">
            <div
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-gray-400 bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="max-h-full max-w-full object-contain rounded-md"
                />
              ) : (
                <>
                  <MdCameraAlt className="text-3xl text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Upload Receipt Image</p>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()} // Or implement actual scan functionality
              className="aspect-square rounded-lg border border-gray-300 flex flex-col items-center justify-center text-center p-4 hover:bg-gray-100 bg-white"
            >
              <span className="font-semibold text-indigo-600 text-sm">
                SCAN
              </span>
              <span className="font-semibold text-indigo-600 text-sm">
                REDEEM
              </span>
              <span className="font-semibold text-indigo-600 text-sm">
                RECEIPT
              </span>
              <p className="text-xs text-gray-400 mt-1">(Upload a photo)</p>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || loadingLocations}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3.5 px-6 rounded-full flex items-center justify-center text-lg transition-opacity disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
          {!loading && <MdArrowForward className="ml-2 text-xl" />}
        </button>
      </form>
    </div>
  );
};

export default CreateDropOff;
