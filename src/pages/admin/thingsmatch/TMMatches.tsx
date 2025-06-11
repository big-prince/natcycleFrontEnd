/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import thingsMatchApi from "../../../api/thingsMatchApi";
import {
  FiAlertCircle,
  FiLoader,
  FiLink2,
  FiEye,
  FiChevronDown,
  FiMessageSquare,
} from "react-icons/fi";
import { toast } from "react-toastify";

interface MatchItemLocation {
  type: string;
  coordinates: number[];
  address?: string;
}

interface MatchItemImage {
  public_id: string;
  url: string;
  _id: string;
}

interface NestedItemDetails {
  // The item object nested within itemDetails
  _id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  itemImages: MatchItemImage[];
  location: MatchItemLocation;
  status: string; // "available", "given_away", etc.
  discoveryStatus: string;
  interestCount: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface MatchItemDetailsContainer {
  // The container for the nested item
  item: NestedItemDetails;
}

interface MatchUserDetails {
  name: string;
  email: string;
}

interface MatchHasMessages {
  status: boolean;
}

export interface TMMatch {
  _id: string;
  itemOwnerId: string;
  itemSwiperId: string;
  itemId: string;
  status:
    | "pendingInterest"
    | "confirmed"
    | "rejected"
    | "completed"
    | "cancelled"; // Add other statuses as needed
  defaultMessageSent: boolean;
  matchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  itemDetails: MatchItemDetailsContainer;
  itemOwnerDetails: MatchUserDetails;
  itemSwiperDetails: MatchUserDetails;
  hasMessages: MatchHasMessages;
}
// --- End Interfaces ---

const TMMatches: React.FC = () => {
  const [matches, setMatches] = useState<TMMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const navigate = useNavigate();

  // State for filters and sorts
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateSort, setDateSort] = useState<string>("newest"); // "newest", "oldest"

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await thingsMatchApi.getAllMatches(signal);
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data.matches)
        ) {
          setMatches(response.data.data.matches);
        } else if (response.data && Array.isArray(response.data.matches)) {
          // Fallback
          setMatches(response.data.matches);
        } else {
          console.error(
            "Unexpected API response structure for matches:",
            response.data
          );
          setMatches([]);
          setError("Failed to fetch matches due to unexpected data format.");
          toast.error("Unexpected data format from server for matches.");
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.name === "CanceledError") {
          return;
        }
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching matches."
        );
        toast.error(
          err.response?.data?.message ||
            "An error occurred while fetching matches."
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchMatches();
    return () => abortController.abort();
  }, [triggerFetch]);

  const handleViewMatchDetails = (match: TMMatch) => {
    navigate(`/admin/thingsmatch/matches/${match._id}`, {
      state: { matchData: match },
    });
  };

  const displayedMatches = useMemo(() => {
    let processedMatches = [...matches];

    if (statusFilter !== "all") {
      processedMatches = processedMatches.filter(
        (match) => match.status === statusFilter
      );
    }

    if (dateSort === "newest") {
      processedMatches.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (dateSort === "oldest") {
      processedMatches.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return processedMatches;
  }, [matches, statusFilter, dateSort]);

  // Define status options based on your match statuses
  const matchStatusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pendingInterest", label: "Pending Interest" },
    { value: "confirmed", label: "Confirmed" },
    { value: "rejected", label: "Rejected" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    // Add more as needed
  ];

  const getStatusColor = (status: TMMatch["status"]) => {
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
        <span className="ml-3 text-slate-700 text-lg">Loading Matches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <FiAlertCircle className="text-red-500 text-5xl mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Error Fetching Matches
        </h2>
        <p className="text-slate-600">{error}</p>
        <button
          onClick={() => setTriggerFetch((prev) => !prev)}
          className="mt-6 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 sm:mb-0">
          ThingsMatch Matches
        </h1>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label
              htmlFor="statusFilterMatch"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Filter by Status
            </label>
            <div className="relative">
              <select
                id="statusFilterMatch"
                name="statusFilterMatch"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm pr-8"
              >
                {matchStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label
              htmlFor="dateSortMatch"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Sort by Date Created
            </label>
            <div className="relative">
              <select
                id="dateSortMatch"
                name="dateSortMatch"
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value)}
                className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm pr-8"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {displayedMatches.length === 0 && !loading ? (
        <div className="text-center py-10 bg-white rounded-lg shadow p-6">
          <FiLink2 size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg">
            {statusFilter === "all" && dateSort === "newest"
              ? "No ThingsMatch matches found."
              : "No matches match your current filter/sort criteria."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm text-left text-slate-700">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Match ID
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Item Name
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Item Owner
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Item Swiper
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Messages
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Date Created
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 font-semibold text-center"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedMatches.map((match) => (
                <tr
                  key={match._id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div
                      className="font-medium text-slate-800 truncate max-w-[100px]"
                      title={match._id}
                    >
                      {match._id}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 whitespace-nowrap text-slate-600 truncate max-w-xs"
                    title={match.itemDetails?.item?.name || "N/A"}
                  >
                    {match.itemDetails?.item?.name || "N/A"}
                  </td>
                  <td
                    className="px-4 py-3 whitespace-nowrap text-slate-600 truncate max-w-xs"
                    title={match.itemOwnerDetails?.name || "N/A"}
                  >
                    {match.itemOwnerDetails?.name || "N/A"}
                  </td>
                  <td
                    className="px-4 py-3 whitespace-nowrap text-slate-600 truncate max-w-xs"
                    title={match.itemSwiperDetails?.name || "N/A"}
                  >
                    {match.itemSwiperDetails?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        match.status
                      )}`}
                    >
                      {match.status
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}{" "}
                      {/* Formats camelCase to Title Case */}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {match.hasMessages?.status ? (
                      <FiMessageSquare
                        className="h-5 w-5 text-green-500 mx-auto"
                        title="Has Messages"
                      />
                    ) : (
                      <FiMessageSquare
                        className="h-5 w-5 text-slate-400 mx-auto"
                        title="No Messages"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {new Date(match.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewMatchDetails(match)}
                      title="View Match Details"
                      className="text-sky-600 hover:text-sky-800 font-medium py-1 px-2.5 rounded-md hover:bg-sky-50 transition-colors flex items-center justify-center mx-auto"
                    >
                      <FiEye className="mr-1.5 h-4 w-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TMMatches;
