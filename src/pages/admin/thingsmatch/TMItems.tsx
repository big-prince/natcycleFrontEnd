/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import thingsMatchApi from "../../../api/thingsMatchApi";
import {
  FiAlertCircle,
  FiLoader,
  FiPackage,
  FiEye,
  FiChevronDown,
} from "react-icons/fi";
import { toast } from "react-toastify";

interface ItemLocation {
  type: string;
  coordinates: number[];
  address?: string;
}

interface ItemImage {
  public_id: string;
  url: string;
  _id: string;
}

interface ItemUserDetails {
  name: string;
  email: string;
}

export interface TMItem {
  _id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  itemImages: ItemImage[];
  location: ItemLocation;
  status: "available" | "reserved" | "given_away" | "expired" | "matched";
  discoveryStatus: "visible" | "hidden";
  interestCount: number;
  createdAt: string;
  updatedAt: string;
  userDetails?: ItemUserDetails;
  __v?: number;
}

const TMItems: React.FC = () => {
  const [items, setItems] = useState<TMItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // For reading query params
  const highlightedItemId = searchParams.get("highlightItem");
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);

  // State for filters and sorts
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all", "available", "reserved", etc.
  const [interestSort, setInterestSort] = useState<string>(""); // "", "asc", "desc"
  const [dateSort, setDateSort] = useState<string>("newest"); // "newest", "oldest"

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await thingsMatchApi.getAllItems(signal);
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data.items.items)
        ) {
          setItems(response.data.data.items.items);
        } else if (response.data && Array.isArray(response.data.items)) {
          setItems(response.data.items);
        } else {
          console.error(
            "Unexpected API response structure for items:",
            response.data
          );
          setItems([]);
          setError("Failed to fetch items due to unexpected data format.");
          toast.error("Unexpected data format from server for items.");
        }
      } catch (err: any) {
        if (err.name === "AbortError" || err.name === "CanceledError") {
          return;
        }
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching items."
        );
        toast.error(
          err.response?.data?.message ||
            "An error occurred while fetching items."
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      abortController.abort();
    };
  }, [triggerFetch]);

  // Effect for highlighting item
  useEffect(() => {
    if (highlightedItemId && items.length > 0) {
      const itemRow = document.getElementById(`item-row-${highlightedItemId}`);
      if (itemRow) {
        highlightedRowRef.current = itemRow as HTMLTableRowElement;
        itemRow.scrollIntoView({ behavior: "smooth", block: "center" });

        itemRow.classList.add(
          "bg-sky-100",
          "transition-all",
          "duration-300",
          "ease-in-out"
        );
        itemRow.classList.add("ring-2", "ring-sky-500", "ring-offset-1");

        const timer = setTimeout(() => {
          itemRow.classList.remove(
            "bg-sky-100",
            "ring-2",
            "ring-sky-500",
            "ring-offset-1"
          );
          // Optionally remove the query parameter after highlighting
          // searchParams.delete("highlightItem");
          // setSearchParams(searchParams);
        }, 3500); // Highlight for 3.5 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [highlightedItemId, items, setSearchParams, searchParams]);

  const handleViewItemDetails = (item: TMItem) => {
    navigate(`/admin/thingsmatch/items/${item._id}`, {
      state: { itemData: item },
    });
  };

  const displayedItems = useMemo(() => {
    let processedItems = [...items];

    // 1. Filter by status
    if (statusFilter !== "all") {
      processedItems = processedItems.filter(
        (item) => item.status === statusFilter
      );
    }

    // 2. Sort by interest count
    if (interestSort === "asc") {
      processedItems.sort((a, b) => a.interestCount - b.interestCount);
    } else if (interestSort === "desc") {
      processedItems.sort((a, b) => b.interestCount - a.interestCount);
    }

    // 3. Sort by date
    if (dateSort === "newest") {
      processedItems.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (dateSort === "oldest") {
      processedItems.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return processedItems;
  }, [items, statusFilter, interestSort, dateSort]);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "available", label: "Available" },
    { value: "reserved", label: "Reserved" },
    { value: "given_away", label: "Given Away" },
    { value: "matched", label: "Matched" },
    { value: "expired", label: "Expired" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FiLoader className="animate-spin text-sky-500 text-4xl" />
        <span className="ml-3 text-slate-700 text-lg">Loading Items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <FiAlertCircle className="text-red-500 text-5xl mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Error Fetching Items
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
          ThingsMatch Items
        </h1>
      </div>

      {/* Filter and Sort Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
          {/* Status Filter */}
          <div>
            <label
              htmlFor="statusFilter"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Filter by Status
            </label>
            <div className="relative">
              <select
                id="statusFilter"
                name="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm pr-8"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Interest Sort */}
          <div>
            <label
              htmlFor="interestSort"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Sort by Interests
            </label>
            <div className="relative">
              <select
                id="interestSort"
                name="interestSort"
                value={interestSort}
                onChange={(e) => {
                  setInterestSort(e.target.value);
                  if (e.target.value !== "") setDateSort(""); // Reset date sort if interest sort is chosen
                }}
                className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm pr-8"
              >
                <option value="">Default (by Date)</option>
                <option value="asc">Interests (Low to High)</option>
                <option value="desc">Interests (High to Low)</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Sort */}
          <div>
            <label
              htmlFor="dateSort"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Sort by Date Listed
            </label>
            <div className="relative">
              <select
                id="dateSort"
                name="dateSort"
                value={dateSort}
                onChange={(e) => {
                  setDateSort(e.target.value);
                  if (e.target.value !== "") setInterestSort(""); // Reset interest sort if date sort is chosen
                }}
                className="appearance-none w-full bg-slate-50 border border-slate-300 text-slate-700 py-2.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm pr-8"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="">No Date Sort (if sorting by interest)</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {displayedItems.length === 0 && !loading ? (
        <div className="text-center py-10 bg-white rounded-lg shadow p-6">
          <FiPackage size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg">
            {statusFilter === "all" &&
            interestSort === "" &&
            dateSort === "newest"
              ? "No ThingsMatch items found."
              : "No items match your current filter/sort criteria."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm text-left text-slate-700">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Item Name
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Category
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Listed By
                </th>
                <th
                  scope="col"
                  className="px-4 py-3.5 font-semibold text-center"
                >
                  Interests
                </th>
                <th scope="col" className="px-4 py-3.5 font-semibold">
                  Date Listed
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
              {displayedItems.map((item) => (
                <tr
                  key={item._id}
                  id={`item-row-${item._id}`} // ADD THIS ID TO THE ROW
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div
                      className="font-medium text-slate-800 truncate max-w-xs"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500">ID: {item._id}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {item.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === "available"
                          ? "bg-green-100 text-green-800"
                          : item.status === "reserved"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "given_away"
                          ? "bg-blue-100 text-blue-800"
                          : item.status === "matched"
                          ? "bg-purple-100 text-purple-800"
                          : item.status === "expired"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {item.userDetails ? (
                      <div title={item.userDetails.email}>
                        {item.userDetails.name}
                      </div>
                    ) : (
                      <div title={item.userId}>
                        {item.userId.substring(0, 12) + "..."}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-slate-600">
                    {item.interestCount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewItemDetails(item)}
                      title="View Item Details"
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

export default TMItems;
