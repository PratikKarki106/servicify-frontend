import React, { useEffect, useMemo, useState } from "react";
import "./Circle.css";

type Props = {
  startDate: Date;
  totalDays?: number;
  size?: number;
  strokeWidth?: number;
  baseColor?: string;
  progressColor?: string;
  showLabel?: boolean;   // renamed for clarity
  className?: string;
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const Circle: React.FC<Props> = ({
  startDate,
  totalDays = 90,
  size = 140,
  strokeWidth = 8,
  baseColor = "#C4C4C4",
  progressColor = "#FFC107",
  showLabel = true,
  className,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const center = useMemo(() => size / 2, [size]);

  const { circumference, dashOffset, daysLeft } = useMemo(() => {
    const endDate = new Date(startDate.getTime() + totalDays * MS_IN_DAY);
    const totalMs = endDate.getTime() - startDate.getTime();
    const elapsedMs = Math.min(Math.max(0, now.getTime() - startDate.getTime()), totalMs);
    const p = elapsedMs / totalMs; // 0..1
    const c = 2 * Math.PI * radius;
    const offset = c * (1 - p);

    // Remaining days (clamped to 0)
    const remaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / MS_IN_DAY));

    return { circumference: c, dashOffset: offset, daysLeft: remaining };
  }, [now, startDate, totalDays, radius]);

  return (
    <div
      className={`ndpc ${className ?? ""}`}
      style={
        {
          "--ndpc-size": `${size}px`,
          "--ndpc-stroke": `${strokeWidth}px`,
          "--ndpc-base": baseColor,
          "--ndpc-progress": progressColor,
        } as React.CSSProperties
      }
    >
      <svg
        className="ndpc-svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${daysLeft} days left out of ${totalDays}`}
      >
        <circle
          className="ndpc-base"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="ndpc-progress"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {showLabel && (
          <text
            className="ndpc-label"
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
          >
            {daysLeft} Days Left
          </text>
        )}
      </svg>
    </div>
  );
};

export default Circle;