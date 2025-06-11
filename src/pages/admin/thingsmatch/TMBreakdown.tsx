/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import thingsMatchApi from "../../../api/thingsMatchApi";
import { TMUser } from "./TMUsers"; // Assuming TMUser is exported
import { TMItem } from "./TMItems"; // Assuming TMItem is exported
import { TMMatch } from "./TMMatches"; // Assuming TMMatch is exported
import {
  FiUsers,
  FiPackage,
  FiLink2,
  FiActivity,
  FiCheckSquare,
  FiClock,
  FiTrendingUp,
  FiList,
  FiLoader,
  FiAlertCircle,
  FiEye, // For view links
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

interface Stats {
  totalUsers: number;
  totalItems: number;
  totalMatches: number;
  itemsByStatus: Record<string, number>;
  matchesByStatus: Record<string, number>;
  avgItemsPerUser: string; // Formatted string
  avgMatchesPerActiveItem: string; // Formatted string
}

const TMBreakdown: React.FC = () => {
  const [users, setUsers] = useState<TMUser[]>([]);
  const [items, setItems] = useState<TMItem[]>([]);
  const [matches, setMatches] = useState<TMMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResponse, itemsResponse, matchesResponse] =
          await Promise.all([
            thingsMatchApi.getAllUsers(),
            thingsMatchApi.getAllItems(),
            thingsMatchApi.getAllMatches(),
          ]);

        setUsers(
          usersResponse.data?.data?.users || usersResponse.data?.users || []
        );
        setItems(
          itemsResponse.data?.data?.items?.items ||
            itemsResponse.data?.items ||
            []
        );
        setMatches(
          matchesResponse.data?.data?.matches ||
            matchesResponse.data?.matches ||
            []
        );
      } catch (err: any) {
        console.error("Error fetching breakdown data:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Failed to load ThingsMatch breakdown data.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo<Stats | null>(() => {
    if (loading || error || !users.length || !items.length) return null; // Wait for all essential data

    const itemsByStatus: Record<string, number> = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const matchesByStatus: Record<string, number> = matches.reduce(
      (acc, match) => {
        acc[match.status] = (acc[match.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const avgItemsPerUser =
      users.length > 0 ? (items.length / users.length).toFixed(2) : "0.00";

    const itemsWithMatches = new Set(matches.map((m) => m.itemId));
    const avgMatchesPerActiveItem =
      itemsWithMatches.size > 0
        ? (matches.length / itemsWithMatches.size).toFixed(2)
        : "0.00";

    return {
      totalUsers: users.length,
      totalItems: items.length,
      totalMatches: matches.length,
      itemsByStatus,
      matchesByStatus,
      avgItemsPerUser,
      avgMatchesPerActiveItem,
    };
  }, [users, items, matches, loading, error]);

  const recentItems = useMemo(() => {
    return [...items]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [items]);

  const recentMatches = useMemo(() => {
    return [...matches]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [matches]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    linkTo?: string;
  }> = ({ title, value, icon: Icon, color = "bg-sky-500", linkTo }) => (
    <div
      className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${color} text-white transition-all hover:shadow-2xl hover:scale-105`}
    >
      <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-full">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-medium uppercase tracking-wider opacity-80">
          {title}
        </p>
        <p className="text-3xl font-bold">{value}</p>
        {linkTo && (
          <Link
            to={linkTo}
            className="text-xs mt-1 opacity-90 hover:opacity-100 hover:underline flex items-center"
          >
            View All <FiEye className="ml-1 h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );

  const StatusBreakdownCard: React.FC<{
    title: string;
    data: Record<string, number>;
    icon: React.ElementType;
    baseLink?: string;
  }> = ({ title, data, icon: Icon, baseLink }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2">
      <div className="flex items-center text-slate-700 mb-4">
        <Icon className="h-6 w-6 mr-3 text-sky-500" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {Object.keys(data).length > 0 ? (
        <ul className="space-y-2">
          {Object.entries(data).map(([status, count]) => (
            <li
              key={status}
              className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-50 hover:bg-slate-100"
            >
              <span className="text-slate-600 capitalize">
                {status.replace("_", " ")}
              </span>
              <span className="font-semibold text-sky-600 px-2 py-0.5 rounded-full bg-sky-100">
                {count}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-sm">
          No data available for this breakdown.
        </p>
      )}
      {baseLink && (
        <Link
          to={baseLink}
          className="text-xs mt-4 text-sky-600 hover:underline flex items-center"
        >
          Go to {title.replace("Overview", "")}{" "}
          <FiEye className="ml-1 h-3 w-3" />
        </Link>
      )}
    </div>
  );

  const RecentActivityCard: React.FC<{
    title: string;
    items: Array<TMItem | TMMatch>;
    itemType: "item" | "match";
    icon: React.ElementType;
  }> = ({ title, items: activityItems, itemType, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex items-center text-slate-700 mb-4">
        <Icon className="h-6 w-6 mr-3 text-sky-500" />
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      {activityItems.length > 0 ? (
        <ul className="space-y-3">
          {activityItems.map((activity) => (
            <li
              key={activity._id}
              className="p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              {itemType === "item" && (activity as TMItem).name && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">
                    {(activity as TMItem).name}
                  </span>
                  <Link
                    to={`/admin/thingsmatch/items/${activity._id}`}
                    className="text-xs text-sky-600 hover:underline"
                  >
                    View Item
                  </Link>
                </div>
              )}
              {itemType === "match" &&
                (activity as TMMatch).itemDetails?.item?.name && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">
                      Match for: {(activity as TMMatch).itemDetails.item.name}
                    </span>
                    <Link
                      to={`/admin/thingsmatch/matches/${activity._id}`}
                      className="text-xs text-sky-600 hover:underline"
                    >
                      View Match
                    </Link>
                  </div>
                )}
              <p className="text-xs text-slate-500 mt-0.5">
                Created: {new Date(activity.createdAt).toLocaleDateString()}
                {itemType === "match" &&
                  ` - Status: ${(activity as TMMatch).status
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}`}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-sm">No recent activity.</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-150px)]">
        <FiLoader className="animate-spin text-sky-500 text-5xl" />
        <span className="ml-4 text-slate-700 text-xl">
          Loading Breakdown Data...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center min-h-[calc(100vh-150px)] flex flex-col justify-center items-center">
        <FiAlertCircle className="text-red-500 text-6xl mb-5" />
        <h2 className="text-2xl font-semibold text-red-700 mb-3">
          Loading Failed
        </h2>
        <p className="text-slate-600 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center min-h-[calc(100vh-150px)] flex flex-col justify-center items-center">
        <FiPackage className="text-slate-400 text-6xl mb-5" />
        <h2 className="text-2xl font-semibold text-slate-700 mb-3">
          No Data Yet
        </h2>
        <p className="text-slate-500 max-w-md">
          It seems there's no user, item, or match data available yet to
          generate the breakdown. Start by adding some data to ThingsMatch.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-100 min-h-full">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">
        ThingsMatch Activity Breakdown
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={FiUsers}
          color="bg-sky-500"
          linkTo="/admin/thingsmatch/users"
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={FiPackage}
          color="bg-emerald-500"
          linkTo="/admin/thingsmatch/items"
        />
        <StatCard
          title="Total Matches"
          value={stats.totalMatches}
          icon={FiLink2}
          color="bg-purple-500"
          linkTo="/admin/thingsmatch/matches"
        />
        <StatCard
          title="Avg. Items/User"
          value={stats.avgItemsPerUser}
          icon={FiTrendingUp}
          color="bg-amber-500"
        />
        <StatCard
          title="Avg. Matches/Active Item"
          value={stats.avgMatchesPerActiveItem}
          icon={FiActivity}
          color="bg-rose-500"
        />
      </div>

      {/* Status Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusBreakdownCard
          title="Item Status Overview"
          data={stats.itemsByStatus}
          icon={FiCheckSquare}
          baseLink="/admin/thingsmatch/items"
        />
        <StatusBreakdownCard
          title="Match Status Overview"
          data={stats.matchesByStatus}
          icon={FiList}
          baseLink="/admin/thingsmatch/matches"
        />

        {/* Recent Activity Cards - Spanning more columns */}
        <RecentActivityCard
          title="Recently Added Items"
          items={recentItems}
          itemType="item"
          icon={FiClock}
        />
        <RecentActivityCard
          title="Recently Created Matches"
          items={recentMatches}
          itemType="match"
          icon={FiClock}
        />
      </div>
    </div>
  );
};

export default TMBreakdown;
