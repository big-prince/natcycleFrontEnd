import React, { useState } from "react";
import SocialShareModal from "../social/SocialShareModal";
import { useSocialShare } from "../../hooks/useSocialShare";
import { MilestoneData } from "../../types/social";
import { FaTrophy, FaShare } from "react-icons/fa6";

interface MilestoneShareButtonProps {
  milestoneData: MilestoneData;
  className?: string;
  variant?: "default" | "compact";
}

const MilestoneShareButton: React.FC<MilestoneShareButtonProps> = ({
  milestoneData,
  className = "",
  variant = "default",
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const { createMilestoneShareData } = useSocialShare();

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const shareData = createMilestoneShareData(milestoneData);

  const getMilestoneIcon = () => {
    switch (milestoneData.type) {
      case "carbon_units":
        return "🌱";
      case "dropoff_count":
        return "♻️";
      case "badge_earned":
        return "🏆";
      default:
        return "⭐";
    }
  };

  const getMilestoneText = () => {
    switch (milestoneData.type) {
      case "carbon_units":
        return `${milestoneData.milestone} Carbon Units`;
      case "dropoff_count":
        return `${milestoneData.milestone} Dropoffs`;
      case "badge_earned":
        return milestoneData.badgeName || "New Badge";
      default:
        return "Milestone Achieved";
    }
  };

  if (variant === "compact") {
    return (
      <>
        <button
          onClick={handleShareClick}
          className={`
            inline-flex items-center space-x-1
            text-green-600 hover:text-green-700
            text-xs font-medium
            transition-colors
            ${className}
          `}
        >
          <span>{getMilestoneIcon()}</span>
          <span>Share</span>
          <FaShare className="w-3 h-3" />
        </button>

        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={shareData}
          title="Share Your Milestone!"
          subtitle="Celebrate your environmental achievement"
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleShareClick}
        className={`
          flex items-center justify-center space-x-2
          bg-gradient-to-r from-green-500 to-yellow-500 
          hover:from-green-600 hover:to-yellow-600
          text-white font-semibold 
          py-3 px-6 rounded-lg 
          transition-all duration-200
          transform hover:scale-105
          shadow-md hover:shadow-lg
          ${className}
        `}
      >
        <FaTrophy className="w-4 h-4" />
        <span>Share Milestone</span>
        <span className="text-lg">{getMilestoneIcon()}</span>
      </button>

      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={shareData}
        title={`Share Your ${getMilestoneText()} Milestone!`}
        subtitle="Inspire others with your environmental achievements"
      />
    </>
  );
};

export default MilestoneShareButton;
