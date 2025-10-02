import React, { useState } from "react";
import { SocialPlatform } from "../../types/social";
import {
  buildShareUrl,
  copyToClipboard,
  SOCIAL_PLATFORMS,
} from "../../utils/shareUrls";
import {
  FaXTwitter,
  FaWhatsapp,
  FaLinkedin,
  FaFacebook,
  FaCopy,
  FaCheck,
} from "react-icons/fa6";

interface SocialShareButtonProps {
  platform: SocialPlatform["id"];
  text: string;
  url?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  platform,
  text,
  url,
  className = "",
  size = "md",
}) => {
  const [copied, setCopied] = useState(false);

  const platformData = SOCIAL_PLATFORMS.find((p) => p.id === platform);
  if (!platformData) return null;

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const getIcon = () => {
    const iconClass = iconSizeClasses[size];

    switch (platform) {
      case "twitter":
        return <FaXTwitter className={iconClass} />;
      case "whatsapp":
        return <FaWhatsapp className={iconClass} />;
      case "linkedin":
        return <FaLinkedin className={iconClass} />;
      case "facebook":
        return <FaFacebook className={iconClass} />;
      case "copy":
        return copied ? (
          <FaCheck className={iconClass} />
        ) : (
          <FaCopy className={iconClass} />
        );
      default:
        return null;
    }
  };

  const handleClick = async () => {
    if (platform === "copy") {
      const shareText = url ? `${text} ${url}` : text;
      const success = await copyToClipboard(shareText);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      const shareUrl = buildShareUrl(platform, text, url);
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        hover:scale-110
        active:scale-95
        ${
          copied
            ? "bg-green-500 text-white"
            : "bg-white text-gray-700 hover:text-white"
        }
        border-2 border-gray-200
        shadow-md hover:shadow-lg
        ${className}
      `}
      style={{
        backgroundColor: copied
          ? "#10B981"
          : platform !== "copy"
          ? platformData.color
          : undefined,
        color: copied || platform !== "copy" ? "white" : undefined,
        borderColor: copied ? "#10B981" : platformData.color,
      }}
      title={copied ? "Copied!" : `Share on ${platformData.name}`}
    >
      {getIcon()}
    </button>
  );
};

export default SocialShareButton;
