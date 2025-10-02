import React from "react";
import { ShareData } from "../../types/social";
import { SOCIAL_PLATFORMS } from "../../utils/shareUrls";
import SocialShareButton from "./SocialShareButton";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
  title?: string;
  subtitle?: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  shareData,
  title = "Share Your Achievement",
  subtitle = "Spread the word about your environmental impact!",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm mx-4 w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>

        {/* Preview Text */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-800 leading-relaxed">
            {shareData.text}
          </p>
          {shareData.url && (
            <p className="text-xs text-blue-600 mt-2 truncate">
              {shareData.url}
            </p>
          )}
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          {SOCIAL_PLATFORMS.map((platform) => (
            <SocialShareButton
              key={platform.id}
              platform={platform.id}
              text={shareData.text}
              url={shareData.url}
              size="lg"
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default SocialShareModal;
