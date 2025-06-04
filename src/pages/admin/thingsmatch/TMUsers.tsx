/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import thingsMatchApi from "../../../api/thingsMatchApi";
import {
  FiAlertCircle,
  FiLoader,
  FiUsers as FiUsersIcon,
  FiExternalLink, // For the NatCycle Profile link
} from "react-icons/fi";
import { toast } from "react-toastify";

interface NatCycleId {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface Location {
  type: string;
  coordinates: number[];
  address?: string;
  lat?: number;
  lng?: number;
  _id?: string;
}

export interface TMUser {
  _id: string;
  natcycleId: NatCycleId;
  location: Location;
  createdItems: any[];
  tags: string[];
  interests: string[];
  monthlyGoal: number;
  itemsShared: number;
  environmentalImpact: number;
  __v?: number;
}

const TMUsers: React.FC = () => {
  const [users, setUsers] = useState<TMUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(false); // To re-trigger fetch if needed
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await thingsMatchApi.getAllUsers(signal);
        const userData = response.data.data.users;
        if (Array.isArray(userData)) {
          setUsers(userData);
        } else {
          setUsers([]);
          setError("Failed to fetch users due to unexpected data format.");
          toast.error("Unexpected data format from server.");
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.name === "CanceledError") {
          return;
        }
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching users."
        );
        toast.error(
          err.response?.data?.message ||
            "An error occurred while fetching users."
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      abortController.abort();
    };
  }, [triggerFetch]);

  const handleViewTMDetails = (userId: string) => {
    navigate(`/admin/thingsmatch/users/${userId}`);
  };

  const handleGoToNatCycleProfile = (natCycleUserId: string) => {
    navigate(`/admin/users?highlightUser=${natCycleUserId}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FiLoader className="animate-spin text-sky-500 text-4xl" />
        <span className="ml-3 text-slate-700 text-lg">Loading Users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <FiAlertCircle className="text-red-500 text-5xl mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Error Fetching Users
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
          ThingsMatch Users
        </h1>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow p-6">
          <FiUsersIcon size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg">No ThingsMatch users found.</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm text-left text-slate-700">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  User Name
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Email
                </th>
                <th scope="col" className="px-5 py-3.5 font-semibold">
                  Location
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 font-semibold text-center"
                >
                  Items Shared
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 font-semibold text-center"
                >
                  Impact (CU)
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 font-semibold text-center"
                >
                  Monthly Goal
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 font-semibold text-center"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {user.natcycleId.firstName} {user.natcycleId.lastName}
                    </div>
                    <div className="text-xs text-slate-500">
                      TM ID: {user._id}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                    {user.natcycleId.email}
                  </td>
                  <td
                    className="px-5 py-4 whitespace-nowrap text-slate-600 max-w-xs truncate"
                    title={user.location.address || "N/A"}
                  >
                    {user.location.address || "N/A"}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center text-slate-600">
                    {user.itemsShared}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center text-slate-600">
                    {user.environmentalImpact}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center text-slate-600">
                    {user.monthlyGoal}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleViewTMDetails(user._id)}
                        title="View ThingsMatch Details"
                        className="text-sky-600 hover:text-sky-800 font-medium py-1 px-2.5 rounded-md hover:bg-sky-50 transition-colors"
                      >
                        View TM Details
                      </button>
                      <button
                        onClick={() =>
                          handleGoToNatCycleProfile(user.natcycleId._id)
                        }
                        title="Go to NatCycle User Profile"
                        className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2.5 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        NatCycle Profile
                        <FiExternalLink className="ml-1.5 h-4 w-4" />
                      </button>
                    </div>
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

export default TMUsers;
