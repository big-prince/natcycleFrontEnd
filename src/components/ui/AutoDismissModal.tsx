import React, { useEffect } from "react";
import { SuccessModalProps } from "../../types/social";
import { FaXmark } from "react-icons/fa6";

interface AutoDismissModalProps extends SuccessModalProps {
  children: React.ReactNode;
  className?: string;
}

const AutoDismissModal: React.FC<AutoDismissModalProps> = ({
  isOpen,
  onClose,
  autoCloseDelay = 5000,
  children,
  className = "",
}) => {
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  console.log("🎭 AutoDismissModal rendering with isOpen:", isOpen);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-sm mx-4 w-full transform transition-all border-4 border-red-500 ${className}`}
        style={{
          zIndex: 10000,
          backgroundColor: "white",
          border: "4px solid red", // Temporary debug border
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <FaXmark className="w-4 h-4" />
        </button>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AutoDismissModal;
