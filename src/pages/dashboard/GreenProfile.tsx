import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { useAppSelector } from "../../hooks/reduxHooks";
import DropOffApi from "../../api/dropOffApi";
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from "react-icons/fa"; // Added FaArrowLeft
import { IDropOff } from "../../types";
import Logo from "../../assets/logo/Group 202@2x.png";
import { BsUpcScan } from "react-icons/bs"; // Added for SCAN button

// Define or import mileStoneNumbers if level is based on them
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

const GreenProfile: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const localUser = useAppSelector((state) => state.auth.user);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dropOffsByDay, setDropOffsByDay] = useState<Record<string, number>>(
    {}
  );
  const [totalDiversionsInYear, setTotalDiversionsInYear] = useState(0);
  const [carbonUnitsInYear, setCarbonUnitsInYear] = useState(0);
  const [loading, setLoading] = useState(true);

  const ANNUAL_CU_GOAL = 365;

  useEffect(() => {
    if (localUser?._id) {
      setLoading(true);
      DropOffApi.getUserDropOffs(localUser._id)
        .then((res) => {
          const allDropOffs: IDropOff[] = res.data.data.docs || [];
          processDropOffData(allDropOffs, selectedYear);
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

  const processDropOffData = (dropOffs: IDropOff[], year: number) => {
    const yearlyDropOffs = dropOffs.filter(
      (d) => new Date(d.createdAt).getFullYear() === year
    );

    setTotalDiversionsInYear(yearlyDropOffs.length);

    const CUsThisYear = yearlyDropOffs.reduce(
      (sum, d) => sum + (d.pointsEarned || 0),
      0
    );
    setCarbonUnitsInYear(CUsThisYear);

    const counts: Record<string, number> = {};
    yearlyDropOffs.forEach((dropOff) => {
      const date = new Date(dropOff.createdAt).toISOString().split("T")[0];
      counts[date] = (counts[date] || 0) + 1; // Counting drop-offs, not CUs for the graph squares
    });
    setDropOffsByDay(counts);
  };

  const getDaysInYearGrid = (year: number): (Date | null)[][] => {
    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31);
    const days: (Date | null)[] = [];

    // Add nulls for padding at the beginning of the first week
    for (let i = 0; i < firstDayOfYear.getDay(); i++) {
      days.push(null);
    }

    for (
      let d = new Date(firstDayOfYear);
      d <= lastDayOfYear;
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

  const getColorForCount = (count: number): string => {
    if (count === 0) return "bg-slate-200 hover:bg-slate-300"; // Slightly darker base for contrast
    if (count <= 1) return "bg-lime-300 hover:bg-lime-400";
    if (count <= 3) return "bg-lime-500 hover:bg-lime-600";
    if (count <= 5) return "bg-lime-700 hover:bg-lime-800";
    return "bg-green-700 hover:bg-green-800"; // Darkest green
  };

  const handleYearChange = (increment: number) => {
    setSelectedYear((prevYear) => prevYear + increment);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Green Profile...</div>;
  }

  if (!localUser) {
    return (
      <div className="p-10 text-center">User not found. Please log in.</div>
    );
  }

  const yearGrid = getDaysInYearGrid(selectedYear);
  const progressPercentage = Math.min(
    (carbonUnitsInYear / ANNUAL_CU_GOAL) * 100,
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
    <div className="min-h-screen px-6 md:px-6">
      <div className="max-w-[550px] m-auto relative px-4 pb-4">
        {" "}
        <div className="flex justify-between items-center mt-6 mb-3">
          <Link to="/home">
            <img className="object-cover h-10" src={Logo} alt="NatCycle Logo" />
          </Link>

          <div className="flex items-center ">
            {/* SCAN Button */}
            <button
              onClick={() => alert("SCAN functionality to be implemented")}
              className="flex items-center text-sm font-medium text-black"
            >
              <span className="mr-1 font-bold text-xm underline">SCAN</span>
              <BsUpcScan className="text-2xl" />
            </button>
          </div>
        </div>
      </div>{" "}
      <div className="max-w-3xl mx-auto">
        {" "}
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-sm text-black hover:text-sky-800 font-medium transition-colors group"
        >
          <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        {/* User Info */}
        <div className="text-center mb-10">
          {" "}
          {/* Reduced bottom margin */}
          <img
            src={
              localUser.profilePicture?.url ||
              `https://ui-avatars.com/api/?name=${localUser.firstName}+${localUser.lastName}&background=random&color=fff`
            }
            alt={`${localUser.firstName} ${localUser.lastName}`}
            className="w-28 h-28 md:w-32 md:h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            {localUser.firstName} {localUser.lastName}
          </h1>
          <p className="text-slate-600 text-md">Level: {userLevel}</p>
          <p className="text-slate-500 text-sm">Joined {joinDate}</p>
        </div>
        {/* Green Commits Section */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-xl mb-10">
          {" "}
          {/* Reduced padding */}
          <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-1">
            Green Commits
          </h2>
          <p className="text-slate-500 text-sm mb-2">
            {" "}
            {/* Smaller text */}
            {totalDiversionsInYear} waste diversions in {selectedYear}
          </p>
          <div className="flex justify-end mb-3">
            {" "}
            {/* Reduced bottom margin */}
            <p className="text-xs text-slate-600 font-medium">CU Goal</p>{" "}
            {/* Smaller text */}
          </div>
          {/* Progress Bar */}
          <div className="w-full h-5 bg-lime-100 rounded-full mb-1 relative">
            {" "}
            {/* Slightly smaller height */}
            <div
              className="h-full bg-slate-800 rounded-full flex items-center justify-end transition-all duration-500 ease-in-out pr-1.5" // Reduced padding right
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 15 && ( // Show number if progress is a bit more
                <span className="text-xs font-bold text-white">
                  {Math.floor(carbonUnitsInYear)}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-5 px-0.5">
            {" "}
            {/* Reduced bottom margin and padding */}
            <span>0</span>
            <span>{ANNUAL_CU_GOAL}</span>
          </div>
          {progressPercentage <= 15 && carbonUnitsInYear > 0 && (
            <p className="text-right text-xs font-bold -mt-4 mr-1 text-slate-800">
              {" "}
              {/* Adjusted margin */}
              {Math.floor(carbonUnitsInYear)}
            </p>
          )}
          {/* Year Navigation */}
          <div className="flex items-center justify-center space-x-3 my-3">
            {" "}
            {/* Reduced margins and spacing */}
            <button
              onClick={() => handleYearChange(-1)}
              className="p-1.5 rounded-md hover:bg-slate-100" // Smaller padding
            >
              <FaChevronLeft className="text-slate-600" />
            </button>
            <span className="text-md md:text-lg font-semibold text-slate-700">
              {" "}
              {/* Slightly smaller text */}
              {selectedYear}
            </span>
            <button
              onClick={() => handleYearChange(1)}
              className="p-1.5 rounded-md hover:bg-slate-100" // Smaller padding
              disabled={selectedYear >= new Date().getFullYear()}
            >
              <FaChevronRight className="text-slate-600" />
            </button>
          </div>
          {/* Commit Graph Container */}
          <div className="mt-3 p-1 bg-slate-100 rounded-md flex justify-center">
            {" "}
            {/* Reduced padding and margin */}
            <div className="grid grid-rows-7 grid-flow-col gap-0.5">
              {" "}
              {/* Smaller gap */}
              {yearGrid.flat().map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="w-3 h-3 bg-transparent rounded-sm" // Increased size
                    ></div>
                  );
                }
                const dateString = day.toISOString().split("T")[0];
                const count = dropOffsByDay[dateString] || 0;
                return (
                  <div
                    key={dateString}
                    title={`${dateString}: ${count} drop-off(s)`}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-colors ${getColorForCount(
                      // Increased size
                      count
                    )}`}
                  />
                );
              })}
            </div>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mt-4 text-center">
            {" "}
            {/* Reduced margin and text size */}
            All time: {Math.floor(localUser.carbonUnits || 0)} CU
          </p>
        </div>
        {/* What is Green Profile? */}
        <div className="text-center">
          <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-1.5">
            {" "}
            {/* Reduced margin and text size */}
            What is Green Profile?
          </h3>
          <p className="text-slate-600 text-xs md:text-sm max-w-xl mx-auto">
            {" "}
            {/* Reduced max-width and text size */}
            Green profile is measured using NatCycle CU standard. Each action
            you take to divert waste contributes to your Carbon Units (CU) and
            helps build your positive impact.{" "}
            <Link
              to="/about-cu"
              className="text-lime-600 hover:underline font-medium"
            >
              Read more on Green Profile
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreenProfile;
