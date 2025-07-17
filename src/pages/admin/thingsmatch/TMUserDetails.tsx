import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import thingsMatchApi from "../../../api/thingsMatchApi";
import { MdArrowBack } from "react-icons/md";

const TMUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  interface NatcycleId {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profilePicture?: { url?: string };
    _id: string;
  }

  interface UserDetails {
    _id: string;
    natcycleId: NatcycleId;
    itemsShared?: number;
    monthlyGoal?: number;
    environmentalImpact?: number;
    interests?: string[];
    tags?: string[];
    location?: {
      address?: string;
      coordinates?: [number, number];
    };
    createdItems?: unknown[];
    stats?: Record<string, unknown>;
  }

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    thingsMatchApi
      .getUserById(userId)
      .then((res) => {
        console.log(res);
        setUserDetails(res.data.data.user);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Failed to fetch user details."
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 mt-3 inline-flex items-center text-sm text-slate-600 hover:text-green-700 font-medium transition-colors group"
      >
        <MdArrowBack className="mr-2 transition-transform group-hover:-translate-x-1 h-5 w-5" />
        Back
      </button>
      <h1 className="text-2xl font-bold mb-4">ThingsMatch User Details</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {userDetails && (
        <div className="bg-white rounded-lg shadow p-8 flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {userDetails.natcycleId.profilePicture?.url ? (
              <img
                src={userDetails.natcycleId.profilePicture.url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
                ?
              </div>
            )}
          </div>
          {/* Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-green-700">
              {userDetails.natcycleId.firstName}{" "}
              {userDetails.natcycleId.lastName}
            </h2>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Email:</span>{" "}
              {userDetails.natcycleId.email}
            </p>
            {userDetails.natcycleId.phoneNumber && (
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Phone:</span>{" "}
                {userDetails.natcycleId.phoneNumber}
              </p>
            )}
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">User ID:</span> {userDetails._id}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Natcycle ID:</span>{" "}
              {userDetails.natcycleId._id}
            </p>
            {userDetails.location?.address && (
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Location:</span>{" "}
                {userDetails.location.address}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {userDetails.tags && userDetails.tags.length > 0 && (
                <>
                  <span className="font-semibold text-gray-700">Tags:</span>
                  {userDetails.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {userDetails.interests && userDetails.interests.length > 0 && (
                <>
                  <span className="font-semibold text-gray-700">
                    Interests:
                  </span>
                  {userDetails.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {userDetails.itemsShared ?? 0}
                </div>
                <div className="text-xs text-gray-500">Items Shared</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {userDetails.monthlyGoal ?? 0}
                </div>
                <div className="text-xs text-gray-500">Monthly Goal</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {userDetails.environmentalImpact ?? 0}
                </div>
                <div className="text-xs text-gray-500">
                  Environmental Impact
                </div>
              </div>
            </div>
            {/* Stats Section */}
            <div className="mt-6">
              <h2 className="text-md font-bold mb-2">Stats</h2>
              <ul className="list-disc ml-6">
                {userDetails.stats ? (
                  Object.entries(userDetails.stats).map(([key, value]) => (
                    <li key={key}>
                      {key}: {String(value)}
                    </li>
                  ))
                ) : (
                  <li>No stats available.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TMUserDetails;
