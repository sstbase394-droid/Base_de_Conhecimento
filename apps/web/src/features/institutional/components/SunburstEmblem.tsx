/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SunburstEmblem: Ícone em relevo/carimbo radial inspirado na identidade
 * visual 'Permanent Collection' (marcas de cerâmica e curadoria editorial).
 */

import React from 'react';

interface SunburstEmblemProps {
  size?: number;
  className?: string;
  strokeColor?: string;
  dotColor?: string;
}

export const SunburstEmblem: React.FC<SunburstEmblemProps> = ({
  size = 28,
  className = '',
  strokeColor = 'currentColor',
  dotColor = 'currentColor',
}) => {
  // 24 raios radiais distribuídos a cada 15 graus
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`sunburst-stamp shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Ponto central sólido (centro do carimbo) */}
      <circle cx="24" cy="24" r="2.2" fill={dotColor} />

      {/* Raios radiais precisos */}
      {ticks.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + 13 * Math.cos(rad);
        const y1 = 24 + 13 * Math.sin(rad);
        const x2 = 24 + 20 * Math.cos(rad);
        const y2 = 24 + 20 * Math.sin(rad);

        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};
