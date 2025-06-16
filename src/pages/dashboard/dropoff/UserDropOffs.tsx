/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import DropOffApi from "../../../api/dropOffApi";
import { Link } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface IDropOffLocation {
  name: string;
  address: string;
}

interface IDropOffQuantityItem {
  materialType: string;
  units: number;
  _id?: string;
}

interface IDropOff {
  _id: string;
  createdAt: string;
  dropOffLocation: IDropOffLocation;
  dropOffQuantity: IDropOffQuantityItem[];
  pointsEarned?: number;
  status?: string;
  itemType?: string; // Primary item type
}

const formatDateAndTime = (dateString: string): string => {
  const date = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return `${date.toLocaleDateString(
    undefined,
    optionsDate
  )}, ${date.toLocaleTimeString(undefined, optionsTime)}`;
};

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

const UserDropOffs: React.FC = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const [allDropOffs, setAllDropOffs] = useState<IDropOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());

  const selectedMonth = currentDisplayDate.getMonth();
  const selectedYear = currentDisplayDate.getFullYear();

  useEffect(() => {
    if (localUser?._id) {
      setLoading(true);
      DropOffApi.getUserDropOffs(localUser._id)
        .then((res) => {
          setAllDropOffs(res.data.data || []);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch user drop-offs:", err);
          setError("Failed to load drop-offs. Please try again later.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [localUser?._id]);

  const filteredAndSortedDropOffs = useMemo(() => {
    return allDropOffs
      .filter((dropOff) => {
        const dropOffDate = new Date(dropOff.createdAt);
        return (
          dropOffDate.getFullYear() === selectedYear &&
          dropOffDate.getMonth() === selectedMonth
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [allDropOffs, selectedMonth, selectedYear]);

  const goToPreviousMonth = () => {
    setCurrentDisplayDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDisplayDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      const today = new Date();
      if (
        newDate.getFullYear() > today.getFullYear() ||
        (newDate.getFullYear() === today.getFullYear() &&
          newDate.getMonth() > today.getMonth())
      ) {
        return prevDate;
      }
      return newDate;
    });
  };

  const isNextMonthDisabled = () => {
    const nextMonthDate = new Date(currentDisplayDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const today = new Date();
    return (
      nextMonthDate.getFullYear() > today.getFullYear() ||
      (nextMonthDate.getFullYear() === today.getFullYear() &&
        nextMonthDate.getMonth() > today.getMonth())
    );
  };

  if (loading) {
    return <div className="p-4 text-center">Loading your drop-offs...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!localUser) {
    return (
      <div className="p-4 text-center">
        Please log in to see your drop-offs.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
        My Drop-offs
      </h1>

      <div className="flex justify-between items-center mb-6 bg-slate-100 p-3 rounded-lg shadow">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors"
          aria-label="Previous month"
        >
          <MdChevronLeft size={28} className="text-slate-600" />
        </button>
        <div className="text-lg font-medium text-slate-700 text-center">
          {monthNames[selectedMonth]} {selectedYear}
        </div>
        <button
          onClick={goToNextMonth}
          disabled={isNextMonthDisabled()}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <MdChevronRight size={28} className="text-slate-600" />
        </button>
      </div>

      {filteredAndSortedDropOffs.length === 0 ? (
        <div className="p-4 text-center text-slate-600 bg-white rounded-lg shadow">
          No drop-offs recorded for {monthNames[selectedMonth]} {selectedYear}.
          {allDropOffs.length === 0 && (
            <p className="mt-2">
              You haven't made any drop-offs yet.
              <Link
                to="/create-dropoff"
                className="text-green-600 hover:underline ml-1"
              >
                Make one now!
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedDropOffs.map((dropOff) => (
            <div
              key={dropOff._id}
              className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start"
            >
              <div className="flex-grow">
                <h2 className="text-lg font-semibold text-slate-700">
                  {dropOff.dropOffLocation?.name || "Unknown Location"}
                </h2>
                <p className="text-sm text-slate-500">
                  {formatDateAndTime(dropOff.createdAt)}
                </p>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  {dropOff.dropOffQuantity &&
                  dropOff.dropOffQuantity.length > 0 ? (
                    dropOff.dropOffQuantity.map((item, index) => (
                      <span key={item._id || index} className="block">
                        {item.units} {item.materialType}
                      </span>
                    ))
                  ) : (
                    <span className="block italic text-slate-400">
                      No specific items listed.
                    </span>
                  )}
                </div>
                {dropOff.status && (
                  <p
                    className={`text-xs mt-2 font-medium ${
                      dropOff.status === "Approved"
                        ? "text-green-600"
                        : dropOff.status === "Pending"
                        ? "text-orange-500"
                        : "text-red-500"
                    }`}
                  >
                    Status: {dropOff.status}
                  </p>
                )}
              </div>
              <div className="ml-4 text-right flex-shrink-0">
                <span className="bg-teal-100 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  {dropOff.pointsEarned !== undefined
                    ? `${Math.round(dropOff.pointsEarned)} CU`
                    : "N/A CU"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDropOffs;
