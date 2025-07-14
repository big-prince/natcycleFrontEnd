import { useEffect, useState } from "react";
import CampaignApi from "../../api/campaignApi";
import {
  FaEdit,
  FaChevronLeft,
  FaExclamationTriangle,
  FaUsers,
  FaBoxOpen,
  FaAward,
  FaBox,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AddCampaignModal from "./components/AddCampaignModal";

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

interface ICampaignUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contributions: number;
  totalDropoffs: number;
  lastContribution?: string;
}

const AdminCampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaignDetails, setCampaignDetails] = useState<ICampaign | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [contributors, setContributors] = useState<ICampaignUser[]>([]);
  const [pickUpCount, setPickUpCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCampaignDetails = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const res = await CampaignApi.getCampaign(id);
      setCampaignDetails(res.data.data.campaign);

      // After getting campaign details, fetch contributors
      fetchContributors(res.data.data.campaign._id);
    } catch (err) {
      console.error("Error fetching campaign details:", err);
      toast.error("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async (campaignId: string) => {
    try {
      const res = await CampaignApi.getContributors(campaignId);
      setContributors(res.data.data.users);
      setPickUpCount(res.data.data.pickupCount);
    } catch (err) {
      console.error("Error fetching contributors:", err);
      toast.error("Failed to load contributors");
    }
  };

  const handleEditCampaign = () => {
    setIsModalOpen(true);
  };

  const calculateProgress = (goal: number, progress: number) => {
    if (!goal || goal <= 0) return 0;
    const percentage = (progress / goal) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  const handleStatusUpdate = async (
    newStatus: "active" | "completed" | "cancelled"
  ) => {
    if (!campaignDetails || !id) return;

    try {
      await CampaignApi.updateCampaign(id, { status: newStatus });
      toast.success(`Campaign marked as ${newStatus}`);
      fetchCampaignDetails();
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast.error("Failed to update campaign status");
    }
  };

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!campaignDetails) {
    return (
      <div className="p-8 text-center">
        <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
        <p className="mb-4">
          The campaign you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/admin/campaigns")}
          className="px-4 py-2 bg-purple-600 text-white rounded-md"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-6 flex items-center">
        <Link
          to="/admin/campaigns"
          className="text-purple-600 hover:text-purple-800 flex items-center mr-4"
        >
          <FaChevronLeft className="mr-1" /> Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold">Campaign Details</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3 mb-6 lg:mb-0 lg:pr-6">
            {campaignDetails.image?.url ? (
              <img
                src={campaignDetails.image.url}
                alt={campaignDetails.name}
                className="w-full h-64 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">No image available</p>
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                Campaign Status
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaignDetails.status === "active"
                      ? "bg-green-100 text-green-800 border-2 border-green-500"
                      : "bg-gray-100 text-gray-600 hover:bg-green-50"
                  }`}
                  onClick={() => handleStatusUpdate("active")}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaignDetails.status === "completed"
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-500"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                  }`}
                  onClick={() => handleStatusUpdate("completed")}
                >
                  Completed
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaignDetails.status === "cancelled"
                      ? "bg-red-100 text-red-800 border-2 border-red-500"
                      : "bg-gray-100 text-gray-600 hover:bg-red-50"
                  }`}
                  onClick={() => handleStatusUpdate("cancelled")}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{campaignDetails.name}</h2>{" "}
              <button
                onClick={handleEditCampaign}
                className="px-3 py-1 bg-blue-600 text-white rounded-md flex items-center text-sm hover:bg-blue-700 mr-2"
              >
                <FaEdit className="mr-1" /> Edit
              </button>
              <Link
                to={`/admin/campaign/${campaignDetails._id}/dropoffs`}
                className="px-3 py-1 bg-amber-600 text-white rounded-md flex items-center text-sm hover:bg-amber-700"
              >
                <FaBox className="mr-1" /> View Drop-offs
              </Link>
            </div>

            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {campaignDetails.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-xl font-bold text-purple-700">
                      {campaignDetails.progress} / {campaignDetails.goal} items
                    </p>
                  </div>
                  <FaBoxOpen className="text-purple-400 text-2xl" />
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Completion</span>
                    <span>
                      {calculateProgress(
                        campaignDetails.goal,
                        campaignDetails.progress
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${calculateProgress(
                          campaignDetails.goal,
                          campaignDetails.progress
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Contributors</p>
                    <p className="text-xl font-bold text-blue-700">
                      {contributors.length} participants
                    </p>
                  </div>
                  <FaUsers className="text-blue-400 text-2xl" />
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Total drop-offs:{" "}
                    <span className="font-medium">{pickUpCount}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Material
                </h3>
                <p className="font-medium">
                  {campaignDetails.material || "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  End Date
                </h3>
                <p className="font-medium">
                  {new Date(campaignDetails.endDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Drop-off Location
                </h3>
                <p className="font-medium">
                  {campaignDetails.dropOffLocation?.name || "Not specified"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Created On
                </h3>
                <p className="font-medium">
                  {new Date(campaignDetails.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <FaUsers className="text-gray-500 mr-2" /> Contributors
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-full">
                {contributors.length}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Total Contributions: {pickUpCount} items
            </p>
          </div>
        </div>

        {contributors.length === 0 ? (
          <div className="text-center py-8">
            <FaAward className="text-gray-300 text-5xl mx-auto mb-3" />
            <p className="text-gray-500">No contributors yet</p>
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
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contributions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drop-offs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contribution
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contributors.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.contributions} items
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.totalDropoffs || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.lastContribution
                          ? new Date(user.lastContribution).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddCampaignModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        fetchCampaigns={fetchCampaignDetails}
        campaignToEdit={campaignDetails}
      />
    </div>
  );
};

export default AdminCampaignDetails;
