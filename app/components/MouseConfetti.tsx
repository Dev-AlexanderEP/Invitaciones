"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

// Tiempo mínimo entre disparos (ms)
const THROTTLE_MS = 80;
// Píxeles mínimos que debe moverse el cursor para disparar
const MIN_DISTANCE = 12;

export function MouseConfetti() {
  const lastFireRef = useRef(0);
  const lastPosRef = useRef({ x: -1, y: -1 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();

      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Ignorar si el cursor se movió poco o si aún no pasó el throttle
      if (distance < MIN_DISTANCE || now - lastFireRef.current < THROTTLE_MS) return;

      lastFireRef.current = now;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      const origin = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };

      const defaults = {
        spread: 360,
        ticks: 40,
        gravity: 0.4,
        decay: 0.91,
        startVelocity: 7,
        colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
        origin,
      };

      confetti({
        ...defaults,
        particleCount: 5,
        scalar: 0.75,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 3,
        scalar: 0.45,
        shapes: ["circle"],
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return null;
}
