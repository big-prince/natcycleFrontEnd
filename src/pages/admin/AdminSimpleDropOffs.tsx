/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import SimpleDropoffApi, { SimpleDropoff } from "../../api/simpleDropoffApi";
import { toast } from "react-toastify";
import materialApi from "../../api/materialApi";
import { FaCheck, FaTimes, FaFilter, FaTrash, FaImage } from "react-icons/fa";
import { MdVerified, MdPending } from "react-icons/md";

interface AdminSimpleDropoff extends Omit<SimpleDropoff, "user"> {
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

const AdminSimpleDropOffs = () => {
  const [dropoffs, setDropoffs] = useState<AdminSimpleDropoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [materialTypes, setMaterialTypes] = useState<string[]>([]);
  const [selectedDropoff, setSelectedDropoff] =
    useState<AdminSimpleDropoff | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    materialType: "",
    isVerified: "",
    userId: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch material types for filters
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

  // Fetch dropoffs
  const fetchDropoffs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const filtersToApply = {
          ...filters,
          isVerified:
            filters.isVerified === ""
              ? undefined
              : filters.isVerified === "true",
        };

        const response = await SimpleDropoffApi.adminGetDropoffs(
          page,
          pagination.limit,
          filtersToApply
        );

        setDropoffs(response.data.docs || response.data.data || []);
        setPagination({
          page: response.data.page || page,
          limit: response.data.limit || pagination.limit,
          total: response.data.totalDocs || response.data.total || 0,
          totalPages: response.data.totalPages || 1,
        });
      } catch (error: any) {
        console.error("Error fetching dropoffs:", error);
        const errorMessage =
          error.response?.data?.errors?.[0]?.message ||
          error.response?.data?.message ||
          "Failed to fetch dropoffs";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit]
  );

  // Effect to refetch when refreshKey changes
  useEffect(() => {
    fetchDropoffs(1);
  }, [fetchDropoffs, refreshKey]);

  useEffect(() => {
    fetchDropoffs(1);
  }, [fetchDropoffs]);

  // Refresh function to trigger component remount after location changes
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    fetchDropoffs(1);
  }, [fetchDropoffs]);

  // Listen for location changes from AdminSimpleDropOffLocations
  useEffect(() => {
    const handleLocationUpdate = () => {
      handleRefresh();
    };

    // Listen for custom events
    window.addEventListener("simpleLocationUpdated", handleLocationUpdate);

    return () => {
      window.removeEventListener("simpleLocationUpdated", handleLocationUpdate);
    };
  }, [handleRefresh]);

  // Handle verification
  const handleVerifyDropoff = async (
    id: string,
    isApproved: boolean,
    rejectionReason?: string
  ) => {
    try {
      await SimpleDropoffApi.adminVerifyDropoff(
        id,
        isApproved,
        rejectionReason
      );
      toast.success(
        `Dropoff ${isApproved ? "approved" : "rejected"} successfully`
      );
      fetchDropoffs(pagination.page);
    } catch (error: any) {
      console.error("Error verifying dropoff:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to verify dropoff";
      toast.error(errorMessage);
    }
  };

  // Handle bulk verification
  const handleBulkVerify = async (
    isApproved: boolean,
    rejectionReason?: string
  ) => {
    if (bulkSelected.length === 0) {
      toast.warning("No dropoffs selected");
      return;
    }

    try {
      await SimpleDropoffApi.adminBulkVerifyDropoffs(
        bulkSelected,
        isApproved,
        rejectionReason
      );
      toast.success(
        `${bulkSelected.length} dropoffs ${
          isApproved ? "approved" : "rejected"
        }`
      );
      setBulkSelected([]);
      fetchDropoffs(pagination.page);
    } catch (error: any) {
      console.error("Error bulk verifying:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to bulk verify dropoffs";
      toast.error(errorMessage);
    }
  };

  // Handle delete
  const handleDeleteDropoff = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this dropoff?")) {
      return;
    }

    try {
      await SimpleDropoffApi.adminDeleteDropoff(id);
      toast.success("Dropoff deleted successfully");
      fetchDropoffs(pagination.page);
    } catch (error: any) {
      console.error("Error deleting dropoff:", error);
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to delete dropoff";
      toast.error(errorMessage);
    }
  };

  // Toggle bulk selection
  const toggleBulkSelect = (id: string) => {
    setBulkSelected((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (dropoff: AdminSimpleDropoff) => {
    if (dropoff.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <MdVerified className="mr-1" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <MdPending className="mr-1" />
          Pending
        </span>
      );
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Simple Drop-Offs Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and verify simple drop-off submissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <FaFilter className="mr-2 text-slate-600" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              Verification Status
            </label>
            <select
              value={filters.isVerified}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, isVerified: e.target.value }))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            >
              <option value="">All Status</option>
              <option value="true">Verified</option>
              <option value="false">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, userId: e.target.value }))
              }
              placeholder="Search by user ID"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sky-800 font-medium">
              {bulkSelected.length} item(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleBulkVerify(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <FaCheck className="inline mr-1" />
                Approve Selected
              </button>
              <button
                onClick={() => {
                  const reason = prompt("Enter rejection reason (optional):");
                  handleBulkVerify(false, reason || undefined);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
              >
                <FaTimes className="inline mr-1" />
                Reject Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mr-3"></div>
            <p className="text-slate-600">Loading simple drop-offs...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-10">
          <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg border border-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && dropoffs.length === 0 && (
        <div className="text-center py-10">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No simple drop-offs found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No drop-offs match your current filters.
          </p>
        </div>
      )}

      {/* Dropoffs Table */}
      {!loading && !error && dropoffs.length > 0 && (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBulkSelected(dropoffs.map((d) => d._id));
                      } else {
                        setBulkSelected([]);
                      }
                    }}
                    checked={
                      dropoffs.length > 0 &&
                      bulkSelected.length === dropoffs.length
                    }
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Material
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  CU Earned
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {dropoffs.map((dropoff) => (
                <tr
                  key={dropoff._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={bulkSelected.includes(dropoff._id)}
                      onChange={() => toggleBulkSelect(dropoff._id)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {dropoff.user.username}
                      </div>
                      <div className="text-sm text-slate-600">
                        {dropoff.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {dropoff.simpleDropOffLocation.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {dropoff.simpleDropOffLocation.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sky-100 text-sky-800">
                      {dropoff.materialType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {dropoff.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {dropoff.cuEarned.toFixed(1)} CU
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(dropoff)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(dropoff.createdAt.toString())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDropoff(dropoff);
                          setShowImageModal(true);
                        }}
                        className="text-sky-600 hover:text-sky-800 transition-colors p-1"
                        title="View Proof Image"
                      >
                        <FaImage />
                      </button>

                      {!dropoff.isVerified && (
                        <>
                          <button
                            onClick={() =>
                              handleVerifyDropoff(dropoff._id, true)
                            }
                            className="text-green-600 hover:text-green-800 transition-colors p-1"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt(
                                "Enter rejection reason (optional):"
                              );
                              handleVerifyDropoff(
                                dropoff._id,
                                false,
                                reason || undefined
                              );
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteDropoff(dropoff._id)}
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
                  onClick={() => fetchDropoffs(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchDropoffs(pagination.page + 1)}
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
                        onClick={() => fetchDropoffs(page)}
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

      {/* Image Modal */}
      {showImageModal && selectedDropoff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Proof Image</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <img
                src={selectedDropoff.proofPicture.url}
                alt="Proof of dropoff"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            <div className="text-sm text-slate-600">
              <p>
                <strong>Location:</strong>{" "}
                {selectedDropoff.simpleDropOffLocation.name}
              </p>
              <p>
                <strong>Material:</strong> {selectedDropoff.materialType}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedDropoff.quantity}
              </p>
              <p>
                <strong>User:</strong> {selectedDropoff.user.username}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {formatDate(selectedDropoff.createdAt.toString())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSimpleDropOffs;
