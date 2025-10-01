import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../hooks/reduxHooks";
import { IUserMaterialContribution } from "../../types";
import { calculateUserContributions } from "../../utils/materialContributions";
import MaterialContributionCard from "../../components/MaterialContributionCard";
import DropOffApi from "../../api/dropOffApi";
import materialApi from "../../api/materialApi";
import { IoChevronBack, IoSearch } from "react-icons/io5";
import { FaLeaf } from "react-icons/fa6";
import Loading from "../../components/Loading";

interface IDropoffData {
  _id: string;
  itemType?: string;
  itemQuantity?: number;
  createdAt: string;
  pointsEarned?: number;
}

const AllMaterialContributions: React.FC = () => {
  const localUser = useAppSelector((state) => state.auth.user);
  const [contributions, setContributions] = useState<
    IUserMaterialContribution[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!localUser?._id) return;

      const itemsCount = localUser?.itemsCount || {
        plastic: 0,
        fabric: 0,
        glass: 0,
        mixed: 0,
      };

      setIsLoading(true);
      try {
        // Fetch user dropoffs
        const dropOffResponse = await DropOffApi.getUserDropOffs(localUser._id);
        const dropOffs: IDropoffData[] = dropOffResponse.data.data || [];

        // Fetch all material types from backend
        const materialResponse = await materialApi.getMaterialsCategory();
        const materialTypes: string[] =
          materialResponse.data.data.primaryTypes || [];

        // Calculate user contributions
        const userContributions = await calculateUserContributions(
          dropOffs,
          itemsCount,
          materialTypes
        );

        setContributions(userContributions);
      } catch (error) {
        console.error("Error fetching material contributions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [localUser?._id, localUser?.itemsCount]);

  const filteredContributions = contributions.filter(
    (contribution) =>
      contribution.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contribution.materialType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCarbonUnits = contributions.reduce(
    (sum, c) => sum + c.carbonUnits,
    0
  );
  const totalDropoffs = contributions.reduce(
    (sum, c) => sum + c.totalDropoffs,
    0
  );
  const activeContributions = contributions.filter(
    (c) => c.totalQuantity > 0
  ).length;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
        <Link to="/impact" className="p-2 rounded-full hover:bg-gray-100">
          <IoChevronBack className="text-xl" />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">
          Material Contributions
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Summary Stats */}
      <div className="p-4">
        <div className="hidden bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white mb-6">
          <div className="flex items-center justify-between mb-3">
            <FaLeaf className="text-3xl" />
            <span className="text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
              Overall Impact
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalCarbonUnits}</p>
              <p className="text-xs opacity-90">Carbon Units</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalDropoffs}</p>
              <p className="text-xs opacity-90">Total Dropoffs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{activeContributions}</p>
              <p className="text-xs opacity-90">Active Types</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search material types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Contributions List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              Your Contributions
            </h2>
            <p className="text-sm text-gray-500">
              {filteredContributions.length} types
            </p>
          </div>

          {filteredContributions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No material types found matching "{searchTerm}"
              </p>
            </div>
          ) : (
            filteredContributions.map((contribution) => (
              <MaterialContributionCard
                key={contribution.materialType}
                contribution={contribution}
                isCompact={false}
              />
            ))
          )}
        </div>

        {/* Action Button */}
        <div className="hidden mt-8 text-center">
          <Link
            to="/dashboard/where"
            className="bg-black text-white px-6 py-3 rounded-xl font-medium inline-flex items-center space-x-2 hover:bg-gray-800 transition-colors"
          >
            <span>Start New Dropoff</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AllMaterialContributions;
