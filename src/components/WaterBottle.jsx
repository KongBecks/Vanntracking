import React, { useEffect, useState } from 'react';

export default function WaterBottle({ percent, animate }) {
  const [fillHeight, setFillHeight] = useState(animate ? 0 : Math.min(percent, 100));

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setFillHeight(Math.min(percent, 100)), 100);
      return () => clearTimeout(timer);
    } else {
      setFillHeight(Math.min(percent, 100));
    }
  }, [percent, animate]);

  const bottleHeight = 220;
  const bodyTop = 40;
  const bodyHeight = 170;
  const waterHeight = (fillHeight / 100) * bodyHeight;
  const waterY = bodyTop + bodyHeight - waterHeight;

  return (
    <svg width="120" height="280" viewBox="0 0 120 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <clipPath id="bottleClip">
          {/* Bottle body with rounded bottom */}
          <path d="
            M 30 40
            L 30 40
            Q 20 45 18 55
            L 18 195
            Q 18 220 40 225
            L 80 225
            Q 102 220 102 195
            L 102 55
            Q 100 45 90 40
            Z
          " />
        </clipPath>
        <clipPath id="capClip">
          <rect x="35" y="10" width="50" height="34" rx="6" />
        </clipPath>
      </defs>

      {/* Bottle outline */}
      <path d="
        M 30 40
        Q 20 45 18 55
        L 18 195
        Q 18 220 40 225
        L 80 225
        Q 102 220 102 195
        L 102 55
        Q 100 45 90 40
      " fill="url(#bottleGrad)" stroke="#93c5fd" strokeWidth="2" />

      {/* Water fill */}
      <g clipPath="url(#bottleClip)">
        <rect
          x="16"
          y={waterY}
          width="88"
          height={waterHeight + 4}
          fill="url(#waterGrad)"
          opacity="0.85"
          style={{
            transition: animate ? 'y 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), height 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        />
        {/* Wave effect */}
        {fillHeight > 2 && (
          <ellipse
            cx="60"
            cy={waterY}
            rx="44"
            ry="4"
            fill="#7dd3fc"
            opacity="0.6"
            style={{
              transition: animate ? 'cy 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            }}
          />
        )}
      </g>

      {/* Cap */}
      <rect x="35" y="10" width="50" height="34" rx="8" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1.5" />
      <rect x="42" y="16" width="36" height="6" rx="3" fill="#bae6fd" opacity="0.6" />

      {/* Measurement lines */}
      {[25, 50, 75].map(p => {
        const ly = bodyTop + bodyHeight - (p / 100) * bodyHeight;
        return (
          <g key={p}>
            <line x1="18" y1={ly} x2="28" y2={ly} stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
            <line x1="92" y1={ly} x2="102" y2={ly} stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
          </g>
        );
      })}

      {/* Percent label */}
      <text
        x="60"
        y="250"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#0284c7"
        fontFamily="-apple-system, system-ui, sans-serif"
      >
        {Math.round(fillHeight)}%
      </text>
    </svg>
  );
}
