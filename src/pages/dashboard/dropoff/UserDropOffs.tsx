/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import DropOffApi from "../../../api/dropOffApi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Icons for month navigation
import { Link } from "react-router-dom"; // For linking dropoff items if needed

interface DropOffLocation {
  name: string;
  address?: string; // Make address optional or ensure it's always there
  // Add other location properties if needed
}
interface DropOff {
  _id: string;
  itemType: string;
  createdAt: string;
  status: string; // Keep status for potential future use or internal logic, though not directly in new UI
  pointsEarned: number;
  dropOffLocation: DropOffLocation; // Use a more specific type
  itemQuantity?: number; // For "744"
  itemDescription?: string; // For "500ml plastic water bottles"
  // Add any other relevant fields from your API response
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const UserDropOffs = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const [userDropOffs, setUserDropOffs] = useState<DropOff[]>([]);
  const [filteredDropOffs, setFilteredDropOffs] = useState<DropOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // For month navigation

  const fetchUserDropOffs = async () => {
    if (!localUser?._id) return; // Ensure user ID exists
    setLoading(true);
    DropOffApi.getUserDropOffs(localUser._id)
      .then((res) => {
        const dropOffs = res.data.data.docs.map((d: any) => ({
          ...d,
          // Ensure dropOffLocation is an object, provide defaults if necessary
          dropOffLocation:
            d.dropOffLocation && typeof d.dropOffLocation === "object"
              ? d.dropOffLocation
              : { name: "Unknown Location", address: "N/A" },
        }));
        setUserDropOffs(dropOffs);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserDropOffs();
  }, [localUser?._id]);

  // Filter drop-offs by the current month and year
  useEffect(() => {
    if (userDropOffs.length === 0) {
      setFilteredDropOffs([]);
      return;
    }

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const result = userDropOffs.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      );
    });
    setFilteredDropOffs(result);
  }, [currentDate, userDropOffs]);

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="pb-16 px-2 max-w-md mx-auto">
      {" "}
      {/* Centered layout */}
      {/* Month Navigation Header */}
      <div className="flex justify-between items-center my-6 p-3 bg-slate-50 rounded-lg shadow-sm">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-md hover:bg-slate-200 transition-colors"
          aria-label="Previous month"
        >
          <FaChevronLeft className="text-slate-600" />
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800">
            {monthNames[currentDate.getMonth()]}
          </p>
          <p className="text-xs text-gray-500">{currentDate.getFullYear()}</p>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-md hover:bg-slate-200 transition-colors"
          aria-label="Next month"
        >
          <FaChevronRight className="text-slate-600" />
        </button>
      </div>
      {/* Drop-offs List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading drop-offs...</p>
        ) : filteredDropOffs.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-md">
              No drop-offs recorded for {monthNames[currentDate.getMonth()]}{" "}
              {currentDate.getFullYear()}.
            </p>
          </div>
        ) : (
          filteredDropOffs.map((dropOff) => (
            // Optional: Wrap with Link to navigate to dropoff details
            // <Link to={`/dropoff/details/${dropOff._id}`} key={dropOff._id}>
            <div
              key={dropOff._id}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-md font-semibold text-slate-800">
                    {dropOff.dropOffLocation?.name || "Unknown Location"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatTime(dropOff.createdAt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dropOff.dropOffLocation?.address ||
                      "Address not available"}
                  </p>
                  {dropOff.itemQuantity && dropOff.itemDescription && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      {dropOff.itemQuantity} {dropOff.itemDescription}
                    </p>
                  )}
                </div>
                <div className="bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap">
                  {Math.floor(dropOff.pointsEarned) || 0} CU
                </div>
              </div>
            </div>
            // </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default UserDropOffs;
