"use client";

import type { CSSProperties } from "react";

export default function AnimatedBlob({
  className = "",
  color = "bg-primary/10",
  style,
}: {
  className?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`absolute rounded-full blur-3xl animate-blob ${color} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
