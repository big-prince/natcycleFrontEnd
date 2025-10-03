import { SocialPlatform } from "../types/social";

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: "Twitter",
    id: "twitter",
    icon: "FaXTwitter",
    color: "#000000",
    shareUrl: "https://twitter.com/intent/tweet",
  },
  {
    name: "WhatsApp",
    id: "whatsapp",
    icon: "FaWhatsapp",
    color: "#25D366",
    shareUrl: "https://wa.me/",
  },
  {
    name: "LinkedIn",
    id: "linkedin",
    icon: "FaLinkedin",
    color: "#0077B5",
    shareUrl: "https://www.linkedin.com/feed/update/urn:li:share:",
  },
  {
    name: "Facebook",
    id: "facebook",
    icon: "FaFacebook",
    color: "#1877F2",
    shareUrl: "https://www.facebook.com/dialog/share",
  },
  {
    name: "Copy Link",
    id: "copy",
    icon: "FaCopy",
    color: "#6B7280",
    shareUrl: "",
  },
];

export const buildShareUrl = (
  platform: SocialPlatform["id"],
  text: string,
  url?: string
): string => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = url ? encodeURIComponent(url) : "";
  const fallbackUrl = encodeURIComponent(window.location.origin);
  const finalUrl = encodedUrl || fallbackUrl;

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${encodedText}${
        url ? `&url=${encodedUrl}` : ""
      }`;

    case "whatsapp":
      return `https://wa.me/?text=${encodedText}${
        url ? `%20${encodedUrl}` : ""
      }`;

    case "linkedin":
      // Modern LinkedIn sharing - opens LinkedIn with pre-filled text
      return `https://www.linkedin.com/sharing/share-offsite/?url=${finalUrl}&summary=${encodedText}&title=${encodeURIComponent(
        "NatCycle - Environmental Impact"
      )}`;

    case "facebook":
      // Modern Facebook sharing - using the dialog/share endpoint
      return `https://www.facebook.com/dialog/share?app_id=966242223397117&href=${finalUrl}&quote=${encodedText}&hashtag=%23NatCycle&display=popup`;

    case "copy":
      return ""; // Handled differently in component

    default:
      return "";
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};
