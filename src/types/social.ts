export interface SocialPlatform {
  name: string;
  id: "twitter" | "whatsapp" | "linkedin" | "facebook" | "copy";
  icon: string;
  color: string;
  shareUrl: string;
}

export interface ShareData {
  text: string;
  url?: string;
  hashtags?: string[];
  via?: string;
}

export interface ShareTemplate {
  type: "milestone" | "profile" | "dropoff";
  platform: SocialPlatform["id"];
  template: string;
}

export interface UserAchievement {
  carbonUnits: number;
  totalDropoffs: number;
  materialsRecycled: string[];
  rank?: string;
  badgeCount?: number;
}

export interface DropoffShareData {
  materialType: string;
  carbonUnitsEarned: number;
  dropoffType: "regular" | "simple" | "campaign";
  campaignName?: string;
  locationName?: string;
}

export interface MilestoneData {
  type: "carbon_units" | "dropoff_count" | "badge_earned";
  value: number;
  milestone: number;
  badgeName?: string;
}

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
  showSocialShare?: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  shareData?: ShareData;
}
