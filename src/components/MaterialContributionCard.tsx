import React from "react";
import { IUserMaterialContribution } from "../types";
import {
  getMaterialIcon,
  getMaterialColor,
} from "../utils/materialContributions";
import {
  FaRecycle,
  FaLeaf,
  FaFile,
  FaGear,
  FaLaptop,
  FaGlassWater,
  FaShirt,
  FaBottleWater,
  FaBox,
} from "react-icons/fa6";

interface MaterialContributionCardProps {
  contribution: IUserMaterialContribution;
  isCompact?: boolean;
}

const MaterialContributionCard: React.FC<MaterialContributionCardProps> = ({
  contribution,
  isCompact = false,
}) => {
  const formatLargeNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    const suffixes = ["", "K", "M", "B", "T"];
    const i = Math.floor(Math.log10(Math.abs(num)) / 3);
    const val = num / Math.pow(1000, i);
    return val % 1 === 0
      ? val.toFixed(0) + suffixes[i]
      : val.toFixed(1) + suffixes[i];
  };

  const formatLastDropoff = (dateString?: string): string => {
    if (!dateString) return "No dropoffs yet";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getMaterialIconComponent = (materialType: string) => {
    const iconName = getMaterialIcon(materialType);
    const iconProps = { className: "text-2xl text-slate-700" };

    switch (iconName) {
      case "bottle-water":
        return <FaBottleWater {...iconProps} />;
      case "shirt":
        return <FaShirt {...iconProps} />;
      case "wine-glass":
        return <FaGlassWater {...iconProps} />;
      case "recycle":
        return <FaRecycle {...iconProps} />;
      case "leaf":
        return <FaLeaf {...iconProps} />;
      case "file-text":
        return <FaFile {...iconProps} />;
      case "cog":
        return <FaGear {...iconProps} />;
      case "laptop":
        return <FaLaptop {...iconProps} />;
      case "can":
        return <FaBox {...iconProps} />;
      default:
        return <FaRecycle {...iconProps} />;
    }
  };

  if (isCompact) {
    return (
      <div
        className={`p-4 rounded-xl shadow-sm border-2 ${getMaterialColor()}`}
      >
        <div className="flex items-center justify-between mb-2">
          {getMaterialIconComponent(contribution.materialType)}
          <div className="bg-black text-white px-2 py-1 rounded-full text-xs font-bold">
            {contribution.carbonUnits} CU
          </div>
        </div>
        <h3 className="font-semibold text-sm text-slate-800 mb-1">
          {contribution.label}
        </h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xl font-bold text-slate-900">
              {formatLargeNumber(contribution.totalQuantity)}
            </p>
            <p className="text-xs text-gray-600 -mt-1">units</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {contribution.totalDropoffs} dropoffs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl shadow-md border-2 ${getMaterialColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getMaterialIconComponent(contribution.materialType)}
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              {contribution.label}
            </h3>
            <p className="text-sm text-gray-600">
              {contribution.totalDropoffs} dropoffs
            </p>
          </div>
        </div>
        <div className="hiddenbg-black text-white px-3 py-2 rounded-full text-sm font-bold">
          {contribution.carbonUnits} CU
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Total Quantity</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatLargeNumber(contribution.totalQuantity)}
          </p>
          <p className="text-xs text-gray-600">units</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Last Dropoff</p>
          <p className="text-sm font-medium text-slate-700">
            {formatLastDropoff(contribution.lastDropoff)}
          </p>
        </div>
      </div>

      <div className="bg-white bg-opacity-50 rounded-lg p-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">Impact Score</span>
          <span className="font-bold text-green-700">
            {(
              (contribution.carbonUnits /
                Math.max(contribution.totalQuantity, 1)) *
              100
            ).toFixed(1)}
            % efficiency
          </span>
        </div>
      </div>
    </div>
  );
};

export default MaterialContributionCard;
