import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampaignApi from "../../../api/campaignApi";
import materialApi from "../../../api/materialApi";
import { FaSpinner, FaSave, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

// Types
interface CampaignData {
  id: string;
  name: string;
  description: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  materialTypes: string[];
  material?: string; // Legacy support for single material type
  goal: number;
  progress: number;
  image?: {
    public_id: string;
    url: string;
  };
  dropOffLocation?: {
    id: string;
    name: string;
    address: string;
  };
  location?: {
    type: string;
    coordinates: number[];
  };
  address?: string;
  organizationName?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

const AddCampaignModal = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    materialTypes: [] as string[],
    goal: "",
    status: "active" as "active" | "completed" | "cancelled",
    image: null as File | null,
    latitude: "",
    longitude: "",
    address: "",
    organizationName: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(
    null
  );

  // Fetch material types
  useEffect(() => {
    const fetchMaterialTypes = async () => {
      try {
        const response = await materialApi.getMaterialsCategory();
        setMaterialTypes(response.data.data.primaryTypes || []);
      } catch (error) {
        console.error("Error fetching material types:", error);
        toast.error("Failed to load material types");
      }
    };
    fetchMaterialTypes();
  }, []);

  // Load campaign data for editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      setCurrentCampaignId(id);
      setLoadingPage(true);

      CampaignApi.getCampaign(id)
        .then((res) => {
          const campaignData: CampaignData = res.data.data;

          // Convert legacy material field or materialType to materialTypes array
          let materialTypesArray: string[] = [];

          if (campaignData.materialTypes) {
            // If materialType is already an array, use it
            if (Array.isArray(campaignData.materialTypes)) {
              materialTypesArray = campaignData.materialTypes;
            } else {
              // If it's a string, convert to array
              materialTypesArray = [campaignData.materialTypes];
            }
          } else if (campaignData.material) {
            // Support legacy material field
            materialTypesArray = [campaignData.material];
          }

          setCampaignForm({
            name: campaignData.name || "",
            description: campaignData.description || "",
            startDate: campaignData.createdAt
              ? new Date(campaignData.createdAt).toISOString().split("T")[0]
              : "",
            endDate: new Date(campaignData.endDate).toISOString().split("T")[0],
            materialTypes: materialTypesArray,
            goal: campaignData.goal.toString(),
            status: campaignData.status,
            image: null,
            latitude: campaignData.location?.coordinates
              ? campaignData.location.coordinates[1].toString()
              : "",
            longitude: campaignData.location?.coordinates
              ? campaignData.location.coordinates[0].toString()
              : "",
            address: campaignData.address || "",
            organizationName: campaignData.organizationName || "",
          });
        })
        .catch((err) => {
          console.error("Failed to load campaign data for editing:", err);
          toast.error("Failed to load campaign data for editing.");
          navigate("/admin/campaigns");
        })
        .finally(() => {
          setLoadingPage(false);
        });
    } else {
      setIsEditing(false);
      setCurrentCampaignId(null);
      setCampaignForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        materialTypes: [],
        goal: "",
        status: "active",
        image: null,
        latitude: "",
        longitude: "",
        address: "",
        organizationName: "",
      });
      setLoadingPage(false);
    }
  }, [id, navigate]);

  const handleCampaignFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setCampaignForm({
      ...campaignForm,
      [name]: value,
    });
  };

  // Handle material type selection with checkboxes
  const handleMaterialTypeChange = (materialType: string) => {
    // Special handling for "All" option
    if (materialType === "All") {
      // If "All" is already selected, deselect it
      if (campaignForm.materialTypes.includes("All")) {
        setCampaignForm({
          ...campaignForm,
          materialTypes: [],
        });
      } else {
        // Select only "All"
        setCampaignForm({
          ...campaignForm,
          materialTypes: ["All"],
        });
      }
    } else {
      // If a specific material type is selected
      const newMaterialTypes = [...campaignForm.materialTypes];

      // If "All" is currently selected, remove it
      if (newMaterialTypes.includes("All")) {
        const allIndex = newMaterialTypes.indexOf("All");
        newMaterialTypes.splice(allIndex, 1);
      }

      // Toggle the selected material type
      const materialIndex = newMaterialTypes.indexOf(materialType);
      if (materialIndex === -1) {
        // Add material if not already selected
        newMaterialTypes.push(materialType);
      } else {
        // Remove material if already selected
        newMaterialTypes.splice(materialIndex, 1);
      }

      setCampaignForm({
        ...campaignForm,
        materialTypes: newMaterialTypes,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 5000000) {
        toast.error("Image size should not exceed 5mb");
        return;
      }
      setCampaignForm({
        ...campaignForm,
        image: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted. Current formData:", campaignForm);

    if (
      !campaignForm.name ||
      !campaignForm.description ||
      !campaignForm.endDate ||
      !campaignForm.startDate ||
      !campaignForm.goal ||
      !campaignForm.latitude ||
      !campaignForm.longitude ||
      !campaignForm.address ||
      campaignForm.materialTypes.length === 0
    ) {
      toast.error(
        "Please fill in all required fields including location information and material types"
      );
      return;
    }

    setLoading(true);

    try {
      // Create FormData object to properly handle file uploads
      const formData = new FormData();

      // Add all form fields to FormData
      formData.append("name", campaignForm.name);
      formData.append("description", campaignForm.description);
      formData.append("startDate", campaignForm.startDate);
      formData.append("endDate", campaignForm.endDate);
      formData.append("goal", campaignForm.goal);

      // Add material types as an array
      // For FormData, we need to append each array element separately with the same key
      campaignForm.materialTypes.forEach((materialType) => {
        formData.append("materialTypes", materialType);
      });

      // Log materialTypes for debugging
      console.log("Material Types being sent:", campaignForm.materialTypes);

      formData.append("status", campaignForm.status);
      formData.append("latitude", campaignForm.latitude);
      formData.append("longitude", campaignForm.longitude);
      formData.append("address", campaignForm.address);

      // Only append organizationName if it exists
      if (campaignForm.organizationName) {
        formData.append("organizationName", campaignForm.organizationName);
      }

      // Add image to FormData if it exists
      if (campaignForm.image) {
        formData.append("file", campaignForm.image);
      }

      if (isEditing && currentCampaignId) {
        // Update existing campaign
        await CampaignApi.updateCampaign(currentCampaignId, formData);
        toast.success("Campaign updated successfully");
      } else {
        // Create new campaign
        if (!campaignForm.image) {
          toast.error("Please select an image for the new campaign");
          setLoading(false);
          return;
        }
        await CampaignApi.createCampaign(formData);
        toast.success("Campaign added successfully");
      }

      // Navigate back to campaigns list
      navigate("/admin/campaigns");
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message || "An error occurred");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-150px)]">
        <FaSpinner className="animate-spin text-4xl text-sky-600" />
        <p className="ml-3 mt-3 text-slate-700">Loading campaign data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-xl">
        <button
          onClick={() => navigate("/admin/campaigns")}
          className="mb-6 inline-flex items-center text-sm text-sky-600 hover:text-sky-800 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Campaigns
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">
          {isEditing ? "Edit Campaign" : "Add New Campaign"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={campaignForm.name}
              onChange={handleCampaignFormChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              name="organizationName"
              value={campaignForm.organizationName}
              onChange={handleCampaignFormChange}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
              placeholder="e.g., Green Initiative, EcoTech, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={campaignForm.description}
              onChange={handleCampaignFormChange}
              required
              rows={4}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
            />
          </div>

          {/* Location Information */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={campaignForm.latitude}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={campaignForm.longitude}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={campaignForm.address}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Please enter the full address for the campaign location.
              </p>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Campaign Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={campaignForm.startDate}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={campaignForm.endDate}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Goal (items) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="goal"
                value={campaignForm.goal}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                required
              />
            </div>

            {isEditing && (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={campaignForm.status}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Material Types <span className="text-red-500">*</span>
              </label>
              <div className="border border-slate-300 rounded-lg p-4 bg-white max-h-60 overflow-y-auto shadow-sm">
                {/* "All" option */}
                <div
                  className={`p-2.5 mb-3 rounded-lg flex items-center cursor-pointer ${
                    campaignForm.materialTypes.includes("All")
                      ? "bg-sky-100 border border-sky-300"
                      : "hover:bg-slate-50"
                  } ${
                    campaignForm.materialTypes.length > 0 &&
                    !campaignForm.materialTypes.includes("All")
                      ? "opacity-50"
                      : ""
                  }`}
                  onClick={() => handleMaterialTypeChange("All")}
                >
                  <div
                    className={`w-5 h-5 mr-3 flex items-center justify-center border rounded-md ${
                      campaignForm.materialTypes.includes("All")
                        ? "bg-sky-600 border-sky-600"
                        : "border-slate-400"
                    }`}
                  >
                    {campaignForm.materialTypes.includes("All") && (
                      <svg
                        className="w-3 h-3 text-white"
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
                  <span className="font-medium text-slate-800">
                    All Materials
                  </span>
                </div>

                {/* Individual material types */}
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${
                    campaignForm.materialTypes.includes("All")
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  {materialTypes.map((material) => (
                    <div
                      key={material}
                      className={`p-2.5 rounded-lg flex items-center cursor-pointer ${
                        campaignForm.materialTypes.includes(material) &&
                        !campaignForm.materialTypes.includes("All")
                          ? "bg-sky-50 border border-sky-200"
                          : "hover:bg-slate-50"
                      } ${
                        campaignForm.materialTypes.includes("All")
                          ? "pointer-events-none"
                          : ""
                      }`}
                      onClick={() =>
                        !campaignForm.materialTypes.includes("All") &&
                        handleMaterialTypeChange(material)
                      }
                    >
                      <div
                        className={`w-5 h-5 mr-3 flex items-center justify-center border rounded-md ${
                          campaignForm.materialTypes.includes(material) &&
                          !campaignForm.materialTypes.includes("All")
                            ? "bg-sky-600 border-sky-600"
                            : "border-slate-400"
                        }`}
                      >
                        {campaignForm.materialTypes.includes(material) &&
                          !campaignForm.materialTypes.includes("All") && (
                            <svg
                              className="w-3 h-3 text-white"
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
                        {material.charAt(0).toUpperCase() + material.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {campaignForm.materialTypes.length === 0 && (
                <p className="text-red-500 text-xs mt-2">
                  Please select at least one material type
                </p>
              )}
              {campaignForm.materialTypes.length > 0 &&
                !campaignForm.materialTypes.includes("All") && (
                  <p className="text-xs text-slate-500 mt-2">
                    Selected: {campaignForm.materialTypes.join(", ")}
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Campaign Image{" "}
                {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
              />
              {isEditing && currentCampaignId && (
                <p className="text-xs text-slate-500 mt-1">
                  Upload a new image only if you want to change the current one
                </p>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate("/admin/campaigns")}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium shadow-sm mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium shadow-sm flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isEditing ? "Update Campaign" : "Add Campaign"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCampaignModal;
