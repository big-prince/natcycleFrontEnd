/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import DropOffApi from "../../api/dropOffApi";
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import { IDropOff } from "../../types";
import Logo from "../../assets/logo/Group 202@2x.png";
import { BsUpcScan } from "react-icons/bs";

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

interface PopupInfo {
  dateDisplay: string;
  count: number;
  x: number;
  y: number;
}

const GreenProfile: React.FC = () => {
  const navigate = useNavigate();
  const localUser = useAppSelector((state) => state.auth.user);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(
    currentYear === selectedYear ? currentMonth : 0
  );

  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const [dropOffsByDay, setDropOffsByDay] = useState<Record<string, number>>(
    {}
  );
  const [allDropOffsForYear, setAllDropOffsForYear] = useState<IDropOff[]>([]);
  const [yearlyActivityData, setYearlyActivityData] = useState<
    Record<string, number>
  >({});
  const [totalDiversionsInYear, setTotalDiversionsInYear] = useState(0);
  const [totalDiversionsInMonth, setTotalDiversionsInMonth] = useState(0);
  const [uniqueDiversionDaysInYear, setUniqueDiversionDaysInYear] = useState(0);
  const [loading, setLoading] = useState(true);
  const ANNUAL_DAYS_GOAL = 365;

  const yearGridContainerRef = useRef<HTMLDivElement>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const popupTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (localUser?._id) {
      setLoading(true);
      DropOffApi.getUserDropOffs(localUser._id)
        .then((res) => {
          const allUserDropOffs: IDropOff[] = res.data.data || [];
          const yearlyDropOffs = allUserDropOffs.filter(
            (d) => new Date(d.createdAt).getFullYear() === selectedYear
          );
          setAllDropOffsForYear(yearlyDropOffs);
          setTotalDiversionsInYear(yearlyDropOffs.length);

          const dailyCounts: Record<string, number> = {};
          yearlyDropOffs.forEach((dropOff) => {
            const localEventDate = new Date(dropOff.createdAt);
            const year = localEventDate.getFullYear();
            const month = (localEventDate.getMonth() + 1)
              .toString()
              .padStart(2, "0");
            const day = localEventDate.getDate().toString().padStart(2, "0");
            const localDateString = `${year}-${month}-${day}`;
            dailyCounts[localDateString] =
              (dailyCounts[localDateString] || 0) + 1;
          });
          setDropOffsByDay(dailyCounts);
          setYearlyActivityData(dailyCounts);
          setUniqueDiversionDaysInYear(Object.keys(dailyCounts).length);

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
  }, [localUser?._id, selectedYear]);

  useEffect(() => {
    processDropOffDataForMonth(allDropOffsForYear, selectedMonth);
  }, [selectedMonth, allDropOffsForYear, selectedYear]);
  useEffect(() => {
    // Cleanup timer if component unmounts
    return () => {
      if (popupTimerRef.current !== null) {
        window.clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const handleDayCellClick = (
    dateObj: Date,
    count: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (popupTimerRef.current !== null) {
      window.clearTimeout(popupTimerRef.current);
    }

    const formattedDate = dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    setPopupInfo({
      dateDisplay: formattedDate,
      count,
      x: event.clientX,
      y: event.clientY,
    });

    popupTimerRef.current = window.setTimeout(() => {
      setPopupInfo(null);
    }, 5000);
  };

  const processDropOffDataForMonth = (dropOffs: IDropOff[], month: number) => {
    const monthlyDropOffs = dropOffs.filter(
      (d) =>
        new Date(d.createdAt).getMonth() === month &&
        new Date(d.createdAt).getFullYear() === selectedYear
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
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null);
    }
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

  const goToPrevious = () => {
    if (viewMode === "month") {
      let newMonth = selectedMonth - 1;
      let newYear = selectedYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      // Add a sensible lower bound for year if desired, e.g., if (newYear < 2000) return;
      setSelectedYear(newYear);
      setSelectedMonth(newMonth);
    } else {
      // year view
      // Add a sensible lower bound if desired
      setSelectedYear((prevYear) => prevYear - 1);
    }
  };

  const goToNext = () => {
    const today = new Date();
    const currentRealYear = today.getFullYear();
    const currentRealMonth = today.getMonth();

    if (viewMode === "month") {
      let newMonth = selectedMonth + 1;
      let newYear = selectedYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      if (
        newYear > currentRealYear ||
        (newYear === currentRealYear && newMonth > currentRealMonth)
      ) {
        return;
      }
      setSelectedYear(newYear);
      setSelectedMonth(newMonth);
    } else {
      // year view
      if (selectedYear < currentRealYear) {
        setSelectedYear((prevYear) => prevYear + 1);
      }
    }
  };

  const isNextDisabled = () => {
    const today = new Date();
    const currentRealYear = today.getFullYear();
    const currentRealMonth = today.getMonth();

    if (viewMode === "month") {
      let testMonth = selectedMonth + 1;
      let testYear = selectedYear;
      if (testMonth > 11) {
        testMonth = 0;
        testYear += 1;
      }
      return (
        testYear > currentRealYear ||
        (testYear === currentRealYear && testMonth > currentRealMonth)
      );
    } else {
      // year view
      return selectedYear >= currentRealYear;
    }
  };

  const generateYearlyGrid = (year: number) => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const allDays: Date[] = [];
    for (
      let d = new Date(startOfYear);
      d <= endOfYear;
      d.setDate(d.getDate() + 1)
    ) {
      allDays.push(new Date(d));
    }
    const firstDay = new Date(startOfYear);
    const firstDayOfWeek = firstDay.getDay();
    const paddedDays: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      paddedDays.push(null);
    }
    const allPaddedDays = [...paddedDays, ...allDays];
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < allPaddedDays.length; i += 7) {
      weeks.push(allPaddedDays.slice(i, i + 7));
    }
    return weeks;
  };
  console.log(generateYearlyGrid(selectedYear).length);

  const getYearViewColorClasses = (
    count: number
  ): { bg: string; text: string } => {
    if (count === 0) return { bg: "bg-slate-100", text: "text-slate-500" };
    if (count === 1) return { bg: "bg-green-100", text: "text-green-800" };
    if (count === 2) return { bg: "bg-green-200", text: "text-green-800" };
    if (count <= 4) return { bg: "bg-green-400", text: "text-white" };
    return { bg: "bg-green-700", text: "text-white" };
  };

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
  const progressPercentage = Math.min(
    (uniqueDiversionDaysInYear / ANNUAL_DAYS_GOAL) * 100,
    100
  );
  const userLevel = getLevelName(localUser.carbonUnits || 0);
  const joinDate = localUser
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
            <div className="w-full h-6 bg-green-100 rounded-full relative overflow-hidden">
              <div
                className={`h-full bg-black rounded-full flex items-center justify-end pr-1.5 transition-all duration-700 ease-out ${
                  uniqueDiversionDaysInYear > 0 ? "min-w-[30px]" : ""
                }`}
                style={{ width: `${progressPercentage}%` }}
              >
                {uniqueDiversionDaysInYear > 0 && (
                  <span className="text-xs font-bold text-white">
                    {Math.floor(uniqueDiversionDaysInYear)}
                  </span>
                )}
              </div>
              {uniqueDiversionDaysInYear === 0 && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  0
                </span>
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0</span>
              <span>{ANNUAL_DAYS_GOAL}</span>
            </div>
          </div>

          <div className="mb-4 space-y-3">
            <div className="flex">
              <button
                onClick={() =>
                  setViewMode((prev) => (prev === "month" ? "year" : "month"))
                }
                className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 py-2 px-4 rounded-md shadow-sm transition-colors ease-in-out duration-150"
              >
                {viewMode === "month"
                  ? "Switch to Year View"
                  : "Switch to Month View"}
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg shadow-sm">
              <button
                onClick={goToPrevious}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors focus:outline-none"
                aria-label={
                  viewMode === "month" ? "Previous month" : "Previous year"
                }
              >
                <FaChevronLeft size={20} />
              </button>
              <span className="font-semibold text-slate-700 text-md select-none">
                {viewMode === "month"
                  ? `${monthNames[selectedMonth]} ${selectedYear}`
                  : selectedYear}
              </span>
              <button
                onClick={goToNext}
                disabled={isNextDisabled()}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
                aria-label={viewMode === "month" ? "Next month" : "Next year"}
              >
                <FaChevronRight size={20} />
              </button>
            </div>
          </div>

          {viewMode === "month" ? (
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
                const year = day.getFullYear();
                const month = (day.getMonth() + 1).toString().padStart(2, "0");
                const dayOfMonth = day.getDate().toString().padStart(2, "0");
                const dateString = `${year}-${month}-${dayOfMonth}`;

                const count = dropOffsByDay[dateString] || 0;
                const { bg, text } = getColorClasses(count);
                return (
                  <div
                    key={dateString}
                    title={`${day.toLocaleDateString()}: ${count} drop-off(s)`}
                    className={`w-full aspect-square ${bg} rounded-md flex items-center justify-center cursor-pointer transition-colors`}
                    onClick={(e) => handleDayCellClick(day, count, e)}
                  >
                    <span className={`text-xs font-medium ${text}`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6">
              <div className="w-full max-w-3xl mx-auto">
                <div
                  className="overflow-y-auto overflow-x-hidden pb-4 max-h-[400px]"
                  ref={yearGridContainerRef}
                >
                  {(() => {
                    const CELL_SIZE_PX = 18;
                    const GAP_PX = 3;
                    const WEEKS_TO_DISPLAY_HORIZONTALLY = 17;
                    const TOTAL_CONCEPTUAL_WEEKS = 53;
                    const DAYS_IN_WEEK = 7;

                    const numDisplayGridCols = WEEKS_TO_DISPLAY_HORIZONTALLY;
                    const numMetaRows = Math.ceil(
                      TOTAL_CONCEPTUAL_WEEKS / WEEKS_TO_DISPLAY_HORIZONTALLY
                    );
                    const numDisplayGridRows = numMetaRows * DAYS_IN_WEEK;

                    return (
                      <div
                        className="inline-grid mx-auto"
                        style={{
                          gridTemplateColumns: `repeat(${numDisplayGridCols}, ${CELL_SIZE_PX}px)`,
                          gridTemplateRows: `repeat(${numDisplayGridRows}, ${CELL_SIZE_PX}px)`,
                          gridGap: `${GAP_PX}px`,
                        }}
                      >
                        {Array.from({
                          length: TOTAL_CONCEPTUAL_WEEKS * DAYS_IN_WEEK,
                        }).map((_, index) => {
                          // Using 'index' as per original file
                          const originalGridWeekNum = Math.floor(
                            index / DAYS_IN_WEEK
                          );
                          const originalGridDayInWeek = index % DAYS_IN_WEEK;

                          const displayMetaRow = Math.floor(
                            originalGridWeekNum / WEEKS_TO_DISPLAY_HORIZONTALLY
                          );
                          const displayColInMetaRow =
                            originalGridWeekNum % WEEKS_TO_DISPLAY_HORIZONTALLY;

                          const finalDisplayGridColumn =
                            displayColInMetaRow + 1;
                          const finalDisplayGridRow =
                            displayMetaRow * DAYS_IN_WEEK +
                            originalGridDayInWeek +
                            1;

                          const jan1 = new Date(selectedYear, 0, 1);
                          const jan1DayOfWeek = jan1.getDay();

                          const dayOffset = index - jan1DayOfWeek;
                          const date = new Date(selectedYear, 0, 1);
                          date.setDate(date.getDate() + dayOffset);

                          if (date.getFullYear() !== selectedYear) {
                            return (
                              <div
                                key={`empty-${index}`}
                                className="w-[18px] h-[18px]"
                                style={{
                                  gridRow: finalDisplayGridRow,
                                  gridColumn: finalDisplayGridColumn,
                                }}
                              ></div>
                            );
                          }

                          const yearStr = date.getFullYear();
                          const monthStr = (date.getMonth() + 1)
                            .toString()
                            .padStart(2, "0");
                          const dayOfMonthStr = date
                            .getDate()
                            .toString()
                            .padStart(2, "0");
                          const dateString = `${yearStr}-${monthStr}-${dayOfMonthStr}`;

                          const count = yearlyActivityData[dateString] || 0;
                          const { bg } = getYearViewColorClasses(count);

                          return (
                            <div
                              key={`cell-${dateString}-${index}`}
                              title={`${date.toLocaleDateString()}: ${count} drop-off(s)`}
                              className={`w-[18px] h-[18px] ${bg} rounded-sm border border-white/20 hover:ring-1 hover:ring-slate-400 cursor-pointer`}
                              style={{
                                gridRow: finalDisplayGridRow,
                                gridColumn: finalDisplayGridColumn,
                              }}
                              onClick={(e) =>
                                handleDayCellClick(date, count, e)
                              }
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex justify-center items-center mt-4 space-x-2 text-xs text-slate-500">
                  <span>Less</span>
                  <div className="w-[18px] h-[18px] bg-slate-100 rounded-sm border border-slate-200"></div>
                  <div className="w-[18px] h-[18px] bg-green-100 rounded-sm border border-slate-200"></div>
                  <div className="w-[18px] h-[18px] bg-green-200 rounded-sm border border-slate-200"></div>
                  <div className="w-[18px] h-[18px] bg-green-400 rounded-sm border border-slate-200"></div>
                  <div className="w-[18px] h-[18px] bg-green-700 rounded-sm border border-slate-200"></div>
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

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-black mb-3">
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
      </div>{" "}
      {/* Popup Component */}
      {popupInfo && (
        <div
          style={{
            position: "fixed",
            top: `${popupInfo.y}px`,
            left: `${popupInfo.x}px`,
            transform: "translate(15px, -110%)", // Position above and slightly to the right of cursor
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className="bg-slate-900 text-white py-2 px-4 rounded-md shadow-2xl text-sm transition-opacity duration-300 ease-out"
        >
          <p className="font-semibold whitespace-nowrap">
            {popupInfo.dateDisplay}
          </p>
          <p className="whitespace-nowrap">Drop-offs: {popupInfo.count}</p>
        </div>
      )}
    </div>
  );
};

export default GreenProfile;
