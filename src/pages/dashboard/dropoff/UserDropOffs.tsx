/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import DropOffApi from "../../../api/dropOffApi";
import { FaLocationDot } from "react-icons/fa6";
// import DropOffMap from "../components/DropOffMap";
import { FaCalendarAlt, FaFilter } from "react-icons/fa";

interface DropOff {
  _id: string;
  itemType: string;
  createdAt: string;
  status: string;
  pointsEarned: number;
  dropOffLocation: Record<string, any>;
}

type FilterType = "all" | "pending" | "completed" | string;

const UserDropOffs = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const [userDropOffs, setUserDropOffs] = useState<DropOff[]>([]);
  const [filteredDropOffs, setFilteredDropOffs] = useState<DropOff[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [notify] = useState("");

  const fetchUserDropOffs = async () => {
    setLoading(true);
    DropOffApi.getDropOffs()
      .then((res) => {
        //set the state
        console.log(res.data.data.docs[0], "user drop offs Fetched");
        const dropOffs = res.data.data.docs;
        setUserDropOffs(dropOffs);
        setFilteredDropOffs(dropOffs);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    if (userDropOffs.length === 0) return;

    let result = [...userDropOffs];

    // Apply status filter
    if (filterType !== "all") {
      if (filterType === "pending") {
        result = result.filter((item) => item.status === "Pending");
      } else if (filterType === "completed") {
        result = result.filter((item) => item.status === "Completed");
      }
    }

    // Apply month filter if selected
    if (monthFilter) {
      const monthIndex = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ].indexOf(monthFilter.toLowerCase());

      if (monthIndex !== -1) {
        result = result.filter((item) => {
          const date = new Date(item.createdAt);
          return date.getMonth() === monthIndex;
        });
      }
    }

    setFilteredDropOffs(result);
  }, [filterType, monthFilter, userDropOffs]);

  useEffect(() => {
    fetchUserDropOffs();
  }, [notify, localUser._id]);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    // Check if it's a month filter
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    if (months.includes(value.toLowerCase())) {
      setMonthFilter(value.toLowerCase());
      // Keep the current status filter
    } else {
      setFilterType(value);
      // Reset month filter when changing status
      setMonthFilter("");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-4">
        <h1 className="text-xl font-semibold">Your Drop-offs</h1>

        <div className="flex flex-col space-y-2">
          {/* Status filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <FaFilter className="text-gray-500" />
            </div>
            <select
              className="border p-2 py-1 pl-8 pr-8 rounded-lg appearance-none bg-white w-full"
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Month filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <FaCalendarAlt className="text-gray-500" />
            </div>
            <select
              className="border p-2 py-1 pl-8 pr-8 rounded-lg appearance-none bg-white w-full"
              value={monthFilter}
              onChange={handleFilterChange}
            >
              <option value="">All Months</option>
              <option value="january">January</option>
              <option value="february">February</option>
              <option value="march">March</option>
              <option value="april">April</option>
              <option value="may">May</option>
              <option value="june">June</option>
              <option value="july">July</option>
              <option value="august">August</option>
              <option value="september">September</option>
              <option value="october">October</option>
              <option value="november">November</option>
              <option value="december">December</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-40">
        {loading ? (
          <p>Loading...</p>
        ) : filteredDropOffs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No drop-offs found with the selected filters
            </p>
          </div>
        ) : (
          <div>
            {filteredDropOffs.map((dropOff: any) => (
              <div
                key={dropOff._id}
                className="border p-4 my-2 rounded-lg flex justify-between relative shadow-sm"
              >
                <div className="absolute right-2">
                  {/* <DropOffPopover id={dropOff._id} setNotify={setNotify} /> */}
                </div>
                <div>
                  <h1 className="text-lg font-semibold">
                    {dropOff.itemType
                      .toLowerCase()
                      .split(" ")
                      .map(
                        (word: string) => word[0].toUpperCase() + word.slice(1)
                      )
                      .join("")}
                  </h1>
                  <p className="flex items-center font-medium mt-2">
                    <FaLocationDot className="text-green-800 text-sm mr-1" />
                    {dropOff.dropOffLocation &&
                    typeof dropOff.dropOffLocation === "object"
                      ? dropOff.dropOffLocation.name.length > 20
                        ? dropOff.dropOffLocation.name.substring(0, 20) + "..."
                        : dropOff.dropOffLocation.name
                      : "Location unavailable"}
                  </p>
                  <p className="text-sm mt-1">
                    {new Date(dropOff.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="mt-2">
                  <div className="text-center">
                    <h3 className="text-m text-darkgreen font-bold">
                      {Math.floor(dropOff.pointsEarned) || 0} <span>CU</span>
                    </h3>
                  </div>

                  <p>
                    <span
                      className={`font-semibold text-sm ${
                        dropOff.status === "Completed"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {dropOff.status}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDropOffs;
