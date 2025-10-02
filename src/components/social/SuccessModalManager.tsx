import React from "react";
import DropoffSuccessModal from "../success/DropoffSuccessModal";
import MilestoneSuccessModal from "../success/MilestoneSuccessModal";
import { useSuccessModal } from "../../hooks/useSuccessModal";

interface SuccessModalManagerProps {
  // Empty for now - this is for global state management
}

const SuccessModalManager: React.FC<SuccessModalManagerProps> = () => {
  const {
    dropoffSuccess,
    milestoneSuccess,
    closeDropoffSuccess,
    closeMilestoneSuccess,
  } = useSuccessModal();

  console.log("🎭 SuccessModalManager render:", {
    dropoffSuccess: dropoffSuccess.isOpen,
    milestoneSuccess: milestoneSuccess.isOpen,
    dropoffData: dropoffSuccess.data,
    milestoneData: milestoneSuccess.data,
    dropoffDataExists: !!dropoffSuccess.data,
    conditionalCheck: dropoffSuccess.isOpen && dropoffSuccess.data,
  });

  // Additional state debugging
  React.useEffect(() => {
    console.log("🔄 SuccessModalManager state changed:", {
      dropoffSuccess,
      milestoneSuccess,
    });
  }, [dropoffSuccess, milestoneSuccess]);

  return (
    <>
      {/* Dropoff Success Modal */}
      {dropoffSuccess.isOpen && dropoffSuccess.data && (
        <DropoffSuccessModal
          isOpen={dropoffSuccess.isOpen}
          onClose={closeDropoffSuccess}
          dropoffData={dropoffSuccess.data}
        />
      )}

      {/* Milestone Success Modal */}
      {milestoneSuccess.isOpen && milestoneSuccess.data && (
        <MilestoneSuccessModal
          isOpen={milestoneSuccess.isOpen}
          onClose={closeMilestoneSuccess}
          milestoneData={milestoneSuccess.data}
        />
      )}
    </>
  );
};

export default SuccessModalManager;
