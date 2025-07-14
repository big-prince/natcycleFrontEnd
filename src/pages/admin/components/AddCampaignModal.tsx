import React, { useState, useEffect } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import CampaignApi from "../../../api/campaignApi";
import materialApi from "../../../api/materialApi";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

interface ICampaign {
  _id: string;
  name: string;
  description: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  material?: string;
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

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchCampaigns: () => void;
  campaignToEdit: ICampaign | null;
};

const AddCampaignModal = ({
  isModalOpen,
  setIsModalOpen,
  fetchCampaigns,
  campaignToEdit,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    material: "",
    goal: "",
    status: "active" as "active" | "completed" | "cancelled",
    image: null as File | null,
    latitude: "",
    longitude: "",
    address: "",
    organizationName: "",
  });

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

  // Set form data when a campaign is selected for editing
  useEffect(() => {
    if (campaignToEdit) {
      setCampaignForm({
        name: campaignToEdit.name,
        description: campaignToEdit.description,
        startDate: campaignToEdit.createdAt
          ? new Date(campaignToEdit.createdAt).toISOString().split("T")[0]
          : "",
        endDate: new Date(campaignToEdit.endDate).toISOString().split("T")[0],
        material: campaignToEdit.material || "",
        goal: campaignToEdit.goal.toString(),
        status: campaignToEdit.status,
        image: null,
        latitude: campaignToEdit.location?.coordinates
          ? campaignToEdit.location.coordinates[1].toString()
          : "",
        longitude: campaignToEdit.location?.coordinates
          ? campaignToEdit.location.coordinates[0].toString()
          : "",
        address: campaignToEdit.address || "",
        organizationName: campaignToEdit.organizationName || "",
      });
    } else {
      // Reset form if not editing
      setCampaignForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        material: "",
        goal: "",
        status: "active",
        image: null,
        latitude: "",
        longitude: "",
        address: "",
        organizationName: "",
      });
    }
  }, [campaignToEdit, isModalOpen]);

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

  // We're now using direct coordinate input instead of place selection

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !campaignForm.name ||
      !campaignForm.description ||
      !campaignForm.endDate ||
      !campaignForm.startDate ||
      !campaignForm.goal ||
      !campaignForm.latitude ||
      !campaignForm.longitude ||
      !campaignForm.address ||
      !campaignForm.material
    ) {
      toast.error(
        "Please fill in all required fields including location information"
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
      formData.append("material", campaignForm.material);
      formData.append("status", campaignForm.status);
      formData.append("latitude", campaignForm.latitude);
      formData.append("longitude", campaignForm.longitude);
      formData.append("address", campaignForm.address);

      // Only append organizationName if it exists
      if (campaignForm.organizationName) {
        formData.append("organizationName", campaignForm.organizationName);
      }

      // Add image to FormData if it exists
      // This will make it accessible via req.file on the backend
      if (campaignForm.image) {
        formData.append("file", campaignForm.image);
      }

      if (campaignToEdit) {
        // Update existing campaign
        await CampaignApi.updateCampaign(campaignToEdit._id, formData);
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

      // Reset form and close modal
      setCampaignForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        material: "",
        goal: "",
        status: "active",
        image: null,
        latitude: "",
        longitude: "",
        address: "",
        organizationName: "",
      });

      setIsModalOpen(false);
      fetchCampaigns();
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

  return (
    <div>
      <AlertDialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <AlertDialog.Content className="absolute top-1/2 left-1/2 p-6 w-full max-w-xl bg-white rounded-md transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <AlertDialog.Title className="text-2xl font-medium">
              {campaignToEdit ? "Edit Campaign" : "Add New Campaign"}
            </AlertDialog.Title>

            <AlertDialog.Cancel>
              <FaTimes className="text-gray-700 cursor-pointer" />
            </AlertDialog.Cancel>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={campaignForm.name}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                name="organizationName"
                value={campaignForm.organizationName}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Green Initiative, EcoTech, etc."
              />
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={campaignForm.latitude}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={campaignForm.longitude}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={campaignForm.address}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Please enter the full address for the campaign location.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={campaignForm.description}
                onChange={handleCampaignFormChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={campaignForm.endDate}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type <span className="text-red-500">*</span>
              </label>
              <select
                name="material"
                value={campaignForm.material}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Material Type</option>
                {materialTypes.map((material, index) => (
                  <option key={index} value={material}>
                    {material}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={campaignForm.startDate}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={campaignForm.endDate}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal (items) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="goal"
                value={campaignForm.goal}
                onChange={handleCampaignFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {campaignToEdit && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={campaignForm.status}
                  onChange={handleCampaignFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Image{" "}
                {!campaignToEdit && <span className="text-red-500">*</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {campaignToEdit && campaignToEdit.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Current image:</p>
                  <img
                    src={campaignToEdit.image.url}
                    alt="Current campaign image"
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a new image only if you want to change it
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : campaignToEdit ? (
                  "Update Campaign"
                ) : (
                  "Add Campaign"
                )}
              </button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </div>
  );
};

export default AddCampaignModal;
