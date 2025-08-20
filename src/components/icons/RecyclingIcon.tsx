import React from "react";

interface RecyclingIconProps {
  className?: string;
}

const RecyclingIcon: React.FC<RecyclingIconProps> = ({
  className = "w-6 h-6",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.1,16.5L19.8,14c-0.6-1.3-2.2-1.9-3.5-1.3c-0.3,0.2-0.6,0.3-0.9,0.6l-3.1-5.1c0.3-0.3,0.6-0.7,0.7-1.1
      c0.4-1.4-0.4-2.9-1.8-3.3c-1.4-0.4-2.9,0.4-3.3,1.8c-0.1,0.4-0.1,0.8,0,1.2l-5.5,2.5C1.9,9.5,1.5,9.9,1.3,10.4
      c-0.4,1.4,0.4,2.9,1.8,3.3c0.4,0.1,0.8,0.1,1.2,0l2.7,5.5c-0.8,0.9-0.7,2.3,0.2,3.1s2.3,0.7,3.1-0.2c0.2-0.3,0.4-0.6,0.5-1
      c0-0.1,0-0.1,0-0.2l6.3-1c0.2,0.4,0.4,0.7,0.6,1c0.8,0.9,2.2,1.1,3.1,0.2C21.8,20.4,21.9,18.3,21.1,16.5z M17.9,16.1l-0.9-1.8
      l-3.6,2.1l1,1.7L17.9,16.1z M6.8,7.3l2.3,0l-1.2-3.5L6.8,7.3z M6.5,16.4l1.2-1.9L4.5,12L3.5,14L6.5,16.4z M14.3,9.8l-2.2-3.8
      L9.9,9.8L14.3,9.8z"
      />
    </svg>
  );
};

export default RecyclingIcon;
