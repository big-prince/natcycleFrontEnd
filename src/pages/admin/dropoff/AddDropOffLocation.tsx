/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSave, FaSpinner, FaArrowLeft } from "react-icons/fa";
import AddressAutocomplete from "./AddressAutocomplete";
import { NormalizedPlaceData } from "../../../types";

interface LocationFormData {
  name: string;
  itemType: string;
  description: string;
  address: string; // This will store the formatted address from autocomplete
  latitude: string;
  longitude: string;
}

const GEOAPIFY_API_KEY = "58fbdbc730e0425d8701cdc5ca6cb6dc";

const AddDropOffLocation = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(false);
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    itemType: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const locationId = searchParams.get("id");
    if (locationId) {
      setIsEditing(true);
      setCurrentLocationId(locationId);
      setLoadingPage(true);
      dropOffLocationApi
        .getDropOffLocationById(locationId)
        .then((res) => {
          const data = res.data.data;
          setFormData({
            name: data.name || "",
            itemType: data.itemType || "",
            description: data.description || "",
            address: data.address || "",
            latitude: data.location?.coordinates[1]?.toString() || "",
            longitude: data.location?.coordinates[0]?.toString() || "",
          });
        })
        .catch((err) => {
          console.error("Failed to load location data:", err);
          toast.error("Failed to load location data for editing.");
          navigate("/admin/dropoff-locations");
        })
        .finally(() => {
          setLoadingPage(false);
        });
    }
  }, [searchParams, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (!formData.address || !formData.latitude || !formData.longitude) {
      toast.error("Please select a valid address using the address search.");
      return;
    }
    if (!formData.name || !formData.itemType) {
      toast.error(
        "Please fill in the Location Name and Accepted Item Type fields."
      );
      return;
    }

    setLoading(true);
    const payload: LocationFormData = { ...formData };

    try {
      if (isEditing && currentLocationId) {
        await dropOffLocationApi.updateDropOffLocation(
          currentLocationId,
          payload
        );
        toast.success("Location updated successfully!");
      } else {
        await dropOffLocationApi.addDropOffLocation(payload);
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

  const itemTypesList = [
    { label: "Fabric", value: "fabric" },
    { label: "Plastic", value: "plastic" },
    { label: "E-waste", value: "ewaste" },
    { label: "Glass", value: "glass" },
    { label: "Food Waste", value: "food" },
    { label: "Paper & Cardboard", value: "paper" },
    { label: "Metals", value: "metals" },
    { label: "Batteries", value: "batteries" },
    { label: "Other", value: "other" },
  ];

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
              htmlFor="address-search-component" // ID for the component wrapper if needed, not the input itself
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
              Longitude fields.
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
              <option value="" disabled>
                Select item type...
              </option>
              {itemTypesList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

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

          {/* Display Address, Latitude, Longitude (read-only, populated by autocomplete) */}
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
