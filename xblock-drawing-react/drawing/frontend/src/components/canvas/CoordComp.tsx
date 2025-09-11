import React from 'react';


const CoordIcon = ({ size = 100, color = "black", ballColor = "red", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={size}
    height={size}
    {...props}
  >
    {/* Horizontal dotted line (stops before the red ball) */}
    <line
      x1="0"
      y1="20"
      x2="65"
      y2="20"
      stroke={color}
      strokeWidth="4"
      strokeDasharray="4,4"
      strokeLinecap="round"
    />
    {/* Vertical dotted line (starts below the red ball) */}
    <line
      x1="70"
      y1="25"
      x2="70"
      y2="90"
      stroke={color}
      strokeWidth="4"
      strokeDasharray="4,4"
      strokeLinecap="round"
    />
    {/* Red ball at corner */}
    <circle cx="70" cy="20" r="5" fill={ballColor} stroke="darkred" strokeWidth="1" />
  </svg>
);

export default CoordIcon
