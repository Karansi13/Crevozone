import React from "react";

interface ProgressProps {
  value: number;
}

const Progress: React.FC<ProgressProps> = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default Progress;
