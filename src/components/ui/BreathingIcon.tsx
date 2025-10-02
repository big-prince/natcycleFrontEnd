import React from "react";

interface BreathingIconProps {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  duration?: number;
}

const BreathingIcon: React.FC<BreathingIconProps> = ({
  icon,
  size = "lg",
  color = "text-green-500",
  duration = 2000,
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${color} flex items-center justify-center animate-breathe`}
    >
      {icon}
      <style>{`
        .animate-breathe {
          animation: breathe ${duration}ms ease-in-out infinite;
        }
        
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BreathingIcon;
