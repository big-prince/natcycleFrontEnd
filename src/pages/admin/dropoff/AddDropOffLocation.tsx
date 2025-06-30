/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSave, FaSpinner, FaArrowLeft } from "react-icons/fa";
import AddressAutocomplete from "./AddressAutocomplete";
import { NormalizedPlaceData } from "../../../types";
import materialApi from "../../../api/materialApi";

interface LocationFormData {
  name: string;
  locationType: string;
  website?: string;
  itemType: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  acceptedSubCategories: string[];
}

const GEOAPIFY_API_KEY = "58fbdbc730e0425d8701cdc5ca6cb6dc";

const AddDropOffLocation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    locationType: "",
    website: "",
    itemType: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    acceptedSubCategories: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [areMaterialsLoaded, setAreMaterialsLoaded] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const [materialCategories, setMaterialCategories] = useState<string[]>([]);
  console.log(materialCategories);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  const [mainItemTypeList, setMainItemTypeList] = useState([
    { label: "Select item type...", value: "" },
  ]);

  // Fetch all material categories on component mount
  useEffect(() => {
    const fetchMaterialCategories = async () => {
      console.log("Fetching all material categories...");
      try {
        const response = await materialApi.getMaterialsCategory();
        const categories = response.data.data.primaryTypes;
        setMaterialCategories(
          categories.map((cat: string) => cat.toLowerCase())
        );

        // Update main item type list
        const itemTypes = categories.map((cat: string) => ({
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: cat.toLowerCase(),
        }));

        setMainItemTypeList([
          { label: "Select item type...", value: "" },
          ...itemTypes,
        ]);

        console.log("Fetched material categories:", categories);
        setAreMaterialsLoaded(true);
      } catch (error) {
        console.error("Failed to fetch material categories:", error);
        toast.error("Failed to load material categories.");
      }
    };

    fetchMaterialCategories();
  }, []);

  // Function to fetch subcategories for a selected primary type
  const fetchSubcategories = async (primaryType: string) => {
    if (!primaryType) {
      setSubcategories([]);
      return;
    }

    setLoadingSubcategories(true);
    console.log(`Fetching subcategories for ${primaryType}...`);

    try {
      const response = await materialApi.getSubCategories(primaryType);
      const subCats = response.data.data.subtypes || [];
      setSubcategories(subCats);
      console.log(
        `Fetched ${subCats.length} subcategories for ${primaryType}:`,
        subCats
      );

      // Clear previously selected subcategories when changing primary type
      setFormData((prev) => ({
        ...prev,
        acceptedSubCategories: [],
      }));
    } catch (err: any) {
      console.error("Error fetching subcategories:", err);
      toast.error("Failed to load subcategories");
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  useEffect(() => {
    const locationId = searchParams.get("id");
    if (locationId && areMaterialsLoaded) {
      console.log(
        `Attempting to load data for editing. Location ID: ${locationId}. Materials loaded: ${areMaterialsLoaded}`
      );
      setIsEditing(true);
      setCurrentLocationId(locationId);
      setLoadingPage(true);
      dropOffLocationApi
        .getDropOffLocationById(locationId)
        .then((res) => {
          const data = res.data.data;
          console.log("Fetched location data for editing:", data);

          const newFormData = {
            name: data.name || "",
            locationType: data.locationType || "",
            itemType: data.itemType || "",
            description: data.description || "",
            address: data.address || "",
            latitude: data.location?.coordinates[1]?.toString() || "",
            longitude: data.location?.coordinates[0]?.toString() || "",
            acceptedSubCategories: data.acceptedSubCategories || [],
          };

          setFormData(newFormData);

          // Fetch subcategories for the material's category
          if (newFormData.itemType) {
            fetchSubcategories(newFormData.itemType);
          }

          console.log("Form data set for editing:", newFormData);
        })
        .catch((err) => {
          console.error("Failed to load location data for editing:", err);
          toast.error("Failed to load location data for editing.");
          navigate("/admin/dropoff-locations");
        })
        .finally(() => {
          setLoadingPage(false);
          console.log("Location data loading/editing setup finished.");
        });
    } else if (locationId && !areMaterialsLoaded) {
      console.log(
        `Edit mode for ID: ${locationId}, but material options not yet loaded. Waiting.`
      );
      setLoadingPage(true);
    } else if (!locationId) {
      console.log("Not in edit mode. Resetting form.");
      setIsEditing(false);
      setCurrentLocationId(null);
      setFormData({
        name: "",
        locationType: "",
        itemType: "",
        description: "",
        address: "",
        latitude: "",
        longitude: "",
        acceptedSubCategories: [],
      });
      setLoadingPage(false);
    }
  }, [searchParams, navigate, areMaterialsLoaded]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    console.log(`Input change - Name: ${name}, Value: ${value}`);

    setFormData((prev) => {
      const newState = { ...prev, [name]: value };

      if (name === "itemType") {
        // Fetch subcategories when item type changes
        fetchSubcategories(value);
      }

      console.log("New formData state after input change:", newState);
      return newState;
    });
  };

  const handleSubcategoryChange = (subCategory: string) => {
    setFormData((prev) => {
      const updatedSubCategories = prev.acceptedSubCategories.includes(
        subCategory
      )
        ? prev.acceptedSubCategories.filter((sc) => sc !== subCategory) // Remove if already selected
        : [...prev.acceptedSubCategories, subCategory]; // Add if not selected

      console.log(
        `Subcategory ${subCategory} ${
          prev.acceptedSubCategories.includes(subCategory)
            ? "removed from"
            : "added to"
        } selection`
      );
      console.log("Updated acceptedSubCategories:", updatedSubCategories);

      return {
        ...prev,
        acceptedSubCategories: updatedSubCategories,
      };
    });
  };

  const handlePlaceSelect = (place: NormalizedPlaceData | null) => {
    if (place) {
      setFormData((prev) => ({
        ...prev,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        name: prev.name || place.name || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        address: "",
        latitude: "",
        longitude: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted. Current formData:", formData);

    if (!formData.address || !formData.latitude || !formData.longitude) {
      toast.error("Please select a valid address using the address search.");
      return;
    }
    if (!formData.name) {
      toast.error("Please fill in the Location Name field.");
      return;
    }
    if (!formData.itemType) {
      toast.error("Please select a Primary Accepted Item Type.");
      return;
    }
    if (formData.acceptedSubCategories.length === 0) {
      toast.error(
        "Please select at least one subcategory that this location accepts."
      );
      return;
    }

    setLoading(true);

    const latNum = parseFloat(formData.latitude);
    const lonNum = parseFloat(formData.longitude);

    if (isNaN(latNum) || isNaN(lonNum)) {
      toast.error("Invalid latitude or longitude. Please re-select address.");
      setLoading(false);
      return;
    }

    const submissionPayload = {
      name: formData.name,
      itemType: formData.itemType,
      description: formData.description,
      address: formData.address,
      latitude: latNum,
      longitude: lonNum,
      acceptedSubCategories: formData.acceptedSubCategories,
    };
    console.log("Final submissionPayload:", submissionPayload);

    try {
      if (isEditing && currentLocationId) {
        await dropOffLocationApi.updateDropOffLocation(
          currentLocationId,
          submissionPayload
        );
        toast.success("Location updated successfully!");
      } else {
        await dropOffLocationApi.addDropOffLocation(submissionPayload);
        toast.success("Location added successfully!");
      }
      navigate("/admin/dropoff-locations");
    } catch (error: any) {
      console.error("Error submitting location:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while saving the location."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)]">
        <FaSpinner className="animate-spin text-4xl text-sky-600" />
        <p className="ml-3 mt-3 text-slate-700">Loading location data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-xl">
        <button
          onClick={() => navigate("/admin/dropoff-locations")}
          className="mb-6 inline-flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Locations
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">
          {isEditing ? "Edit Drop-off Location" : "Add New Drop-off Location"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="address-search-component"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Search Address & Auto-fill <span className="text-red-500">*</span>
            </label>
            <AddressAutocomplete
              provider="geoapify"
              apiKey={GEOAPIFY_API_KEY}
              initialValue={formData.address}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Start typing address to search..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Selecting an address will auto-populate Address, Latitude, and
              Longitude fields. Location Name might also be suggested.
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Location Name <span className="text-red-500">*</span>
            </label>
            <input
              className="input w-full"
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Downtown Recycling Hub"
              required
            />
          </div>

          <div>
            <label
              htmlFor="locationType"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Location Type
            </label>
            <select
              className="input w-full"
              name="locationType"
              id="locationType"
              value={formData.locationType || ""}
              onChange={handleInputChange}
            >
              <option value="">Select location type...</option>
              <option value="redeem centre">Redeem Centre</option>
              <option value="collection point">Collection Point</option>
              <option value="sewage unit">Sewage Unit</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="itemType"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Primary Accepted Item Type <span className="text-red-500">*</span>
            </label>
            <select
              className="input w-full"
              name="itemType"
              id="itemType"
              value={formData.itemType}
              onChange={handleInputChange}
              required
            >
              {mainItemTypeList.map((item) => (
                <option
                  key={item.value || `main-opt-${item.label}`}
                  value={item.value}
                  disabled={item.value === "" && formData.itemType !== ""}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategories Selection */}
          {formData.itemType && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Accepted Subcategories <span className="text-red-500">*</span>
              </label>

              {loadingSubcategories ? (
                <div className="flex items-center space-x-2 text-slate-500 p-3 border border-slate-200 rounded-lg">
                  <FaSpinner className="animate-spin" />
                  <span>Loading subcategories...</span>
                </div>
              ) : subcategories.length === 0 ? (
                <div className="p-3 border border-slate-200 rounded-lg text-slate-500">
                  No subcategories available for this material type.
                </div>
              ) : (
                <div className="p-4 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subcategories.map((subCat) => (
                    <div key={subCat} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`subcategory-${subCat}`}
                        checked={formData.acceptedSubCategories.includes(
                          subCat
                        )}
                        onChange={() => handleSubcategoryChange(subCat)}
                        className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                      />
                      <label
                        htmlFor={`subcategory-${subCat}`}
                        className="ml-2 text-sm text-slate-700 cursor-pointer"
                      >
                        {subCat}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-1">
                Select all subcategories that this location accepts.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Description / Notes
            </label>
            <textarea
              className="input w-full min-h-[100px]"
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Open Mon-Fri 9am-5pm. Ring bell for assistance. Accepts clean & dry materials."
            />
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Location Website (Optional)
            </label>
            <input
              type="text"
              className="input w-full "
              name="website"
              id="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="e.g., www.example.com"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-md border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-600">
              Verified Location Details:
            </h3>
            <div>
              <label
                htmlFor="address-display"
                className="block text-xs font-medium text-slate-500"
              >
                Full Address
              </label>
              <input
                className="input w-full bg-slate-100 mt-0.5"
                type="text"
                id="address-display"
                value={formData.address}
                readOnly
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="latitude-display"
                  className="block text-xs font-medium text-slate-500"
                >
                  Latitude
                </label>
                <input
                  className="input w-full bg-slate-100 mt-0.5"
                  type="text"
                  id="latitude-display"
                  value={formData.latitude}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="longitude-display"
                  className="block text-xs font-medium text-slate-500"
                >
                  Longitude
                </label>
                <input
                  className="input w-full bg-slate-100 mt-0.5"
                  type="text"
                  id="longitude-display"
                  value={formData.longitude}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg flex items-center transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              {loading
                ? isEditing
                  ? "Updating Location..."
                  : "Saving Location..."
                : isEditing
                ? "Update Location"
                : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDropOffLocation;
