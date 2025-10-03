import { useState, useCallback } from "react";
import {
  ShareData,
  UserAchievement,
  DropoffShareData,
  MilestoneData,
} from "../types/social";
import {
  generateProfileTemplate,
  generateDropoffTemplate,
  generateMilestoneTemplate,
  getProfileShareUrl,
  getDropoffShareUrl,
} from "../utils/socialTemplates";

export const useSocialShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const createProfileShareData = useCallback(
    (userData: UserAchievement, platform: string = "twitter"): ShareData => {
      return {
        text: generateProfileTemplate(platform, userData),
        url: getProfileShareUrl(),
      };
    },
    []
  );

  const createDropoffShareData = useCallback(
    (dropoffData: DropoffShareData): ShareData => {
      return {
        text: generateDropoffTemplate(dropoffData),
        url: getDropoffShareUrl(),
      };
    },
    []
  );

  const createMilestoneShareData = useCallback(
    (milestoneData: MilestoneData): ShareData => {
      return {
        text: generateMilestoneTemplate(milestoneData),
        url: getProfileShareUrl(),
      };
    },
    []
  );

  const shareToSocial = useCallback(
    async (platform: string, shareData: ShareData): Promise<boolean> => {
      try {
        setIsSharing(true);

        // Analytics tracking could go here
        console.log(`Sharing to ${platform}:`, shareData);

        // Return success
        return true;
      } catch (error) {
        console.error("Error sharing to social:", error);
        return false;
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  return {
    isSharing,
    createProfileShareData,
    createDropoffShareData,
    createMilestoneShareData,
    shareToSocial,
  };
};
