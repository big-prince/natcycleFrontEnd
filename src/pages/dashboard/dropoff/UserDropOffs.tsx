/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "../../../hooks/reduxHooks";
import DropOffApi from "../../../api/dropOffApi";
import SimpleDropoffApi, { SimpleDropoff } from "../../../api/simpleDropoffApi";
import { Link } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { FaShareAlt } from "react-icons/fa";
import SocialShareModal from "../../../components/social/SocialShareModal";
import { useSocialShare } from "../../../hooks/useSocialShare";
import { DropoffShareData } from "../../../types/social";
import {
  setShareMetadata,
  createDropoffShareMetadata,
} from "../../../utils/shareMetadata";

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
  itemType?: string;
  campaign?: {
    name: string;
    organizationName?: string;
    _id?: string;
  };
}

// Unified interface for display
interface IUnifiedDropOff {
  _id: string;
  createdAt: string;
  locationName: string;
  locationAddress?: string;
  items: string[];
  pointsEarned: number;
  status: string;
  type: "regular" | "simple";
  campaignName?: string;
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
  const [allSimpleDropOffs, setAllSimpleDropOffs] = useState<SimpleDropoff[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Social sharing state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const { createDropoffShareData } = useSocialShare();

  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());

  const selectedMonth = currentDisplayDate.getMonth();
  const selectedYear = currentDisplayDate.getFullYear();

  // Helper function to convert regular dropoff to unified format
  const convertRegularDropoff = (dropoff: IDropOff): IUnifiedDropOff => ({
    _id: dropoff._id,
    createdAt: dropoff.createdAt,
    locationName: dropoff.dropOffLocation?.name || "Unknown Location",
    locationAddress: dropoff.dropOffLocation?.address,
    items:
      dropoff.dropOffQuantity && dropoff.dropOffQuantity.length > 0
        ? dropoff.dropOffQuantity.map(
            (item) => `${item.units} ${item.materialType}`
          )
        : ["No specific items listed"],
    pointsEarned: dropoff.pointsEarned || 0,
    status: dropoff.status || "Unknown",
    type: "regular",
    campaignName: dropoff.campaign?.name || undefined,
  });

  // Helper function to convert simple dropoff to unified format
  const convertSimpleDropoff = (dropoff: SimpleDropoff): IUnifiedDropOff => ({
    _id: dropoff._id,
    createdAt: dropoff.createdAt.toString(),
    locationName: dropoff.simpleDropOffLocation?.name || "Unknown Location",
    locationAddress: dropoff.simpleDropOffLocation?.address,
    items: [`${dropoff.quantity} ${dropoff.materialType}`],
    pointsEarned: dropoff.cuEarned || 0,
    status: dropoff.isVerified ? "Verified" : "Pending",
    type: "simple",
  });

  // Handle social share for dropoff
  const handleShareDropoff = (dropOff: IUnifiedDropOff) => {
    // Set metadata for better social sharing
    const metadata = createDropoffShareMetadata(
      dropOff.campaignName,
      dropOff.items[0]?.split(" ").slice(1).join(" "),
      dropOff.pointsEarned,
      dropOff.locationName
    );
    setShareMetadata(metadata);

    const shareInfo: DropoffShareData = {
      materialType:
        dropOff.items[0]?.split(" ").slice(1).join(" ") || "materials",
      carbonUnitsEarned: dropOff.pointsEarned,
      locationName: dropOff.locationName,
      campaignName: dropOff.campaignName,
      dropoffType:
        dropOff.type === "simple"
          ? "simple"
          : dropOff.campaignName
          ? "campaign"
          : "regular",
    };

    const data = createDropoffShareData(shareInfo);
    setShareData(data);
    setIsShareModalOpen(true);
  };

  useEffect(() => {
    if (localUser?._id) {
      setLoading(true);

      // Fetch regular dropoffs first
      const fetchRegularDropoffs = DropOffApi.getUserDropOffs(localUser._id);

      // Fetch simple dropoffs with fallback
      const fetchSimpleDropoffs = SimpleDropoffApi.getMyDropoffs(1, 1000).catch(
        (err) => {
          console.warn("Failed to fetch simple dropoffs:", err);
          // Return empty response structure so Promise.all doesn't fail
          return { data: { data: [] } };
        }
      );

      Promise.all([fetchRegularDropoffs, fetchSimpleDropoffs])
        .then(([regularRes, simpleRes]) => {
          // Handle regular dropoffs
          setAllDropOffs(regularRes.data.data || []);
          console.log("🚀 ~ fetchRegularDropOffs ~ response:", allDropOffs);

          // Handle simple dropoffs - account for different response structures
          let simpleDropoffs = [];
          if (simpleRes.data.data) {
            // Check if it's paginated response with docs
            if (simpleRes.data.data.docs) {
              simpleDropoffs = simpleRes.data.data.docs;
            } else if (Array.isArray(simpleRes.data.data)) {
              simpleDropoffs = simpleRes.data.data;
            }
          }
          setAllSimpleDropOffs(simpleDropoffs);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch regular drop-offs:", err);
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
    // Convert both types to unified format
    const regularUnified = allDropOffs.map(convertRegularDropoff);
    const simpleUnified = allSimpleDropOffs.map(convertSimpleDropoff);

    // Combine and filter by selected month/year
    const allUnified = [...regularUnified, ...simpleUnified];

    return allUnified
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
  }, [
    allDropOffs,
    allSimpleDropOffs,
    selectedMonth,
    selectedYear,
    convertRegularDropoff,
    convertSimpleDropoff,
  ]);

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
          {allDropOffs.length === 0 && allSimpleDropOffs.length === 0 && (
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
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-slate-700">
                    {dropOff.campaignName || dropOff.locationName}
                  </h2>
                  {dropOff.type === "simple" && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                      Quick Drop
                    </span>
                  )}
                  {dropOff.campaignName && (
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
                      Campaign
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {formatDateAndTime(dropOff.createdAt)}
                </p>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  {dropOff.items.map((item, index) => (
                    <span key={index} className="block">
                      {item}
                    </span>
                  ))}
                </div>
                <p
                  className={`text-xs mt-2 font-medium ${
                    dropOff.status === "Approved" ||
                    dropOff.status === "Verified"
                      ? "text-green-600"
                      : dropOff.status === "Pending"
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  Status: {dropOff.status}
                </p>
              </div>
              <div className="ml-4 text-right flex-shrink-0 flex flex-col items-end gap-2">
                <span className="bg-teal-100 text-teal-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  {dropOff.pointsEarned % 1 === 0
                    ? Math.floor(dropOff.pointsEarned)
                    : dropOff.pointsEarned.toFixed(1)}{" "}
                  CU
                </span>
                <button
                  onClick={() => handleShareDropoff(dropOff)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Share this dropoff"
                >
                  <FaShareAlt className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareData={shareData}
        title="Share Your Dropoff"
        subtitle="Show off your environmental impact!"
      />
    </div>
  );
};

export default UserDropOffs;
