import React from "react";

interface PointsEarnedBadgeProps {
  totalExpenditure: number;
  redeemedValue?: number;
}

const PointsEarnedBadge: React.FC<PointsEarnedBadgeProps> = ({ totalExpenditure, redeemedValue = 0 }) => {
  const eligible = Math.max(0, totalExpenditure - redeemedValue);
  const points = Math.floor(eligible / 100);

  return <span className="loyalty-earned-badge">Estimated earn: {points} points</span>;
};

export default PointsEarnedBadge;
