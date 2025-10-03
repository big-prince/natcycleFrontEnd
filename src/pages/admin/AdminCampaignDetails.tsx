import { useEffect, useState } from "react";
import CampaignApi from "../../api/campaignApi";
import {
  FaChevronLeft,
  FaExclamationTriangle,
  FaUsers,
  FaBoxOpen,
  FaAward,
} from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface ICampaign {
  id: string;
  name: string;
  description: string;
  endDate?: string; // Made optional for indefinite campaigns
  isIndefinite?: boolean;
  status: "active" | "completed" | "cancelled";
  material?: string;
  materialTypes: string[];
  goal: number;
  progress: number;
  image?: {
    public_id: string;
    url: string;
  };
  locations?: Array<{
    simpleDropoffLocationId?: {
      _id: string;
      name: string;
      address: string;
      materialType?: string;
    };
    dropoffLocationId?: {
      _id: string;
      name: string;
      address: string;
      primaryMaterialType?: string;
    };
    customLocation?: {
      coordinates: [number, number];
      address: string;
      name?: string;
    };
  }>;
  // Legacy fields for backward compatibility
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
  id: string;
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
  // State variables for campaign details

  const fetchCampaignDetails = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const res = await CampaignApi.getCampaign(id);
      console.log("🚀 ~ fetchCampaignDetails ~ res:", res);
      setCampaignDetails(res.data.data.campaign);

      // After getting campaign details, fetch contributors
      fetchContributors(res.data.data.campaign.id);
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
      if (res.data && res.data.data) {
        setContributors(res.data.data.contributors || []);
        setPickUpCount(res.data.data.totalPickups || 0);
      }
    } catch (err) {
      console.error("Error fetching contributors:", err);
      toast.error("Failed to load contributors");
      setContributors([]);
      setPickUpCount(0);
    }
  };

  const handleEditCampaign = () => {
    navigate(`/admin/campaigns/edit/${id}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black-500"></div>
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
          className="px-4 py-2 bg-black-600 text-white rounded-md"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/campaigns"
              className="text-slate-600 hover:text-slate-800 flex items-center gap-2 text-sm font-medium"
            >
              <FaChevronLeft className="w-4 h-4" />
              Back to Campaigns
            </Link>
            <div className="w-px h-6 bg-slate-300"></div>
            <h1 className="text-xl font-bold text-slate-900">
              Campaign Details
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Main Campaign Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Campaign Image */}
              <div className="xl:col-span-1">
                {campaignDetails.image?.url ? (
                  <img
                    src={campaignDetails.image.url}
                    alt={campaignDetails.name}
                    className="w-full h-64 lg:h-72 object-cover rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="w-full h-64 lg:h-72 bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200">
                    <p className="text-slate-500 font-medium">
                      No image available
                    </p>
                  </div>
                )}
              </div>

              {/* Campaign Info */}
              <div className="xl:col-span-3 space-y-6">
                {/* Title and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {campaignDetails.name}
                    </h2>
                    {/* Material Types */}
                    {((campaignDetails.materialTypes &&
                      campaignDetails.materialTypes.length > 0) ||
                      campaignDetails.material) && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-slate-600">
                          Accepted Materials:
                        </span>
                        {campaignDetails.materialTypes &&
                        campaignDetails.materialTypes.length > 0 ? (
                          campaignDetails.materialTypes.includes("All") ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              All Materials
                            </span>
                          ) : (
                            campaignDetails.materialTypes.map(
                              (materialType, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                                >
                                  {materialType}
                                </span>
                              )
                            )
                          )
                        ) : campaignDetails.material ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {campaignDetails.material}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleEditCampaign}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <Link
                      to={`/admin/campaigns/${campaignDetails.id}/dropoffs`}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      View Drop-offs
                    </Link>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {campaignDetails.description}
                  </p>
                </div>

                {/* Campaign Status */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-600 mb-3">
                    Campaign Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        campaignDetails.status === "active"
                          ? "bg-green-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600"
                      }`}
                      onClick={() => handleStatusUpdate("active")}
                    >
                      Active
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        campaignDetails.status === "completed"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                      onClick={() => handleStatusUpdate("completed")}
                    >
                      Completed
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        campaignDetails.status === "cancelled"
                          ? "bg-red-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                      }`}
                      onClick={() => handleStatusUpdate("cancelled")}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">
                  Progress
                </h3>
                <p className="text-2xl font-bold text-slate-900">
                  {campaignDetails.progress} / {campaignDetails.goal}
                </p>
                <p className="text-sm text-slate-500">items collected</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaBoxOpen className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completion</span>
                <span className="font-medium text-slate-900">
                  {calculateProgress(
                    campaignDetails.goal,
                    campaignDetails.progress
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
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

          {/* Contributors Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">
                  Contributors
                </h3>
                <p className="text-2xl font-bold text-slate-900">
                  {contributors?.length}
                </p>
                <p className="text-sm text-slate-500">active participants</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUsers className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Total drop-offs:{" "}
              <span className="font-medium text-slate-900">{pickUpCount}</span>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">
                  Campaign Status
                </h3>
                <p className="text-2xl font-bold text-slate-900 capitalize">
                  {campaignDetails.status}
                </p>
                <p className="text-sm text-slate-500">
                  {campaignDetails.isIndefinite || !campaignDetails.endDate
                    ? "Indefinite duration"
                    : "Time-limited"}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  campaignDetails.status === "active"
                    ? "bg-green-100"
                    : campaignDetails.status === "completed"
                    ? "bg-blue-100"
                    : "bg-red-100"
                }`}
              >
                <FaAward
                  className={`text-xl ${
                    campaignDetails.status === "active"
                      ? "text-green-500"
                      : campaignDetails.status === "completed"
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                />
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Created:{" "}
              <span className="font-medium text-slate-900">
                {new Date(campaignDetails.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Campaign Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-600">
                End Date
              </label>
              <p className="text-slate-900 font-medium mt-1">
                {campaignDetails.isIndefinite || !campaignDetails.endDate ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Indefinite
                  </span>
                ) : (
                  new Date(campaignDetails.endDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">
                Created On
              </label>
              <p className="text-slate-900 font-medium mt-1">
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

      {/* Collection Locations - Full Width Section */}
      <div className="  border-t border-green-100">
        <div className="mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
            <h3 className="text-xl font-semibold text-slate-900">
              Collection Locations
            </h3>
            {campaignDetails.locations &&
              campaignDetails.locations.length > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {campaignDetails.locations.length} location
                  {campaignDetails.locations.length !== 1 ? "s" : ""}
                </span>
              )}
          </div>

          {campaignDetails.locations && campaignDetails.locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaignDetails.locations.map((location, index) => {
                // Linked Simple Dropoff Location
                if (location.simpleDropoffLocationId) {
                  return (
                    <div
                      key={index}
                      className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Simple Location
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {location.simpleDropoffLocationId.name}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {location.simpleDropoffLocationId.address}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Linked Centre Dropoff Location
                if (location.dropoffLocationId) {
                  return (
                    <div
                      key={index}
                      className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Centre Location
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {location.dropoffLocationId.name}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {location.dropoffLocationId.address}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Custom Location
                if (location.customLocation) {
                  return (
                    <div
                      key={index}
                      className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          Custom Location
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {location.customLocation.name || "Custom Location"}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                          {location.customLocation.address}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {location.customLocation.coordinates[1].toFixed(4)},{" "}
                          {location.customLocation.coordinates[0].toFixed(4)}
                        </p>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">
                No Collection Locations
              </h4>
              <p className="text-slate-500">
                No collection locations have been specified for this campaign
                yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 space-y-6">
        {/* Contributors Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FaUsers className="text-green-500" />
                  Contributors
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {contributors?.length}
                  </span>
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Total contributions: {pickUpCount} items
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {contributors?.length === 0 ? (
              <div className="text-center py-12">
                <FaAward className="text-slate-300 text-5xl mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No contributors yet
                </h3>
                <p className="text-slate-500">
                  This campaign hasn't received any contributions yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        User
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Contributions
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Drop-offs
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Last Activity
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contributors.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-slate-600">{user.email}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-900">
                            {user.contributions} items
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-slate-900">
                            {user.totalDropoffs || 0}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-slate-600">
                            {user.lastContribution
                              ? new Date(
                                  user.lastContribution
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="text-green-500 hover:text-green-600 font-medium text-sm transition-colors"
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
        </div>
      </div>
    </div>
  );
};

export default AdminCampaignDetails;
