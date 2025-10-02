import { useState, useCallback, useEffect } from "react";
import { DropoffShareData, MilestoneData } from "../types/social";

interface SuccessModalState {
  dropoffSuccess: {
    isOpen: boolean;
    data?: DropoffShareData;
  };
  milestoneSuccess: {
    isOpen: boolean;
    data?: MilestoneData;
  };
}

export const useSuccessModal = () => {
  const [state, setState] = useState<SuccessModalState>({
    dropoffSuccess: { isOpen: false },
    milestoneSuccess: { isOpen: false },
  });

  // Show dropoff success modal
  const showDropoffSuccess = useCallback((dropoffData: DropoffShareData) => {
    console.log("🚀 showDropoffSuccess called with:", dropoffData);
    setState((prev) => ({
      ...prev,
      dropoffSuccess: { isOpen: true, data: dropoffData },
    }));
    console.log("✅ Modal state updated to show dropoff success");
  }, []);

  // Show milestone success modal
  const showMilestoneSuccess = useCallback((milestoneData: MilestoneData) => {
    setState((prev) => ({
      ...prev,
      milestoneSuccess: { isOpen: true, data: milestoneData },
    }));
  }, []);

  // Close dropoff success modal
  const closeDropoffSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dropoffSuccess: { isOpen: false, data: undefined },
    }));
  }, []);

  // Close milestone success modal
  const closeMilestoneSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      milestoneSuccess: { isOpen: false, data: undefined },
    }));
  }, []);

  // Close all modals
  const closeAll = useCallback(() => {
    setState({
      dropoffSuccess: { isOpen: false },
      milestoneSuccess: { isOpen: false },
    });
  }, []);

  // Check for milestone achievements
  const checkMilestones = useCallback(
    (
      carbonUnits: number,
      dropoffCount: number,
      previousCarbonUnits: number = 0,
      previousDropoffCount: number = 0
    ) => {
      const carbonMilestones = [10, 25, 50, 100, 250, 500, 1000];
      const dropoffMilestones = [1, 5, 10, 25, 50, 100];

      // Check carbon units milestones
      for (const milestone of carbonMilestones) {
        if (carbonUnits >= milestone && previousCarbonUnits < milestone) {
          showMilestoneSuccess({
            type: "carbon_units",
            value: carbonUnits,
            milestone,
          });
          return true;
        }
      }

      // Check dropoff count milestones
      for (const milestone of dropoffMilestones) {
        if (dropoffCount >= milestone && previousDropoffCount < milestone) {
          showMilestoneSuccess({
            type: "dropoff_count",
            value: dropoffCount,
            milestone,
          });
          return true;
        }
      }

      return false;
    },
    [showMilestoneSuccess]
  );

  // Auto-close effect for debugging
  useEffect(() => {
    // This could be used for analytics or cleanup
    if (state.dropoffSuccess.isOpen || state.milestoneSuccess.isOpen) {
      console.log("Success modal opened:", state);
    }
  }, [state]);

  return {
    // State
    dropoffSuccess: state.dropoffSuccess,
    milestoneSuccess: state.milestoneSuccess,

    // Actions
    showDropoffSuccess,
    showMilestoneSuccess,
    closeDropoffSuccess,
    closeMilestoneSuccess,
    closeAll,
    checkMilestones,

    // Helpers
    hasActiveModal:
      state.dropoffSuccess.isOpen || state.milestoneSuccess.isOpen,
  };
};
