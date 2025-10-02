import React, { useState } from "react";
import SocialShareModal from "../social/SocialShareModal";
import { useSocialShare } from "../../hooks/useSocialShare";
import { UserAchievement } from "../../types/social";
import { FaShare } from "react-icons/fa6";

interface GreenProfileShareButtonProps {
  userData: UserAchievement;
  className?: string;
}

const GreenProfileShareButton: React.FC<GreenProfileShareButtonProps> = ({
  userData,
  className = "",
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const { createProfileShareData } = useSocialShare();

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const shareData = createProfileShareData(userData);

  return (
    <>
      <button
        onClick={handleShareClick}
        className={`
          flex items-center justify-center space-x-2
          bg-green-500 hover:bg-green-600 
          text-white font-semibold 
          py-3 px-6 rounded-lg 
          transition-all duration-200
          transform hover:scale-105
          shadow-md hover:shadow-lg
          ${className}
        `}
      >
        <FaShare className="w-4 h-4" />
        <span>Share Green Profile</span>
      </button>

      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={shareData}
        title="Share Your Green Profile"
        subtitle="Inspire others with your environmental impact!"
      />
    </>
  );
};

export default GreenProfileShareButton;
