"use client";

import { useMemo } from "react";

export default function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        size: 8 + ((i * 7 + 3) % 20),
        left: `${(i * 13 + 5) % 100}%`,
        top: `${(i * 17 + 10) % 100}%`,
        delay: (i * 1.3) % 5,
        duration: 4 + (i % 4),
        color: [
          "bg-primary/20",
          "bg-turmeric/20",
          "bg-coral/20",
          "bg-olive/20",
          "bg-peach/30",
          "bg-gold/20",
          "bg-paprika/15",
          "bg-leaf/15",
        ][i],
      })),
    []
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color} animate-float`}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
