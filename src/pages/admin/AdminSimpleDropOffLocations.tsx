/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import SimpleDropoffApi, {
  SimpleDropoffLocation,
} from "../../api/simpleDropoffApi";
import { toast } from "react-toastify";
import materialApi from "../../api/materialApi";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { MdVerified, MdPending } from "react-icons/md";

const AdminSimpleDropOffLocations = () => {
  const [locations, setLocations] = useState<SimpleDropoffLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<SimpleDropoffLocation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
    materialType: "",
    acceptedSubtypes: "",
    organizationName: "",
    isActive: true,
    verificationRequired: false,
    maxItemsPerDropOff: "10",
    operatingHours: "",
    contactNumber: "",
  });
  const [filters, setFilters] = useState({
    materialType: "",
    isActive: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch material types
  useEffect(() => {
    const fetchMaterialTypes = async () => {
      try {
        const response = await materialApi.getMaterialsCategory();
        setMaterialTypes(response.data.data.primaryTypes || []);
      } catch (error) {
        console.error("Error fetching material types:", error);
      }
    };
    fetchMaterialTypes();
  }, []);

  // Fetch locations
  const fetchLocations = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const filtersToApply = {
          ...filters,
          isActive:
            filters.isActive === "" ? undefined : filters.isActive === "true",
        };

        const response = await SimpleDropoffApi.adminGetLocations(
          page,
          pagination.limit,
          filtersToApply
        );

        setLocations(response.data.data);
        setPagination({
          page: response.data.page || page,
          limit: response.data.limit || pagination.limit,
          total: response.data.totalDocs || response.data.total || 0,
          totalPages: response.data.totalPages || 1,
        });
      } catch (error: any) {
        console.error("Error fetching locations:", error);
        const errorMessage =
          error.response?.data?.errors?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to fetch locations";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  useEffect(() => {
    fetchLocations(1);
  }, [fetchLocations]);

  // Effect to refetch when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      fetchLocations(1);
    }
  }, [refreshKey, fetchLocations]);

  // Refresh function to trigger component remount
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    fetchLocations(1);
  }, [fetchLocations]);

  // Trigger refresh after successful operations
  const triggerRefresh = () => {
    handleRefresh();
    // Also dispatch event for AdminSimpleDropOffs component
    window.dispatchEvent(new CustomEvent("simpleLocationUpdated"));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const locationData = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        address: formData.address,
        materialType: formData.materialType,
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

      if (editingLocation) {
        await SimpleDropoffApi.adminUpdateLocation(
          editingLocation.id,
          locationData
        );
        toast.success("Location updated successfully");
      } else {
        await SimpleDropoffApi.adminCreateLocation(locationData);
        toast.success("Location created successfully");
      }

      setShowModal(false);
      resetForm();
      triggerRefresh(); // This will refresh both this component and AdminSimpleDropOffs
    } catch (error: any) {
      console.error("Error saving location:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to save location";
      toast.error(errorMessage);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      latitude: "",
      longitude: "",
      address: "",
      materialType: "",
      acceptedSubtypes: "",
      organizationName: "",
      isActive: true,
      verificationRequired: false,
      maxItemsPerDropOff: "10",
      operatingHours: "",
      contactNumber: "",
    });
    setEditingLocation(null);
  };

  // Handle edit
  const handleEdit = (location: SimpleDropoffLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      latitude: location.location.coordinates[1].toString(),
      longitude: location.location.coordinates[0].toString(),
      address: location.address || "",
      materialType: location.materialType,
      acceptedSubtypes: location.acceptedSubtypes?.join(", ") || "",
      organizationName: location.organizationName || "",
      isActive: location.isActive,
      verificationRequired: location.verificationRequired,
      maxItemsPerDropOff: location.maxItemsPerDropOff.toString(),
      operatingHours: location.operatingHours || "",
      contactNumber: location.contactNumber || "",
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      await SimpleDropoffApi.adminDeleteLocation(id);
      toast.success("Location deleted successfully");
      triggerRefresh();
    } catch (error: any) {
      console.error("Error deleting location:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to delete location";
      toast.error(errorMessage);
    }
  };

  // Handle verify location
  const handleVerify = async (id: string) => {
    try {
      await SimpleDropoffApi.adminVerifyLocation(id);
      toast.success("Location verified successfully");
      triggerRefresh();
    } catch (error: any) {
      console.error("Error verifying location:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to verify location";
      toast.error(errorMessage);
    }
  };

  // Get status badge
  const getStatusBadge = (location: SimpleDropoffLocation) => {
    if (location.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <MdVerified className="mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <MdPending className="mr-1" />
          Inactive
        </span>
      );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Simple Drop-Off Locations
          </h1>
          <p className="text-slate-600 mt-1">
            Manage simple drop-off location collection points
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors flex items-center shadow-lg font-medium"
        >
          <FaPlus className="mr-2" />
          Add Location
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-slate-600" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Material Type
            </label>
            <select
              value={filters.materialType}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  materialType: e.target.value,
                }))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            >
              <option value="">All Types</option>
              {materialTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, isActive: e.target.value }))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mr-3"></div>
            <p className="text-slate-600">Loading locations...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && locations.length === 0 && (
        <div className="text-center py-10">
          <FaMapMarkerAlt className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            No locations found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            No locations match your current filters.
          </p>
        </div>
      )}

      {/* Locations Table */}
      {!loading && locations.length > 0 && (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Material Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Max Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {locations.map((location) => (
                <tr
                  key={location.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {location.name}
                      </div>
                      <div className="text-sm text-slate-600 flex items-center">
                        <FaMapMarkerAlt className="mr-1" />
                        {location.address}
                      </div>
                      <div className="text-xs text-slate-400">
                        {location.location.coordinates[1].toFixed(4)},{" "}
                        {location.location.coordinates[0].toFixed(4)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800">
                      {location.materialType}
                    </span>
                    {location.acceptedSubtypes &&
                      location.acceptedSubtypes.length > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          Subtypes:{" "}
                          {location.acceptedSubtypes.slice(0, 2).join(", ")}
                          {location.acceptedSubtypes.length > 2 && "..."}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {location.organizationName || "N/A"}
                    </div>
                    {location.contactNumber && (
                      <div className="text-sm text-slate-500">
                        {location.contactNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {location.maxItemsPerDropOff}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(location)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(location.createdAt.toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(location)}
                        className="text-sky-600 hover:text-sky-800 transition-colors p-1"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          console.log(location);
                          handleVerify(location.id);
                        }}
                        className="text-green-600 hover:text-green-800 transition-colors p-1"
                        title="Verify"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchLocations(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchLocations(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchLocations(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          page === pagination.page
                            ? "z-10 bg-sky-50 border-sky-500 text-sky-600"
                            : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material Type *
                  </label>
                  <select
                    value={formData.materialType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        materialType: e.target.value,
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {materialTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  placeholder="e.g., bottles, containers, bags"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.verificationRequired}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        verificationRequired: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Verification Required
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingLocation ? "Update" : "Create"} Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSimpleDropOffLocations;
