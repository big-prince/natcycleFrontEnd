import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AutoDismissModal from "../ui/AutoDismissModal";
import BreathingIcon from "../ui/BreathingIcon";
import SocialShareModal from "../social/SocialShareModal";
import { DropoffShareData, ShareData } from "../../types/social";
import {
  generateDropoffTemplate,
  getProfileShareUrl,
} from "../../utils/socialTemplates";
import { FaCircleCheck, FaRecycle, FaLeaf } from "react-icons/fa6";

interface DropoffSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  dropoffData: DropoffShareData;
  autoCloseDelay?: number;
}

const DropoffSuccessModal: React.FC<DropoffSuccessModalProps> = ({
  isOpen,
  onClose,
  dropoffData,
  autoCloseDelay = 5000,
}) => {
  const [showSocialShare, setShowSocialShare] = useState(false);
  const navigate = useNavigate();

  console.log("🎪 DropoffSuccessModal render:", { isOpen, dropoffData });

  const handleClose = () => {
    onClose();
    navigate("/home");
  };

  const getSuccessIcon = () => {
    switch (dropoffData.dropoffType) {
      case "campaign":
        return <FaLeaf className="w-full h-full" />;
      case "simple":
        return <FaRecycle className="w-full h-full" />;
      default:
        return <FaCircleCheck className="w-full h-full" />;
    }
  };

  const getSuccessTitle = () => {
    switch (dropoffData.dropoffType) {
      case "campaign":
        return `Campaign Contribution Complete!`;
      case "simple":
        return "Quick Dropoff Complete!";
      default:
        return "Dropoff Successful!";
    }
  };

  const getSuccessSubtitle = () => {
    const materialName =
      dropoffData.materialType.charAt(0).toUpperCase() +
      dropoffData.materialType.slice(1);
    return `${materialName} materials processed • ${dropoffData.carbonUnitsEarned} Carbon Units earned`;
  };

  const handleShareClick = () => {
    setShowSocialShare(true);
  };

  const shareData: ShareData = {
    text: generateDropoffTemplate(dropoffData),
    url: getProfileShareUrl(),
  };

  return (
    <>
      {console.log(
        "🎪 DropoffSuccessModal returning JSX, showing AutoDismissModal:",
        isOpen && !showSocialShare
      )}
      <AutoDismissModal
        isOpen={isOpen && !showSocialShare}
        onClose={handleClose}
        autoCloseDelay={autoCloseDelay}
        title=""
        className="animate-scale-in"
      >
        <div
          className="p-8 text-center"
          style={{ backgroundColor: "yellow", minHeight: "200px" }}
        >
          <h1 style={{ color: "red", fontSize: "24px" }}>MODAL IS SHOWING!</h1>
          {/* Breathing Success Icon */}
          <div className="flex justify-center mb-6">
            <BreathingIcon
              icon={getSuccessIcon()}
              size="xl"
              color="text-green-500"
              duration={2000}
            />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {getSuccessTitle()}
          </h2>

          <p className="text-gray-600 mb-6">{getSuccessSubtitle()}</p>

          {/* Campaign specific info */}
          {dropoffData.dropoffType === "campaign" &&
            dropoffData.campaignName && (
              <div className="bg-green-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Campaign:</span>{" "}
                  {dropoffData.campaignName}
                </p>
              </div>
            )}

          {/* Location info for simple dropoffs */}
          {dropoffData.dropoffType === "simple" && dropoffData.locationName && (
            <div className="bg-blue-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Location:</span>{" "}
                {dropoffData.locationName}
              </p>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
          >
            Share Your Impact 🌱
          </button>

          {/* Skip Button */}
          <button
            onClick={handleClose}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </AutoDismissModal>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showSocialShare}
        onClose={() => {
          setShowSocialShare(false);
          handleClose();
        }}
        shareData={shareData}
        title="Share Your Dropoff Success!"
        subtitle="Let others know about your environmental contribution"
      />

      <style>{`
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default DropoffSuccessModal;
