import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CampaignApi from "../../../api/campaignApi";
import materialApi from "../../../api/materialApi";
import dropOffLocationApi from "../../../api/dropOffLocationApi";
import simpleDropoffApi from "../../../api/simpleDropoffApi";
import {
  FaSave,
  FaArrowLeft,
  FaPlus,
  FaTimes,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";

// Types
interface LocationOption {
  id: string;
  name: string;
  address: string;
  type: "simple" | "dropoff";
  materialType?: string;
  bulkMaterialTypes?: string[];
  primaryMaterialType?: string;
  location?: {
    coordinates: number[];
  };
}

interface SimpleDropoffLocationData {
  id: string;
  name: string;
  address: string;
  materialType?: string;
  bulkMaterialTypes?: string[];
  location?: {
    coordinates: number[];
  };
}

interface DropoffLocationData {
  _id: string;
  name: string;
  address: string;
  primaryMaterialType?: string;
  location?: {
    coordinates: number[];
  };
}

interface CampaignLocation {
  type: "linked" | "custom";
  simpleDropoffLocationId?: string;
  dropoffLocationId?: string;
  customLocation?: {
    coordinates: number[];
    name: string;
    address: string;
  };
  // For UI purposes
  selectedLocation?: LocationOption;
}

interface PopulatedLocation {
  simpleDropoffLocationId?:
    | string
    | { _id: string; id: string; name: string; address: string };
  dropoffLocationId?:
    | string
    | { _id: string; id: string; name: string; address: string };
  customLocation?: {
    coordinates: number[];
    name: string;
    address: string;
  };
}

interface CampaignData {
  id: string;
  name: string;
  description: string;
  endDate?: string; // Made optional for indefinite campaigns
  isIndefinite?: boolean; // Added isIndefinite property
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
  locations?: PopulatedLocation[]; // Updated to handle populated location references
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
    isIndefinite: false,
    materialTypes: [] as string[],
    goal: "",
    status: "active" as "active" | "completed" | "cancelled",
    image: null as File | null,
    organizationName: "",
    locations: [
      {
        type: "custom" as "linked" | "custom",
        customLocation: {
          coordinates: [0, 0],
          name: "",
          address: "",
        },
      },
    ] as CampaignLocation[],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(
    null
  );

  // Available locations state
  const [availableSimpleLocations, setAvailableSimpleLocations] = useState<
    SimpleDropoffLocationData[]
  >([]);
  const [availableDropoffLocations, setAvailableDropoffLocations] = useState<
    DropoffLocationData[]
  >([]);

  // Fetch material types and load locations
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

    const loadAllLocations = async () => {
      try {
        const [simpleRes, dropoffRes] = await Promise.all([
          simpleDropoffApi.searchLocations({ limit: 1000 }),
          dropOffLocationApi.getDropOffLocations(),
        ]);

        setAvailableSimpleLocations(simpleRes.data.data || []);
        setAvailableDropoffLocations(dropoffRes.data.data || []);
      } catch (error) {
        console.error("Error loading locations:", error);
        toast.error("Failed to load locations");
      }
    };

    fetchMaterialTypes();
    loadAllLocations();
  }, []);

  // Load campaign data for editing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");
    const campaignId = id || queryId;

    if (campaignId) {
      setIsEditing(true);
      setCurrentCampaignId(campaignId);
      setLoadingPage(true);

      CampaignApi.getCampaign(campaignId)
        .then((res) => {
          const campaignData: CampaignData = res.data.data.campaign;

          // Validate that we have the required campaign data
          if (!campaignData || !campaignData.id) {
            throw new Error("Invalid campaign data received");
          }

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

          // Process locations
          let processedLocations: CampaignLocation[] = [];
          if (campaignData.locations && Array.isArray(campaignData.locations)) {
            processedLocations = campaignData.locations.map(
              (loc: PopulatedLocation) => {
                if (loc.simpleDropoffLocationId) {
                  // Extract the actual ID if it's a populated object
                  const locationId =
                    typeof loc.simpleDropoffLocationId === "object"
                      ? loc.simpleDropoffLocationId._id ||
                        loc.simpleDropoffLocationId.id
                      : loc.simpleDropoffLocationId;

                  return {
                    type: "linked" as const,
                    simpleDropoffLocationId: locationId,
                  };
                } else if (loc.dropoffLocationId) {
                  // Extract the actual ID if it's a populated object
                  const locationId =
                    typeof loc.dropoffLocationId === "object"
                      ? loc.dropoffLocationId._id || loc.dropoffLocationId.id
                      : loc.dropoffLocationId;

                  return {
                    type: "linked" as const,
                    dropoffLocationId: locationId,
                  };
                } else if (loc.customLocation) {
                  return {
                    type: "custom" as const,
                    customLocation: {
                      coordinates: loc.customLocation.coordinates || [0, 0],
                      name: loc.customLocation.name || "",
                      address: loc.customLocation.address || "",
                    },
                  };
                }
                return {
                  type: "custom" as const,
                  customLocation: {
                    coordinates: [0, 0],
                    name: "",
                    address: "",
                  },
                };
              }
            );
          } else {
            // Handle legacy single location
            processedLocations = [
              {
                type: "custom" as const,
                customLocation: {
                  coordinates: campaignData.location?.coordinates || [0, 0],
                  name: campaignData.name || "",
                  address: campaignData.address || "",
                },
              },
            ];
          }

          setCampaignForm({
            name: campaignData.name || "",
            description: campaignData.description || "",
            startDate: campaignData.createdAt
              ? new Date(campaignData.createdAt).toISOString().split("T")[0]
              : "",
            endDate: campaignData.endDate
              ? new Date(campaignData.endDate).toISOString().split("T")[0]
              : "",
            isIndefinite:
              !campaignData.endDate || Boolean(campaignData.isIndefinite),
            materialTypes: materialTypesArray,
            goal: (campaignData.goal || 0).toString(),
            status: campaignData.status || "active",
            image: null,
            organizationName: campaignData.organizationName || "",
            locations:
              processedLocations.length > 0
                ? processedLocations
                : [
                    {
                      type: "custom" as const,
                      customLocation: {
                        coordinates: [0, 0],
                        name: "",
                        address: "",
                      },
                    },
                  ],
          });
        })
        .catch((err) => {
          console.error("Failed to load campaign data for editing:", err);
          console.error("Error details:", err.response?.data || err.message);

          let errorMessage = "Failed to load campaign data for editing.";
          if (err.response?.status === 404) {
            errorMessage = "Campaign not found.";
          } else if (err.response?.status === 401) {
            errorMessage = "Unauthorized. Please log in again.";
          } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }

          toast.error(errorMessage);
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
        isIndefinite: false,
        materialTypes: [],
        goal: "",
        status: "active",
        image: null,
        organizationName: "",
        locations: [
          {
            type: "custom",
            customLocation: {
              coordinates: [0, 0],
              name: "",
              address: "",
            },
          },
        ],
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

  // Location management functions
  const addLocation = () => {
    setCampaignForm({
      ...campaignForm,
      locations: [
        ...campaignForm.locations,
        {
          type: "custom",
          customLocation: {
            coordinates: [0, 0],
            name: "",
            address: "",
          },
        },
      ],
    });
  };

  const removeLocation = (index: number) => {
    if (campaignForm.locations.length > 1) {
      setCampaignForm({
        ...campaignForm,
        locations: campaignForm.locations.filter((_, i) => i !== index),
      });
    }
  };

  const updateLocation = (
    index: number,
    updates: Partial<CampaignLocation>
  ) => {
    setCampaignForm({
      ...campaignForm,
      locations: campaignForm.locations.map((loc, i) =>
        i === index ? { ...loc, ...updates } : loc
      ),
    });
  };

  const selectExistingLocation = (
    index: number,
    locationId: string,
    locationType: "simple" | "dropoff"
  ) => {
    if (locationType === "simple") {
      updateLocation(index, {
        type: "linked",
        simpleDropoffLocationId: locationId,
        dropoffLocationId: undefined,
        customLocation: undefined,
      });
    } else {
      updateLocation(index, {
        type: "linked",
        dropoffLocationId: locationId,
        simpleDropoffLocationId: undefined,
        customLocation: undefined,
      });
    }
  };

  const getSelectedLocationInfo = (location: CampaignLocation) => {
    if (location.type === "linked") {
      if (location.simpleDropoffLocationId) {
        const found = availableSimpleLocations.find(
          (loc) => loc.id === location.simpleDropoffLocationId
        );
        return found
          ? { name: found.name, address: found.address, tag: "Simple" }
          : null;
      }
      if (location.dropoffLocationId) {
        const found = availableDropoffLocations.find(
          (loc) => loc._id === location.dropoffLocationId
        );
        return found
          ? { name: found.name, address: found.address, tag: "Centre" }
          : null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted. Current formData:", campaignForm);

    if (
      !campaignForm.name ||
      !campaignForm.description ||
      (!campaignForm.isIndefinite && !campaignForm.endDate) ||
      !campaignForm.startDate ||
      !campaignForm.goal ||
      campaignForm.materialTypes.length === 0 ||
      campaignForm.locations.length === 0
    ) {
      toast.error(
        "Please fill in all required fields including location information and material types"
      );
      return;
    }

    // Validate locations
    for (const location of campaignForm.locations) {
      if (location.type === "custom") {
        if (
          !location.customLocation?.coordinates ||
          location.customLocation.coordinates[0] === 0 ||
          location.customLocation.coordinates[1] === 0 ||
          !location.customLocation.address
        ) {
          toast.error(
            "Please fill in all custom location details (coordinates and address)"
          );
          return;
        }
      } else if (location.type === "linked") {
        if (!location.simpleDropoffLocationId && !location.dropoffLocationId) {
          toast.error("Please select a location for all linked locations");
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Create FormData object to properly handle file uploads
      const formData = new FormData();

      // Add all form fields to FormData
      formData.append("name", campaignForm.name);
      formData.append("description", campaignForm.description);
      formData.append("startDate", campaignForm.startDate);
      formData.append("isIndefinite", campaignForm.isIndefinite.toString());

      // Only add endDate if the campaign is not indefinite
      if (!campaignForm.isIndefinite && campaignForm.endDate) {
        formData.append("endDate", campaignForm.endDate);
      }

      formData.append("goal", campaignForm.goal);

      campaignForm.materialTypes.forEach((materialType) => {
        formData.append("materialTypes", materialType);
      });

      // Log materialTypes for debugging
      console.log("Material Types being sent:", campaignForm.materialTypes);

      formData.append("status", campaignForm.status);

      // Add locations array
      const locationsToSend = campaignForm.locations.map((loc) => {
        if (loc.type === "linked") {
          return {
            ...(loc.simpleDropoffLocationId && {
              simpleDropoffLocationId: loc.simpleDropoffLocationId,
            }),
            ...(loc.dropoffLocationId && {
              dropoffLocationId: loc.dropoffLocationId,
            }),
          };
        } else {
          return {
            customLocation: {
              type: "Point",
              coordinates: loc.customLocation!.coordinates,
              address: loc.customLocation!.address,
            },
          };
        }
      });

      console.log(
        "🚀 Locations being sent to backend:",
        JSON.stringify(locationsToSend, null, 2)
      );

      formData.append("locations", JSON.stringify(locationsToSend));

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
        console.log("Image check - campaignForm.image:", campaignForm.image);
        console.log("Image type:", typeof campaignForm.image);
        console.log("Image name:", campaignForm.image?.name);

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

            {/* Locations Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Locations *
                </label>
                <button
                  type="button"
                  onClick={addLocation}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Location
                </button>
              </div>

              {campaignForm.locations.map((location, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-700">
                      Location {index + 1}
                    </h4>
                    {campaignForm.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <FaTimes className="mr-1" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className={`px-3 py-1 text-sm rounded-md ${
                        location.type === "linked"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() => updateLocation(index, { type: "linked" })}
                    >
                      <FaMapMarkerAlt className="mr-1 inline" /> Link Existing
                      Location
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 text-sm rounded-md ${
                        location.type === "custom"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                      onClick={() =>
                        updateLocation(index, {
                          type: "custom",
                          customLocation: {
                            coordinates: [0, 0],
                            name: "",
                            address: "",
                          },
                        })
                      }
                    >
                      Custom Location
                    </button>
                  </div>

                  {location.type === "linked" && (
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Simple Dropoff Locations
                        </label>
                        <select
                          value={location.simpleDropoffLocationId || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              selectExistingLocation(
                                index,
                                e.target.value,
                                "simple"
                              );
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a Simple Location</option>
                          {availableSimpleLocations.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name} - {loc.address} [Simple]
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Centre Dropoff Locations
                        </label>
                        <select
                          value={location.dropoffLocationId || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              selectExistingLocation(
                                index,
                                e.target.value,
                                "dropoff"
                              );
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a Centre Location</option>
                          {availableDropoffLocations.map((loc) => (
                            <option key={loc._id} value={loc._id}>
                              {loc.name} - {loc.address} [Centre]
                            </option>
                          ))}
                        </select>
                      </div>

                      {(location.simpleDropoffLocationId ||
                        location.dropoffLocationId) && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          {(() => {
                            const info = getSelectedLocationInfo(location);
                            return info ? (
                              <div>
                                <div className="font-medium text-green-800">
                                  {info.name}
                                </div>
                                <div className="text-sm text-green-600">
                                  {info.address}
                                </div>
                                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block mt-1">
                                  {info.tag}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {location.type === "custom" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Location Address *"
                        value={location.customLocation?.address || ""}
                        onChange={(e) =>
                          updateLocation(index, {
                            ...location,
                            customLocation: {
                              ...location.customLocation!,
                              address: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude *"
                          value={location.customLocation?.coordinates[1] || ""}
                          onChange={(e) =>
                            updateLocation(index, {
                              ...location,
                              customLocation: {
                                ...location.customLocation!,
                                coordinates: [
                                  location.customLocation?.coordinates[0] || 0,
                                  parseFloat(e.target.value) || 0,
                                ],
                              },
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude *"
                          value={location.customLocation?.coordinates[0] || ""}
                          onChange={(e) =>
                            updateLocation(index, {
                              ...location,
                              customLocation: {
                                ...location.customLocation!,
                                coordinates: [
                                  parseFloat(e.target.value) || 0,
                                  location.customLocation?.coordinates[1] || 0,
                                ],
                              },
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
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

              {/* Indefinite Campaign Checkbox */}
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isIndefinite"
                    checked={campaignForm.isIndefinite}
                    onChange={(e) =>
                      setCampaignForm((prev) => ({
                        ...prev,
                        isIndefinite: e.target.checked,
                        endDate: e.target.checked ? "" : prev.endDate,
                      }))
                    }
                    className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Make this campaign indefinite (no end date)
                  </span>
                </label>
              </div>

              {!campaignForm.isIndefinite && (
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
                    required={!campaignForm.isIndefinite}
                  />
                </div>
              )}
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
