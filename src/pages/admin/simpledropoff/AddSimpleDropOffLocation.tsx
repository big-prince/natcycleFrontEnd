/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SimpleDropoffApi from "../../../api/simpleDropoffApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSave, FaSpinner, FaArrowLeft } from "react-icons/fa";
import materialApi from "../../../api/materialApi";

interface LocationFormData {
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  materialType: string;
  bulkMaterialTypes: string[];
  acceptedSubtypes: string;
  organizationName: string;
  isActive: boolean;
  verificationRequired: boolean;
  maxItemsPerDropOff: string;
  operatingHours: string;
  contactNumber: string;
}

const AddSimpleDropOffLocation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
    materialType: "",
    bulkMaterialTypes: [],
    acceptedSubtypes: "",
    organizationName: "",
    isActive: true,
    verificationRequired: false,
    maxItemsPerDropOff: "10",
    operatingHours: "",
    contactNumber: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [areMaterialsLoaded, setAreMaterialsLoaded] = useState(false);

  // Fetch material types
  useEffect(() => {
    const fetchMaterialTypes = async () => {
      try {
        const response = await materialApi.getMaterialsCategory();
        setMaterialTypes(response.data.data.primaryTypes || []);
        setAreMaterialsLoaded(true);
      } catch (error) {
        console.error("Error fetching material types:", error);
        toast.error("Failed to load material types");
      }
    };
    fetchMaterialTypes();
  }, []);

  // Handle editing mode
  useEffect(() => {
    const locationId = searchParams.get("id");
    if (locationId && areMaterialsLoaded) {
      setIsEditing(true);
      setCurrentLocationId(locationId);
      setLoadingPage(true);

      SimpleDropoffApi.adminGetLocationById(locationId)
        .then((res) => {
          const data = res.data.data;

          // Handle legacy material type and potential bulk material types
          let bulkMaterialTypes: string[] = [];
          if (data.bulkMaterialTypes && Array.isArray(data.bulkMaterialTypes)) {
            bulkMaterialTypes = data.bulkMaterialTypes;
          } else if (data.materialType) {
            // Convert legacy single material type to array
            bulkMaterialTypes = [data.materialType];
          }

          setFormData({
            name: data.name || "",
            latitude: data.location?.coordinates[1]?.toString() || "",
            longitude: data.location?.coordinates[0]?.toString() || "",
            address: data.address || "",
            materialType: data.materialType || "",
            bulkMaterialTypes: bulkMaterialTypes,
            acceptedSubtypes: data.acceptedSubtypes?.join(", ") || "",
            organizationName: data.organizationName || "",
            isActive: data.isActive,
            verificationRequired: data.verificationRequired,
            maxItemsPerDropOff: data.maxItemsPerDropOff?.toString() || "10",
            operatingHours: data.operatingHours || "",
            contactNumber: data.contactNumber || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching location:", error);
          toast.error("Failed to load location data");
          navigate("/admin/simple-dropoff-locations");
        })
        .finally(() => {
          setLoadingPage(false);
        });
    }
  }, [searchParams, areMaterialsLoaded, navigate]);

  // Handle bulk material type selection with checkboxes (like campaigns)
  const handleBulkMaterialTypeChange = (materialType: string) => {
    // Special handling for "All" option
    if (materialType === "All") {
      // If "All" is already selected, deselect it
      if (formData.bulkMaterialTypes.includes("All")) {
        setFormData({
          ...formData,
          bulkMaterialTypes: [],
          materialType: "", // Clear legacy field when deselecting all
        });
      } else {
        // Select only "All"
        setFormData({
          ...formData,
          bulkMaterialTypes: ["All"],
          materialType: "All", // Set legacy field for backward compatibility
        });
      }
    } else {
      // If a specific material type is selected
      const newBulkMaterialTypes = [...formData.bulkMaterialTypes];

      // If "All" is currently selected, remove it
      if (newBulkMaterialTypes.includes("All")) {
        const allIndex = newBulkMaterialTypes.indexOf("All");
        newBulkMaterialTypes.splice(allIndex, 1);
      }

      // Toggle the selected material type
      const materialIndex = newBulkMaterialTypes.indexOf(materialType);
      if (materialIndex === -1) {
        // Add material if not already selected
        newBulkMaterialTypes.push(materialType);
      } else {
        // Remove material if already selected
        newBulkMaterialTypes.splice(materialIndex, 1);
      }

      setFormData({
        ...formData,
        bulkMaterialTypes: newBulkMaterialTypes,
        // Set legacy field to first selected material type for backward compatibility
        materialType:
          newBulkMaterialTypes.length > 0 ? newBulkMaterialTypes[0] : "",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one material type is selected
    if (formData.bulkMaterialTypes.length === 0) {
      toast.error("Please select at least one material type");
      return;
    }

    setLoading(true);
    try {
      const locationData = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        address: formData.address,
        materialType: formData.materialType, // Legacy field for backward compatibility
        bulkMaterialTypes: formData.bulkMaterialTypes, // New bulk material types array
        acceptedSubtypes: formData.acceptedSubtypes
          ? formData.acceptedSubtypes
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : undefined,
        organizationName: formData.organizationName || undefined,
        isActive: formData.isActive,
        verificationRequired: formData.verificationRequired,
        maxItemsPerDropOff: parseInt(formData.maxItemsPerDropOff),
        operatingHours: formData.operatingHours || undefined,
        contactNumber: formData.contactNumber || undefined,
      };

      if (isEditing && currentLocationId) {
        await SimpleDropoffApi.adminUpdateLocation(
          currentLocationId,
          locationData
        );
        toast.success("Location updated successfully");
      } else {
        await SimpleDropoffApi.adminCreateLocation(locationData);
        toast.success("Location created successfully");
      }

      navigate("/admin/simple-dropoff-locations");
    } catch (error: any) {
      console.error("Error saving location:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to save location";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/admin/simple-dropoff-locations")}
              className="mr-4 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {isEditing
                  ? "Edit Simple Drop-Off Location"
                  : "Add Simple Drop-Off Location"}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditing
                  ? "Update the simple drop-off location details"
                  : "Create a new simple drop-off location for waste collection"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Enter location name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        organizationName: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Enter organization name"
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Location Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          latitude: e.target.value,
                        }))
                      }
                      required
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="Enter latitude"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          longitude: e.target.value,
                        }))
                      }
                      required
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="Enter longitude"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Material Types */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Material Types
              </h3>
              <div className="space-y-4">
                {/* Legacy Material Type (for backward compatibility) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Primary Material Type (Legacy)
                  </label>
                  <select
                    value={formData.materialType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        materialType: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  >
                    <option value="">Select primary type</option>
                    {materialTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bulk Material Types Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Accepted Material Types *
                  </label>
                  <div className="border border-slate-300 rounded-lg p-6 bg-white max-h-80 overflow-y-auto">
                    {/* "All" option */}
                    <div
                      className={`p-3 mb-4 rounded-lg flex items-center cursor-pointer transition-colors ${
                        formData.bulkMaterialTypes.includes("All")
                          ? "bg-sky-100 border-2 border-sky-300"
                          : "hover:bg-slate-50 border-2 border-transparent"
                      } ${
                        formData.bulkMaterialTypes.length > 0 &&
                        !formData.bulkMaterialTypes.includes("All")
                          ? "opacity-50"
                          : ""
                      }`}
                      onClick={() => handleBulkMaterialTypeChange("All")}
                    >
                      <div
                        className={`w-6 h-6 mr-3 flex items-center justify-center border-2 rounded-lg ${
                          formData.bulkMaterialTypes.includes("All")
                            ? "bg-sky-600 border-sky-600"
                            : "border-slate-400"
                        }`}
                      >
                        {formData.bulkMaterialTypes.includes("All") && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-semibold text-slate-800">
                        All Materials
                      </span>
                    </div>

                    {/* Individual material types */}
                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
                        formData.bulkMaterialTypes.includes("All")
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      {materialTypes.map((material) => (
                        <div
                          key={material}
                          className={`p-3 rounded-lg flex items-center cursor-pointer transition-colors ${
                            formData.bulkMaterialTypes.includes(material) &&
                            !formData.bulkMaterialTypes.includes("All")
                              ? "bg-sky-50 border-2 border-sky-200"
                              : "hover:bg-slate-50 border-2 border-transparent"
                          } ${
                            formData.bulkMaterialTypes.includes("All")
                              ? "pointer-events-none"
                              : ""
                          }`}
                          onClick={() =>
                            !formData.bulkMaterialTypes.includes("All") &&
                            handleBulkMaterialTypeChange(material)
                          }
                        >
                          <div
                            className={`w-6 h-6 mr-3 flex items-center justify-center border-2 rounded-lg ${
                              formData.bulkMaterialTypes.includes(material) &&
                              !formData.bulkMaterialTypes.includes("All")
                                ? "bg-sky-600 border-sky-600"
                                : "border-slate-400"
                            }`}
                          >
                            {formData.bulkMaterialTypes.includes(material) &&
                              !formData.bulkMaterialTypes.includes("All") && (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                          </div>
                          <span className="text-slate-800">
                            {material.charAt(0).toUpperCase() +
                              material.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Select "All Materials" to accept all types, or choose
                    specific material types.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Accepted Subtypes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.acceptedSubtypes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        acceptedSubtypes: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="e.g., bottles, containers, bags"
                  />
                </div>
              </div>
            </div>

            {/* Operational Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Operational Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Items Per Drop-Off *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxItemsPerDropOff}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxItemsPerDropOff: e.target.value,
                      }))
                    }
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Enter maximum items allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      operatingHours: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 focus:ring-2"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-slate-700"
                  >
                    Active Location
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verificationRequired"
                    checked={formData.verificationRequired}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        verificationRequired: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500 focus:ring-2"
                  />
                  <label
                    htmlFor="verificationRequired"
                    className="ml-2 text-sm text-slate-700"
                  >
                    Verification Required
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/admin/simple-dropoff-locations")}
                className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {isEditing ? "Update Location" : "Create Location"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSimpleDropOffLocation;
