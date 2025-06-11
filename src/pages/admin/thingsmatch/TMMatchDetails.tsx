/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import thingsMatchApi from "../../../api/thingsMatchApi";
import { TMMatch } from "./TMMatches"; // Assuming TMMatch interface is exported from TMMatches.tsx
import {
  FiLoader,
  FiAlertCircle,
  FiArrowLeft,
  FiUser,
  FiLink2,
  FiCalendar,
  FiMessageSquare,
  FiPackage,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-toastify";

const TMMatchDetails: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const passedMatchData = (location.state as { matchData?: TMMatch })
    ?.matchData;

  const [match, setMatch] = useState<TMMatch | null>(passedMatchData || null);
  const [loading, setLoading] = useState(!passedMatchData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (passedMatchData && passedMatchData._id === matchId) {
      setMatch(passedMatchData);
      setLoading(false);
      return;
    }

    if (!matchId) {
      setError("Match ID is missing.");
      setLoading(false);
      toast.error("Match ID is missing in URL.");
      navigate("/admin/thingsmatch/matches");
      return;
    }

    const fetchMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await thingsMatchApi.getMatchById(matchId);
        // Adjust based on your getMatchById response structure
        if (response.data && response.data.data && response.data.data.match) {
          setMatch(response.data.data.match);
        } else if (response.data && response.data.match) {
          setMatch(response.data.match);
        } else if (response.data) {
          // If response.data is the match itself
          setMatch(response.data);
        } else {
          throw new Error("Match data not found in response");
        }
      } catch (err: any) {
        console.error("Error fetching match details:", err);
        setError(
          err.response?.data?.message ||
            `Failed to fetch match details for ID: ${matchId}`
        );
        toast.error(
          err.response?.data?.message || "Failed to fetch match details."
        );
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, navigate, passedMatchData]);

  const DetailRow: React.FC<{
    icon?: React.ElementType;
    label: string;
    value?: string | number | null | boolean;
    children?: React.ReactNode;
  }> = ({ icon: Icon, label, value, children }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500 flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5 text-slate-400" />}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
        {children ||
          (typeof value === "boolean" ? (value ? "Yes" : "No") : value) ||
          "N/A"}
      </dd>
    </div>
  );

  const getStatusColor = (status: TMMatch["status"] | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    switch (status) {
      case "pendingInterest":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-sky-100 text-sky-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FiLoader className="animate-spin text-sky-500 text-4xl" />
        <span className="ml-3 text-slate-700">Loading Match Details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <FiAlertCircle className="text-red-500 text-5xl mb-4 mx-auto" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/admin/thingsmatch/matches")}
          className="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
        >
          Back to Matches List
        </button>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-6 text-center">
        <p>Match not found.</p>
        <button
          onClick={() => navigate("/admin/thingsmatch/matches")}
          className="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
        >
          Back to Matches List
        </button>
      </div>
    );
  }

  const {
    itemDetails,
    itemOwnerDetails,
    itemSwiperDetails,
    hasMessages: matchMessages,
  } = match;

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-full">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
      >
        <FiArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Back
      </button>
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
            Match Details
          </h1>
          <p className="text-sm text-slate-500 mb-4">Match ID: {match._id}</p>
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <dl className="divide-y divide-slate-200">
            <DetailRow icon={FiLink2} label="Match Status">
              <span
                className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                  match.status
                )}`}
              >
                {match.status
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </span>
            </DetailRow>
            <DetailRow
              icon={FiCalendar}
              label="Matched At"
              value={
                match.matchedAt
                  ? new Date(match.matchedAt).toLocaleString()
                  : "Not yet matched"
              }
            />
            <DetailRow
              icon={FiMessageSquare}
              label="Default Message Sent"
              value={match.defaultMessageSent}
            />
            <DetailRow
              icon={FiMessageSquare}
              label="Has Messages"
              value={matchMessages?.status}
            />

            <div className="py-3">
              <dt className="text-sm font-medium text-slate-500 flex items-center mb-1">
                <FiPackage className="mr-2 h-5 w-5 text-slate-400" />
                Item Involved
              </dt>
              <dd className="mt-1 text-sm text-slate-900">
                Name: {itemDetails?.item?.name || "N/A"} <br />
                Category: {itemDetails?.item?.category || "N/A"} <br />
                Status: {itemDetails?.item?.status || "N/A"} <br />
                Item ID:
                <Link
                  to={`/admin/thingsmatch/items?highlightItem=${match.itemId}`}
                  className="text-sky-600 hover:text-sky-800 hover:underline ml-1"
                  title="View item in TM Items list and highlight"
                >
                  {match.itemId} (View & Highlight)
                </Link>
              </dd>
            </div>

            <DetailRow icon={FiUser} label="Item Owner">
              {itemOwnerDetails
                ? `${itemOwnerDetails.name} (${itemOwnerDetails.email})`
                : "N/A"}
              <br />
              <Link
                to={`/admin/thingsmatch/users/${match.itemOwnerId}?highlightUser=${match.itemOwnerId}`}
                className="text-xs text-sky-500 hover:underline"
                title="View owner in TM Users list and highlight"
              >
                (View Owner Details)
              </Link>
            </DetailRow>
            <DetailRow icon={FiUser} label="Item Swiper">
              {itemSwiperDetails
                ? `${itemSwiperDetails.name} (${itemSwiperDetails.email})`
                : "N/A"}
              <br />
              <Link
                to={`/admin/thingsmatch/users/${match.itemSwiperId}?highlightUser=${match.itemSwiperId}`}
                className="text-xs text-sky-500 hover:underline"
                title="View swiper in TM Users list and highlight"
              >
                (View Swiper Details)
              </Link>
            </DetailRow>

            <DetailRow
              icon={FiClock}
              label="Match Created At"
              value={new Date(match.createdAt).toLocaleString()}
            />
            <DetailRow
              icon={FiClock}
              label="Match Last Updated At"
              value={new Date(match.updatedAt).toLocaleString()}
            />
          </dl>
        </div>
      </div>
    </div>
  );
};

export default TMMatchDetails;
