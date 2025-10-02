import React, { useState } from "react";
import AutoDismissModal from "../ui/AutoDismissModal";
import BreathingIcon from "../ui/BreathingIcon";
import SocialShareModal from "../social/SocialShareModal";
import { MilestoneData, ShareData } from "../../types/social";
import {
  generateMilestoneTemplate,
  getProfileShareUrl,
} from "../../utils/socialTemplates";
import { FaTrophy, FaAward, FaStar } from "react-icons/fa6";

interface MilestoneSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneData: MilestoneData;
  autoCloseDelay?: number;
}

const MilestoneSuccessModal: React.FC<MilestoneSuccessModalProps> = ({
  isOpen,
  onClose,
  milestoneData,
  autoCloseDelay = 7000, // Slightly longer for milestones
}) => {
  const [showSocialShare, setShowSocialShare] = useState(false);

  const getMilestoneIcon = () => {
    switch (milestoneData.type) {
      case "badge_earned":
        return <FaAward className="w-full h-full" />;
      case "carbon_units":
        return <FaStar className="w-full h-full" />;
      default:
        return <FaTrophy className="w-full h-full" />;
    }
  };

  const getMilestoneTitle = () => {
    switch (milestoneData.type) {
      case "carbon_units":
        return `${milestoneData.milestone} Carbon Units Milestone!`;
      case "dropoff_count":
        return `${milestoneData.milestone} Dropoffs Milestone!`;
      case "badge_earned":
        return "New Badge Earned!";
      default:
        return "Milestone Achieved!";
    }
  };

  const getMilestoneSubtitle = () => {
    switch (milestoneData.type) {
      case "carbon_units":
        return `You've saved ${milestoneData.milestone} Carbon Units! Your environmental impact is growing! 🌱`;
      case "dropoff_count":
        return `${milestoneData.milestone} eco-friendly dropoffs completed! You're making a real difference! ♻️`;
      case "badge_earned":
        return `"${milestoneData.badgeName}" badge unlocked! Your dedication to sustainability is recognized! 🏆`;
      default:
        return "Keep up the amazing work towards a greener future!";
    }
  };

  const handleShareClick = () => {
    setShowSocialShare(true);
  };

  const shareData: ShareData = {
    text: generateMilestoneTemplate(milestoneData),
    url: getProfileShareUrl(),
  };

  return (
    <>
      <AutoDismissModal
        isOpen={isOpen && !showSocialShare}
        onClose={onClose}
        autoCloseDelay={autoCloseDelay}
        title=""
        className="animate-milestone-in"
      >
        <div className="p-8 text-center">
          {/* Celebration Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="celebration-particles" />
          </div>

          {/* Breathing Milestone Icon */}
          <div className="flex justify-center mb-6 relative z-10">
            <BreathingIcon
              icon={getMilestoneIcon()}
              size="xl"
              color="text-yellow-500"
              duration={1500}
            />
          </div>

          {/* Milestone Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            🎉 {getMilestoneTitle()}
          </h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {getMilestoneSubtitle()}
          </p>

          {/* Progress Indicator */}
          <div className="bg-gradient-to-r from-green-100 to-yellow-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🌟</span>
              <span className="font-semibold text-gray-800">
                Level Up Your Impact!
              </span>
              <span className="text-2xl">🌟</span>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="w-full bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all mb-4 transform hover:scale-105"
          >
            Celebrate & Share! 🎊
          </button>

          {/* Skip Button */}
          <button
            onClick={onClose}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Continue Celebrating
          </button>
        </div>
      </AutoDismissModal>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showSocialShare}
        onClose={() => {
          setShowSocialShare(false);
          onClose();
        }}
        shareData={shareData}
        title="Share Your Milestone!"
        subtitle="Inspire others with your environmental achievements"
      />

      <style>{`
        .animate-milestone-in {
          animation: milestoneIn 0.5s ease-out;
        }
        
        @keyframes milestoneIn {
          from {
            transform: scale(0.8) rotate(-5deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .celebration-particles {
          background: radial-gradient(circle, transparent 20%, rgba(255, 215, 0, 0.3) 20%, rgba(255, 215, 0, 0.3) 40%, transparent 40%), 
                      radial-gradient(circle, transparent 20%, rgba(34, 197, 94, 0.3) 20%, rgba(34, 197, 94, 0.3) 40%, transparent 40%);
          background-size: 20px 20px, 30px 30px;
          background-position: 0 0, 15px 15px;
          animation: float 3s ease-in-out infinite;
          width: 100%;
          height: 100%;
          border-radius: 1rem;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
    </>
  );
};

export default MilestoneSuccessModal;
