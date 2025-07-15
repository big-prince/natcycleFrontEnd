import { useEffect, useState } from "react";
import CampaignApi from "../../api/campaignApi";
import { FaPlus, FaEdit, FaEye, FaBox } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

interface ICampaign {
  id: string;
  name: string;
  description: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  material?: string;
  materialTypes: string[];
  goal: number;
  progress: number;
  image?: Image;
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

interface Image {
  public_id: string;
  url: string;
}

const AdminCampaign = () => {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalParticipants: 0,
    totalDropOffs: 0,
  });

  const fetchCampaignStats = async () => {
    try {
      const response = await CampaignApi.getCampaignStats();
      if (response.data && response.data.data) {
        const stats = response.data.data.overview;
        console.log("Campaign Stats:", stats);
        setCampaignStats({
          totalCampaigns: stats.totalCampaigns || 0,
          activeCampaigns: stats.activeCampaigns || 0,
          completedCampaigns: stats.completedCampaigns || 0,
          totalParticipants: stats.totalParticipants || 0,
          totalDropOffs: stats.totalDropOffs || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await CampaignApi.getCampaigns();
      if (response.data && response.data.data) {
        setCampaigns(response.data.data.docs || []);
      } else {
        setCampaigns([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
      setCampaigns([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchCampaignStats();
  }, []);

  const deleteCampaign = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this campaign? This action cannot be undone."
    );
    if (!confirm) return;

    try {
      await CampaignApi.deleteCampaign(id);
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
      fetchCampaignStats();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleEditCampaign = (campaign: ICampaign) => {
    navigate(`/admin/campaigns/create-campaign?id=${campaign.id}`);
  };

  const calculateProgress = (goal: number, progress: number) => {
    if (!goal || goal <= 0) return 0;
    const percentage = (progress / goal) * 100;
    return Math.min(percentage, 100).toFixed(0);
  };

  return (
    <div className="h-full">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h1 className="font-bold text-2xl mb-4">Campaign Management</h1>{" "}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-sky-50 to-sky-100 p-4 rounded-lg border border-sky-200">
            <h3 className="text-sm text-gray-600">Total Campaigns</h3>
            <p className="text-2xl font-bold text-sky-700">
              {campaignStats.totalCampaigns || 0}
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm text-gray-600">Active Campaigns</h3>
            <p className="text-2xl font-bold text-green-700">
              {campaignStats.activeCampaigns || 0}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm text-gray-600">Total Participants</h3>
            <p className="text-2xl font-bold text-blue-700">
              {campaignStats.totalParticipants || 0}
            </p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <h3 className="text-sm text-gray-600">Campaign Drop-offs</h3>
            <p className="text-2xl font-bold text-amber-700">
              {campaignStats.totalDropOffs || 0}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-xl">All Campaigns</div>

          <div className="flex">
            <Link
              to="/admin/campaigns/create-campaign"
              className="flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md cursor-pointer transition-colors"
            >
              <FaPlus className="mr-2" />
              Add New Campaign
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">No campaigns found</p>
          <Link
            to="/admin/campaigns/create-campaign"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto">
                  {campaign.image?.url ? (
                    <img
                      src={campaign.image.url}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image</p>
                    </div>
                  )}
                </div>

                <div className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      {campaign.name}
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {campaign.status.charAt(0).toUpperCase() +
                        campaign.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {campaign.description.length > 150
                      ? campaign.description.substring(0, 150) + "..."
                      : campaign.description}
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Goal: </span>
                      <span className="font-medium">{campaign.goal} items</span>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">Progress: </span>
                      <span className="font-medium">
                        {campaign.progress} items
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">End Date: </span>
                      <span className="font-medium">
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">Material: </span>
                      <span className="font-medium">
                        {campaign.materialTypes &&
                        campaign.materialTypes.length > 0
                          ? campaign.materialTypes.join(", ")
                          : "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completion</span>
                      <span>
                        {calculateProgress(campaign.goal, campaign.progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="w-full bg-gray-200 h-2 rounded-full"
                        style={{
                          width: `${calculateProgress(
                            campaign.goal,
                            campaign.progress
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/campaigns/${campaign.id}`}
                      className="px-3 py-2 bg-sky-600 text-white rounded-md flex items-center text-sm hover:bg-sky-700 transition-colors"
                    >
                      <FaEye className="mr-1" /> View Details
                    </Link>

                    <Link
                      to={`/admin/campaigns/${campaign.id}/dropoffs`}
                      className="px-3 py-2 bg-amber-600 text-white rounded-md flex items-center text-sm hover:bg-amber-700 transition-colors"
                    >
                      <FaBox className="mr-1" /> Drop-offs
                    </Link>

                    <button
                      onClick={() => handleEditCampaign(campaign)}
                      className="px-3 py-2 bg-sky-600 text-white rounded-md flex items-center text-sm hover:bg-sky-700 transition-colors"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>

                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md flex items-center text-sm hover:bg-red-700 transition-colors"
                    >
                      <FaRegTrashAlt className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCampaign;
