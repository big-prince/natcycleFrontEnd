/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import DropOffApi from "../../api/dropOffApi";
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import { IDropOff } from "../../types";
import Logo from "../../assets/logo/Group 202@2x.png";
import { BsUpcScan } from "react-icons/bs";
import { BiCalendar, BiCalendarAlt } from "react-icons/bi";

const mileStoneLevels = [
  { points: 0, name: "Novice" },
  { points: 1000, name: "Seedling" },
  { points: 2000, name: "Sprout" },
  { points: 5000, name: "Tree" },
  { points: 10000, name: "Forest" },
  { points: 20000, name: "Guardian" },
];

const getLevelName = (carbonUnits: number): string => {
  let level = mileStoneLevels[0].name;
  for (let i = mileStoneLevels.length - 1; i >= 0; i--) {
    if (carbonUnits >= mileStoneLevels[i].points) {
      level = mileStoneLevels[i].name;
      break;
    }
  }
  return level;
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

const GreenProfile: React.FC = () => {
  const navigate = useNavigate();
  const localUser = useAppSelector((state) => state.auth.user);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    currentYear === selectedYear ? currentMonth : 0
  );

  // Add view toggle state
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const [dropOffsByDay, setDropOffsByDay] = useState<Record<string, number>>(
    {}
  );
  const [allDropOffsForYear, setAllDropOffsForYear] = useState<IDropOff[]>([]);

  // Add state for year view data
  const [yearlyActivityData, setYearlyActivityData] = useState<
    Record<string, number>
  >({});
  const [totalDiversionsInYear, setTotalDiversionsInYear] = useState(0);

  const [totalDiversionsInMonth, setTotalDiversionsInMonth] = useState(0);
  const [uniqueDiversionDaysInYear, setUniqueDiversionDaysInYear] = useState(0);
  const [loading, setLoading] = useState(true);
  const ANNUAL_DAYS_GOAL = 365;

  const yearGridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localUser?._id) {
      setLoading(true);
      DropOffApi.getUserDropOffs(localUser._id)
        .then((res) => {
          const allUserDropOffs: IDropOff[] = res.data.data.docs || [];
          const yearlyDropOffs = allUserDropOffs.filter(
            (d) => new Date(d.createdAt).getFullYear() === selectedYear
          );
          setAllDropOffsForYear(yearlyDropOffs);
          setTotalDiversionsInYear(yearlyDropOffs.length); // Set total for year

          // Process data for the year (daily counts)
          const dailyCounts: Record<string, number> = {};
          yearlyDropOffs.forEach((dropOff) => {
            const date = new Date(dropOff.createdAt)
              .toISOString()
              .split("T")[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
          });
          setDropOffsByDay(dailyCounts);
          setYearlyActivityData(dailyCounts); // Store for year view
          setUniqueDiversionDaysInYear(Object.keys(dailyCounts).length);

          // Process data for the selected month
          processDropOffDataForMonth(yearlyDropOffs, selectedMonth);
        })
        .catch((err) => {
          console.error("Failed to fetch user drop-offs:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [localUser?._id, selectedYear, selectedMonth]);

  useEffect(() => {
    // This effect now only processes monthly data when selectedMonth or yearly data changes
    processDropOffDataForMonth(allDropOffsForYear, selectedMonth);
  }, [selectedMonth, allDropOffsForYear]);

  const processDropOffDataForMonth = (
    yearlyDropOffs: IDropOff[],
    month: number
  ) => {
    const monthlyDropOffs = yearlyDropOffs.filter(
      (d) => new Date(d.createdAt).getMonth() === month
    );
    setTotalDiversionsInMonth(monthlyDropOffs.length);
  };

  const getDaysInMonthGrid = (
    year: number,
    month: number
  ): (Date | null)[][] => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    // Add nulls for days before the first day of the month in the first week
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null);
    }
    // Add actual days of the month
    for (
      let d = new Date(firstDayOfMonth);
      d <= lastDayOfMonth;
      d.setDate(d.getDate() + 1)
    ) {
      days.push(new Date(d));
    }
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const getColorClasses = (count: number): { bg: string; text: string } => {
    if (count === 0)
      return { bg: "bg-slate-100 hover:bg-slate-200", text: "text-slate-500" };
    if (count <= 1)
      return { bg: "bg-green-200 hover:bg-green-300", text: "text-green-800" };
    if (count <= 3)
      return { bg: "bg-green-400 hover:bg-green-500", text: "text-white" };
    if (count <= 5)
      return { bg: "bg-green-600 hover:bg-green-700", text: "text-white" };
    return { bg: "bg-green-700 hover:bg-green-800", text: "text-white" };
  };

  const handleYearChange = (increment: number) => {
    const newYear = selectedYear + increment;
    if (newYear > currentYear) return; // Prevent going to future years
    setSelectedYear(newYear);
    // Reset to current month if new year is current year, else January
    setSelectedMonth(newYear === currentYear ? currentMonth : 0);
  };

  const handleMonthChange = (increment: number) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    if (
      newYear > currentYear ||
      (newYear === currentYear && newMonth > currentMonth)
    ) {
      return;
    }
    if (newYear > currentYear) return;

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
  };

  // New function to generate yearly activity cells
  const generateYearlyGrid = (year: number) => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    // Generate all days in the year
    const allDays: Date[] = [];
    for (
      let d = new Date(startOfYear);
      d <= endOfYear;
      d.setDate(d.getDate() + 1)
    ) {
      allDays.push(new Date(d));
    }

    // Organize days into weeks (starting on Sundays)
    const firstDay = new Date(startOfYear);
    const firstDayOfWeek = firstDay.getDay(); // 0-6, 0 is Sunday

    // Add padding at the beginning for the first week
    const paddedDays: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedDays.push(null);
    }

    const allPaddedDays = [...paddedDays, ...allDays];

    // Group into rows of 7 for each week
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < allPaddedDays.length; i += 7) {
      weeks.push(allPaddedDays.slice(i, i + 7));
    }

    return weeks;
  };

  // Enhanced color function for year view (5 levels of intensity)
  const getYearViewColorClasses = (
    count: number
  ): { bg: string; text: string } => {
    if (count === 0) return { bg: "bg-slate-100", text: "text-slate-500" };
    if (count === 1) return { bg: "bg-green-100", text: "text-green-800" };
    if (count === 2) return { bg: "bg-green-200", text: "text-green-800" };
    if (count <= 4) return { bg: "bg-green-400", text: "text-white" };
    return { bg: "bg-green-700", text: "text-white" };
  };

  // Add this effect to scroll to recent activity when view mode changes
  useEffect(() => {
    if (viewMode === "year" && yearGridContainerRef.current) {
      // Wait for render to complete
      setTimeout(() => {
        // Find the most recent active day
        const today = new Date();
        const scrollOffset =
          today.getFullYear() === selectedYear
            ? // If viewing current year, scroll to today's approximate position
              yearGridContainerRef.current!.scrollWidth * 0.9
            : // If viewing past year, scroll to December
              yearGridContainerRef.current!.scrollWidth * 0.85;

        yearGridContainerRef.current!.scrollLeft = scrollOffset;
      }, 100);
    }
  }, [viewMode, selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-lg text-slate-600">Loading Green Profile...</p>
      </div>
    );
  }

  if (!localUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-lg text-slate-600">User not found. Please log in.</p>
      </div>
    );
  }

  const monthGrid = getDaysInMonthGrid(selectedYear, selectedMonth);
  const yearGrid = generateYearlyGrid(selectedYear);
  console.log("Year Grid:", yearGrid);
  // Updated progress percentage calculation
  const progressPercentage = Math.min(
    (uniqueDiversionDaysInYear / ANNUAL_DAYS_GOAL) * 100,
    100
  );
  const userLevel = getLevelName(localUser.carbonUnits || 0);
  const joinDate = localUser.createdAt
    ? new Date(localUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
      <div className="max-w-[550px] mx-auto relative mb-6">
        <div className="flex justify-between items-center">
          <Link to="/home">
            <img className="object-cover h-10" src={Logo} alt="NatCycle Logo" />
          </Link>
          <button
            onClick={() => navigate("/scan")}
            className="flex items-center text-sm font-semibold text-slate-700 hover:text-green-600 transition-colors"
          >
            <span className="mr-1.5 underline">SCAN</span>
            <BsUpcScan className="text-2xl" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-green-700 font-medium transition-colors group"
        >
          <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        {/* User Info - Flattened */}
        <div className="text-center mb-10 pt-4">
          <img
            src={
              localUser.profilePicture?.url ||
              `https://ui-avatars.com/api/?name=${localUser.firstName}+${localUser.lastName}&background=EBF4FF&color=0D47A1&font-size=0.4&bold=true`
            }
            alt={`${localUser.firstName} ${localUser.lastName}`}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full mx-auto mb-4 object-cover border-4 border-slate-200 shadow-sm"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            {localUser.firstName} {localUser.lastName}
          </h1>
          <p className="text-green-600 font-semibold text-md mt-1">
            Level: {userLevel}
          </p>
          <p className="text-slate-500 text-sm mt-0.5">Joined {joinDate}</p>
        </div>

        {/* Green Commits Card */}
        <div className="bg-white p-5 md:p-8 rounded-xl shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-1 sm:mb-0">
              Green Commits
            </h2>
            <p className="text-slate-500 text-sm">
              {viewMode === "month"
                ? `${totalDiversionsInMonth} waste diversions this month`
                : `${totalDiversionsInYear} waste diversions this year`}
            </p>
          </div>

          <div className="mb-5 mt-3">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
              <span>Active Days ({selectedYear})</span>
              <span className="font-medium text-slate-600">Days Goal</span>
            </div>
            {/* Progress Bar Container */}
            <div className="w-full h-6 bg-green-100 rounded-full relative overflow-hidden">
              {/* Filled portion of the bar */}
              <div
                className={`h-full bg-slate-800 rounded-full flex items-center justify-end pr-1.5 transition-all duration-700 ease-out ${
                  uniqueDiversionDaysInYear > 0 ? "min-w-[30px]" : "" // Apply min-width if there are active days
                }`}
                style={{ width: `${progressPercentage}%` }}
              >
                {uniqueDiversionDaysInYear > 0 && ( // Show number inside filled bar if days > 0
                  <span className="text-xs font-bold text-white">
                    {Math.floor(uniqueDiversionDaysInYear)}
                  </span>
                )}
              </div>
              {uniqueDiversionDaysInYear === 0 && ( // Show "0" on the track if no active days
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  0
                </span>
              )}
            </div>
            {/* Range labels */}
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0</span>
              <span>{ANNUAL_DAYS_GOAL}</span>
            </div>
          </div>

          {/* New View Toggle */}
          <div className="flex justify-center my-4">
            <div className="bg-slate-100 rounded-full p-1 inline-flex">
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors ${
                  viewMode === "month"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <BiCalendar className="mr-1.5 text-lg" /> Month View
              </button>
              <button
                onClick={() => setViewMode("year")}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center transition-colors ${
                  viewMode === "year"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <BiCalendarAlt className="mr-1.5 text-lg" /> Year View
              </button>
            </div>
          </div>

          {/* Year and Month Navigation */}
          <div className="flex justify-center items-center space-x-2 my-6 bg-slate-50 p-4 rounded-lg">
            <button
              onClick={() => handleYearChange(-1)}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors"
              aria-label="Previous year"
            >
              <FaChevronLeft className="text-slate-600 h-4 w-4" />
            </button>
            <span className="text-lg font-semibold text-slate-700 w-20 text-center">
              {selectedYear}
            </span>
            <button
              onClick={() => handleYearChange(1)}
              disabled={selectedYear >= currentYear}
              className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-40 transition-colors"
              aria-label="Next year"
            >
              <FaChevronRight className="text-slate-600 h-4 w-4" />
            </button>
          </div>

          {/* Month selection - Only show in Month View */}
          {viewMode === "month" && (
            <div className="flex justify-center items-center space-x-2 my-6 bg-slate-50 p-4 rounded-lg">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Previous month"
              >
                <FaChevronLeft className="text-slate-600 h-4 w-4" />
              </button>
              <span className="text-lg font-semibold text-slate-700 w-28 sm:w-32 text-center">
                {monthNames[selectedMonth]}
              </span>
              <button
                onClick={() => handleMonthChange(1)}
                disabled={
                  selectedYear === currentYear && selectedMonth >= currentMonth
                }
                className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-40 transition-colors"
                aria-label="Next month"
              >
                <FaChevronRight className="text-slate-600 h-4 w-4" />
              </button>
            </div>
          )}

          {/* View Switcher - Conditional Rendering */}
          {viewMode === "month" ? (
            // Monthly Activity Grid - Same as before
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((dayName, index) => (
                <div
                  key={`${dayName}-${index}`}
                  className="text-xs font-medium text-slate-500 text-center pb-1"
                >
                  {dayName}
                </div>
              ))}
              {monthGrid.flat().map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="w-full aspect-square rounded-md"
                    ></div>
                  );
                }
                const dateString = day.toISOString().split("T")[0];
                const count = dropOffsByDay[dateString] || 0;
                const { bg, text } = getColorClasses(count);
                return (
                  <div
                    key={dateString}
                    title={`${day.toLocaleDateString()}: ${count} drop-off(s)`}
                    className={`w-full aspect-square ${bg} rounded-md flex items-center justify-center cursor-default transition-colors`}
                  >
                    <span className={`text-xs font-medium ${text}`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            // Year Activity View - True GitHub-style Grid with Larger Boxes
            <div className="py-6">
              <div className="w-full max-w-3xl mx-auto">
                {/* Activity grid with larger, more visible boxes */}
                <div
                  className="overflow-x-auto pb-4"
                  ref={yearGridContainerRef}
                >
                  <div
                    className="inline-grid mx-auto"
                    style={{
                      gridTemplateRows: "repeat(7, 14px)",
                      gridTemplateColumns: "repeat(52, 14px)",
                      gridGap: "3px",
                      width: "fit-content",
                    }}
                  >
                    {Array.from({ length: 364 }).map((_, index) => {
                      // Calculate actual date from index
                      const weekNum = Math.floor(index / 7);
                      const dayOfWeek = index % 7;

                      // Calculate date with proper alignment
                      const jan1 = new Date(selectedYear, 0, 1);
                      const jan1DayOfWeek = jan1.getDay();
                      const dayOffset = index - jan1DayOfWeek;
                      const date = new Date(selectedYear, 0, 1);
                      date.setDate(date.getDate() + dayOffset);

                      // Skip cells outside current year
                      if (date.getFullYear() !== selectedYear) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="w-[14px] h-[14px]"
                          ></div>
                        );
                      }

                      const dateString = date.toISOString().split("T")[0];
                      const count = yearlyActivityData[dateString] || 0;
                      const { bg } = getYearViewColorClasses(count);

                      return (
                        <div
                          key={`cell-${index}`}
                          title={`${date.toLocaleDateString()}: ${count} drop-off(s)`}
                          className={`w-[14px] h-[14px] ${bg} rounded-sm border border-white/20 hover:ring-1 hover:ring-slate-400`}
                          style={{
                            gridRow: dayOfWeek + 1,
                            gridColumn: weekNum + 1,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Legend with larger items to match */}
                <div className="flex justify-center items-center mt-4 space-x-2 text-xs text-slate-500">
                  <span>Less</span>
                  <div className="w-[14px] h-[14px] bg-slate-100 rounded-sm border border-slate-200"></div>
                  <div className="w-[14px] h-[14px] bg-green-100 rounded-sm border border-slate-200"></div>
                  <div className="w-[14px] h-[14px] bg-green-200 rounded-sm border border-slate-200"></div>
                  <div className="w-[14px] h-[14px] bg-green-400 rounded-sm border border-slate-200"></div>
                  <div className="w-[14px] h-[14px] bg-green-700 rounded-sm border border-slate-200"></div>
                  <span>More</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600 mt-8 text-center font-medium">
            All time:{" "}
            <span className="font-bold text-green-700">
              {Math.floor(localUser.carbonUnits || 0)} CU
            </span>
          </p>
        </div>

        {/* About section - Same as before */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3">
            What is Green Profile?
          </h3>
          <p className="text-slate-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            Your Green Profile is measured using the NatCycle Carbon Unit (CU)
            standard. Each action you take to divert waste contributes to your
            CUs and helps build your positive impact.{" "}
            <Link
              to="/about-cu"
              className="text-green-600 hover:text-green-700 underline font-semibold transition-colors"
            >
              Learn more about CUs
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreenProfile;
