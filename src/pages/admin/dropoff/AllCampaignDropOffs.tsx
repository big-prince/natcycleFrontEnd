import { useState, useEffect } from "react";
import { FaFilter, FaSearch, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import DropOffApi from "../../../api/dropOffApi";
import CampaignApi from "../../../api/campaignApi";
import { toast } from "react-toastify";

interface IDropOff {
  id: string;
  _id?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  description?: string;
  quantity: number;
  weight?: number;
  materialType: string;
  images: {
    public_id: string;
    url: string;
  }[];
  status: "pending" | "verified" | "rejected";
  locationId: string;
  campaignId?: string;
  campaign?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AllCampaignDropOffs = () => {
  const [dropOffs, setDropOffs] = useState<IDropOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDropOffs, setTotalDropOffs] = useState(0);

  const fetchDropOffs = async () => {
    setLoading(true);

    try {
      // We use adminGetDropOffs to get all dropoffs
      const response = await CampaignApi.getCampaignDropOffs({
        page,
        limit: 10,
        status: filter !== "all" ? filter : undefined,
        search: searchTerm || undefined,
        type: "campaign",
      });
      console.log("🚀 ~ fetchDropOffs ~ response:", response);

      setDropOffs(response.data.data.dropOffs || []);
      setTotalPages(response.data.data.pagination.totalPages || 1);
      setTotalDropOffs(response.data.data.pagination.totalDropOffs || 0);
    } catch (error) {
      console.error("Error fetching drop-offs:", error);
      toast.error("Failed to load drop-offs");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    dropOffId: string,
    status: "verified" | "rejected"
  ) => {
    try {
      await DropOffApi.updateDropOffStatus(dropOffId, status);
      toast.success(
        `Drop-off ${
          status === "verified" ? "verified" : "rejected"
        } successfully`
      );
      fetchDropOffs();
    } catch (error) {
      console.error("Error updating drop-off status:", error);
      toast.error("Failed to update drop-off status");
    }
  };

  useEffect(() => {
    fetchDropOffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDropOffs();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="pb-10">
      <div className="mb-6 flex items-center">
        <h1 className="text-2xl font-bold">All Campaign Drop-offs</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold mb-4 md:mb-0">
            Drop-offs Across All Campaigns
          </h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by user or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative w-full md:w-40">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <FaSpinner className="animate-spin text-2xl text-sky-600" />
          </div>
        ) : dropOffs.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No drop-offs found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Campaign</th>
                    <th className="py-3 px-4 text-left">Material Type</th>
                    <th className="py-3 px-4 text-left">Quantity</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dropOffs.map((dropOff) => (
                    <tr key={dropOff.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        {dropOff.user
                          ? `${dropOff.user.firstName} ${dropOff.user.lastName}`
                          : "Unknown User"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {dropOff.campaign ? (
                          <Link
                            to={`/admin/campaigns/${dropOff.campaignId}`}
                            className="text-sky-600 hover:text-sky-800"
                          >
                            {dropOff.campaign.name}
                          </Link>
                        ) : (
                          <span className="text-gray-500">No Campaign</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {dropOff.materialType}
                      </td>
                      <td className="py-3 px-4 text-sm">{dropOff.quantity}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dropOff.status === "verified"
                              ? "bg-green-100 text-green-800"
                              : dropOff.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {dropOff.status.charAt(0).toUpperCase() +
                            dropOff.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(dropOff.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/dropoffs/${dropOff._id}`}
                            className="px-2 py-1 bg-sky-600 text-white rounded text-xs hover:bg-sky-700"
                          >
                            View
                          </Link>
                          {dropOff.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(dropOff.id, "verified")
                                }
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(dropOff.id, "rejected")
                                }
                                className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * 10 + 1} to{" "}
                {Math.min(page * 10, totalDropOffs)} of {totalDropOffs}{" "}
                drop-offs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded ${
                    page === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-sky-600 text-white hover:bg-sky-700"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded ${
                    page === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-sky-600 text-white hover:bg-sky-700"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllCampaignDropOffs;
