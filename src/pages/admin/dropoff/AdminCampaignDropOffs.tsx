import { useState, useEffect } from "react";
import { FaChevronLeft, FaFilter, FaSearch, FaDownload } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import CampaignApi from "../../../api/campaignApi";
import { toast } from "react-toastify";
import DropOffApi from "../../../api/dropOffApi";

interface ICampaign {
  id: string;
  name: string;
  description: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
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
}

interface IDropOff {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

const AdminCampaignDropOffs = () => {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [dropOffs, setDropOffs] = useState<IDropOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDropOffs, setTotalDropOffs] = useState(0);

  const fetchCampaign = async () => {
    if (!campaignId) {
      console.log("No campaign ID provided");
      return;
    }

    console.log("We are running here");
    try {
      const response = await CampaignApi.getCampaign(campaignId);
      setCampaign(response.data.data.campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Failed to load campaign");
    }
  };

  const fetchDropOffs = async () => {
    if (!campaignId) {
      console.log("No campaign ID provided");
      return;
    }

    setLoading(true);

    try {
      // Use CampaignApi instead of DropOffApi for campaign dropoffs
      const response = await CampaignApi.getDropoffsForCampaign(campaignId, {
        page,
        limit: 10,
        status: filter !== "all" ? filter : undefined,
        search: searchTerm || undefined,
      });

      setDropOffs(response.data.data.docs);
      setTotalPages(response.data.data.totalPages);
      setTotalDropOffs(response.data.data.totalDocs);
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

  const handleExportCSV = async () => {
    if (!campaignId) return;

    try {
      // Use CampaignApi for exporting dropoffs
      const response = await CampaignApi.exportCampaignDropOffs(campaignId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `campaign-${campaignId}-dropoffs.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting drop-offs:", error);
      toast.error("Failed to export drop-offs");
    }
  };

  useEffect(() => {
    console.log(campaignId, "");
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  useEffect(() => {
    fetchDropOffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, page, filter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDropOffs();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="pb-10">
      <div className="mb-6 flex items-center">
        <Link
          to={`/admin/campaigns/${campaignId}`}
          className="text-purple-600 hover:text-purple-800 flex items-center mr-4"
        >
          <FaChevronLeft className="mr-1" /> Back to Campaign
        </Link>
        <h1 className="text-2xl font-bold">Campaign Drop-offs</h1>
      </div>

      {campaign && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
          <h2 className="text-lg font-bold text-purple-800 mb-1">
            {campaign.name}
          </h2>
          <div className="text-sm text-gray-600">
            <span className="mr-4">Goal: {campaign.goal} items</span>
            <span className="mr-4">
              Progress: {campaign.progress} items (
              {Math.round((campaign.progress / campaign.goal) * 100)}%)
            </span>
            <span>Total Drop-offs: {totalDropOffs}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold mb-4 md:mb-0">All Drop-offs</h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by user or material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative w-full md:w-48">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FaDownload className="mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : dropOffs.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-2">No drop-offs found</p>
            <p className="text-sm text-gray-400">
              {searchTerm || filter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "There are no drop-offs for this campaign yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dropOffs.map((dropOff) => (
                  <tr key={dropOff.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {dropOff.user.firstName} {dropOff.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dropOff.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dropOff.materialType}
                      </div>
                      {dropOff.description && (
                        <div className="text-xs text-gray-500">
                          {dropOff.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {dropOff.quantity} items
                      </div>
                      {dropOff.weight && (
                        <div className="text-xs text-gray-500">
                          {dropOff.weight} kg
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex -space-x-2">
                        {dropOff.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Drop-off image ${index + 1}`}
                            className="h-8 w-8 rounded-full border border-white object-cover"
                          />
                        ))}
                        {dropOff.images.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full border border-white bg-gray-200 text-xs text-gray-500">
                            +{dropOff.images.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(dropOff.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          dropOff.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : dropOff.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {dropOff.status.charAt(0).toUpperCase() +
                          dropOff.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {dropOff.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(dropOff.id, "verified")
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(dropOff.id, "rejected")
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <Link
                        to={`/admin/dropoffs/${dropOff.id}`}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-md mr-2 bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        pageNum === page
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-md ml-2 bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCampaignDropOffs;
