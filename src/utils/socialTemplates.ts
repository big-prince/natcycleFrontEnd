import {
  UserAchievement,
  DropoffShareData,
  MilestoneData,
} from "../types/social";

export const SHARE_TEMPLATES = {
  // Milestone Achievement Templates
  milestone: {
    carbon_units: (data: MilestoneData) =>
      `🌱 Just hit ${data.milestone} Carbon Units on NatCycle! Every small action counts toward a greener future. Join me in making a difference! 🌍 #SustainableLiving #ClimateAction #NatCycle`,

    dropoff_count: (data: MilestoneData) =>
      `🎉 Milestone achieved! Just completed my ${
        data.milestone
      }${getOrdinalSuffix(
        data.milestone
      )} eco-friendly dropoff with NatCycle! Small steps, big impact! 💚 #EcoWarrior #NatCycle #GreenLiving`,

    badge_earned: (data: MilestoneData) =>
      `🏆 New badge unlocked: "${data.badgeName}"! Proud to be part of the sustainable movement with NatCycle! 🌿 #BadgeEarned #SustainableLife #NatCycle`,
  },

  // Green Profile Templates
  profile: {
    twitter: (user: UserAchievement) =>
      `🌿 My green impact: ${user.totalDropoffs} dropoffs, ${Math.floor(
        user.carbonUnits
      )} Carbon Units saved! Building a sustainable future one action at a time 💚 #GreenProfile #EcoWarrior #NatCycle`,

    whatsapp: (user: UserAchievement) =>
      `🌱 Check out my environmental impact!\n\n✅ ${
        user.totalDropoffs
      } eco-friendly dropoffs\n🌍 ${Math.floor(
        user.carbonUnits
      )} Carbon Units saved\n${
        user.badgeCount ? `🏆 ${user.badgeCount} badges earned\n` : ""
      }\nJoin me on NatCycle and make a difference! 💚`,

    linkedin: (user: UserAchievement) =>
      `Proud to share my environmental impact! Through NatCycle, I've completed ${
        user.totalDropoffs
      } sustainable dropoffs and saved ${Math.floor(
        user.carbonUnits
      )} Carbon Units. Every action counts in building a greener future. #Sustainability #ClimateAction #GreenTech #NatCycle`,

    facebook: (user: UserAchievement) =>
      `🌍 Making a difference, one dropoff at a time! My journey with NatCycle: ${
        user.totalDropoffs
      } dropoffs completed, ${Math.floor(
        user.carbonUnits
      )} Carbon Units saved. Together, we can build a sustainable future! 💚 #SustainableLiving #NatCycle`,
  },

  // Dropoff Success Templates
  dropoff: {
    regular: (data: DropoffShareData) =>
      `✅ Just completed an eco-friendly dropoff! ${capitalizeFirst(
        data.materialType
      )} → ${
        data.carbonUnitsEarned
      } Carbon Units earned. Small steps, big impact! 🌱 #NatCycle #Sustainability #${capitalizeFirst(
        data.materialType
      )}Recycling`,

    simple: (data: DropoffShareData) =>
      `🌿 Quick dropoff completed at ${data.locationName}! ${capitalizeFirst(
        data.materialType
      )} materials → ${
        data.carbonUnitsEarned
      } CU earned. Making sustainability simple! ♻️ #NatCycle #EcoFriendly`,

    campaign: (data: DropoffShareData) =>
      `🎯 Participated in "${
        data.campaignName
      }" campaign! Just dropped off ${capitalizeFirst(
        data.materialType
      )} materials and earned ${
        data.carbonUnitsEarned
      } Carbon Units. Join the movement! 🌍 #NatCycle #${data.campaignName?.replace(
        /\s+/g,
        ""
      )} #SustainableCampaign`,
  },
};

// Helper functions
function getOrdinalSuffix(number: number): string {
  const j = number % 10;
  const k = number % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Template generators
export const generateMilestoneTemplate = (
  milestoneData: MilestoneData
): string => {
  const template = SHARE_TEMPLATES.milestone[milestoneData.type];
  return template ? template(milestoneData) : "";
};

export const generateProfileTemplate = (
  platform: string,
  userData: UserAchievement
): string => {
  const template =
    SHARE_TEMPLATES.profile[platform as keyof typeof SHARE_TEMPLATES.profile];
  return template
    ? template(userData)
    : SHARE_TEMPLATES.profile.twitter(userData);
};

export const generateDropoffTemplate = (
  dropoffData: DropoffShareData
): string => {
  const template = SHARE_TEMPLATES.dropoff[dropoffData.dropoffType];
  return template
    ? template(dropoffData)
    : SHARE_TEMPLATES.dropoff.regular(dropoffData);
};

// Get share URL for profile
export const getProfileShareUrl = (): string => {
  // This would typically be a deep link to the user's profile or app
  return `${window.location.origin}/profile/shared`;
};
