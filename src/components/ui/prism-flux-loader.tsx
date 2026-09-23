"use client";

import React, { useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";

interface CubeLoaderProps {
  size?: number; // cube size
  speed?: number; // rotation speed
  textSize?: number;
  textSeize?: number;
  text?: React.ReactNode;
  className?: string;
}

export const PrismFluxLoader: React.FC<CubeLoaderProps> = ({
  size = 36,
  speed = 5,
  text,
  className = "",
}) => {
  const [time, setTime] = useState(0);

  // Cube rotation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 0.02 * speed);
    }, 16);
    return () => clearInterval(interval);
  }, [speed]);

  const half = size / 2;
  const iconSize = Math.max(12, Math.round(size * 0.38));

  const faceTransforms = [
    `rotateY(0deg) translateZ(${half}px)`,   // front
    `rotateY(180deg) translateZ(${half}px)`, // back
    `rotateY(90deg) translateZ(${half}px)`,  // right
    `rotateY(-90deg) translateZ(${half}px)`, // left
    `rotateX(90deg) translateZ(${half}px)`,  // top
    `rotateX(-90deg) translateZ(${half}px)`, // bottom
  ];

  return (
    <div className={`flex flex-col items-center justify-center gap-3.5 ${className}`}>
      {/* Cube Container with 3D perspective */}
      <div style={{ perspective: "800px" }} className="py-2.5">
        <div
          className="relative"
          style={{
            width: size,
            height: size,
            transformStyle: "preserve-3d",
            transform: `rotateY(${time * 30}deg) rotateX(${time * 30}deg)`,
          }}
        >
          {/* Cube Faces */}
          {faceTransforms.map((transform, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center bg-white/95 backdrop-blur-xs shadow-xs"
              style={{
                width: size,
                height: size,
                border: "1.5px solid #1E6702",
                transform,
                backfaceVisibility: "hidden",
              }}
            >
              <PlusIcon
                style={{ width: iconSize, height: iconSize }}
                className="text-[#1E6702]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Render text if provided */}
      {text && (
        typeof text === "string" ? (
          <p className="text-sm font-semibold text-slate-600 tracking-normal">
            {text}
          </p>
        ) : (
          text
        )
      )}
    </div>
  );
};
