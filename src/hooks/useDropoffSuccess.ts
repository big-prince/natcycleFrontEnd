import { useSuccessModal } from "./useSuccessModal";
import { DropoffShareData, MilestoneData } from "../types/social";

// Hook for components to easily trigger success modals
export const useDropoffSuccess = () => {
  const { showDropoffSuccess, showMilestoneSuccess, checkMilestones } =
    useSuccessModal();

  const triggerDropoffSuccess = (data: {
    materialType: string;
    carbonUnitsEarned: number;
    dropoffType: "regular" | "simple" | "campaign";
    campaignName?: string;
    locationName?: string;
    previousCarbonUnits?: number;
    previousDropoffCount?: number;
    newCarbonUnits?: number;
    newDropoffCount?: number;
  }) => {
    console.log("🎉 triggerDropoffSuccess called with data:", data);

    const dropoffData: DropoffShareData = {
      materialType: data.materialType,
      carbonUnitsEarned: data.carbonUnitsEarned,
      dropoffType: data.dropoffType,
      campaignName: data.campaignName,
      locationName: data.locationName,
    };

    console.log("📱 Showing dropoff success modal with:", dropoffData);
    // Show dropoff success first
    showDropoffSuccess(dropoffData);

    // Check for milestones (will auto-show if milestone reached)
    if (data.newCarbonUnits && data.newDropoffCount) {
      setTimeout(() => {
        checkMilestones(
          data.newCarbonUnits!,
          data.newDropoffCount!,
          data.previousCarbonUnits || 0,
          data.previousDropoffCount || 0
        );
      }, 6000); // Show milestone after dropoff modal closes
    }
  };

  const triggerMilestoneSuccess = (data: MilestoneData) => {
    showMilestoneSuccess(data);
  };

  return {
    triggerDropoffSuccess,
    triggerMilestoneSuccess,
  };
};
