"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import confetti from "canvas-confetti";
import DateOptions from "./DateOptions";

const acceptTexts = [
  "¡Sí! 💝",
  "¡Vamos! 💖",
  "¡Dale! 🥺",
  "¡Por fa! 😍",
  "¡PORFAAAA! 🙏",
];

const rejectTexts = [
  "Rechazar",
  "Mejor no...",
  "Mmm no",
  "Nop",
  "¡Para nada!",
];

const EMOJIS = [
  "💝", "🌸", "✨", "💕", "🌺", "💫", "🎀", "🌷",
  "🍬", "🎊", "💖", "🌟", "🦋", "🌈", "🥰", "😍",
  "💘", "💗", "💓", "💞", "🎁", "🌻", "🍓", "🍭",
];

// Tamaño base ajustable (px) — sube o baja este valor para cambiar el tamaño general
const EMOJI_BASE_SIZE = 28;

// Gotas deterministas: evita diferencias servidor/cliente al no usar Math.random()
const RAIN_DROPS = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  emoji: EMOJIS[i % EMOJIS.length],
  x: ((i * 7 + (i % 3) * 13 + (i % 11) * 3) % 95) + 1, // 1–96% de ancho
  sizeMul: 0.6 + (i % 6) * 0.28,   // 0.6× – 2.0× del base
  duration: 5 + (i % 9) * 1.0,     // 5–13s por ciclo
  delay: (i * 0.42) % 8,           // 0–8s de retraso inicial
  opacity: 0.3 + (i % 7) * 0.09,   // 0.3–0.84
}));

export default function Invitation() {
  const [rejectCount, setRejectCount] = useState(0);
  const [rejectPos, setRejectPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [accepted, setAccepted] = useState(false);

  const handleReject = useCallback(() => {
    setRejectCount((prev) => prev + 1);
    const btnW = 140;
    const btnH = 55;
    const margin = 24;
    const x = margin + Math.random() * (window.innerWidth - margin * 2 - btnW);
    const y =
      margin + Math.random() * (window.innerHeight - margin * 2 - btnH);
    setRejectPos({ x, y });
  }, []);

  const triggerConfetti = useCallback(() => {
    const end = Date.now() + 4000;
    const colors = [
      "#a786ff",
      "#fd8bbc",
      "#eca184",
      "#f8deb1",
      "#ff69b4",
      "#ff1493",
    ];
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors,
      });
      requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handleAccept = useCallback(() => {
    triggerConfetti();
    setTimeout(() => setAccepted(true), 1000);
  }, [triggerConfetti]);

  if (accepted) {
    return <DateOptions />;
  }

  const acceptScale = Math.min(1 + rejectCount * 0.25, 3.5);
  const acceptIdx = Math.min(rejectCount, acceptTexts.length - 1);
  const rejectIdx = Math.min(rejectCount, rejectTexts.length - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 flex items-center justify-center overflow-hidden relative">
      {/* Emoji rain */}
      {RAIN_DROPS.map((drop) => (
        <motion.span
          key={drop.id}
          className="fixed pointer-events-none select-none"
          style={{
            left: `${drop.x}%`,
            top: 0,
            fontSize: `${Math.round(EMOJI_BASE_SIZE * drop.sizeMul)}px`,
            opacity: drop.opacity,
            zIndex: 0,
          }}
          initial={{ y: "-120px" }}
          animate={{ y: ["-120px", "110vh"] }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear",
            repeatDelay: 0,
          }}
        >
          {drop.emoji}
        </motion.span>
      ))}

      {/* Gatito izquierdo */}
      <motion.div
        className="fixed bottom-0 left-0 pointer-events-none select-none z-5"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/gatito.png" alt="gatito" width={220} height={220} />
      </motion.div>

      {/* Gatito derecho (espejado) */}
      <motion.div
        className="fixed bottom-0 right-0 pointer-events-none select-none"
        style={{ scaleX: -1 }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <Image src="/gatito.png" alt="gatito" width={220} height={220} />
      </motion.div>

      {/* Main card */}
      <motion.div
        className="bg-white/85 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 text-center border border-pink-200 relative z-10"
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 120 }}
      >
        {/* Pulsing heart */}
        <motion.div
          className="text-7xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          💖
        </motion.div>

        <h1 className="text-3xl font-bold text-rose-500 mb-1">¡Hola! 🌸</h1>
        <p className="text-gray-400 mb-4 text-sm">
          Tengo algo importante que preguntarte...
        </p>
        <p className="text-4xl font-extrabold text-rose-600 mb-8 leading-tight">
          ¿Quieres salir
          <br />
          conmigo? 💕
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4">
          {/* Accept — grows bigger with each reject */}
          <motion.button
            onClick={handleAccept}
            className="bg-rose-300 hover:bg-rose-400 active:bg-rose-700 text-white font-bold rounded-full shadow-lg px-8 py-4 text-xl cursor-pointer select-none"
            animate={{ scale: acceptScale }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {acceptTexts[acceptIdx]}
          </motion.button>

          {/* Reject — only rendered inside card before first click */}
          {rejectPos === null && (
            <motion.button
              onClick={handleReject}
              className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium rounded-full px-6 py-3 text-base cursor-pointer select-none"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {rejectTexts[rejectIdx]}
            </motion.button>
          )}
        </div>

        {/* Teasing messages */}
        {rejectCount > 0 && (
          <motion.p
            key={rejectCount}
            className="mt-5 text-rose-400 text-sm font-medium"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {rejectCount === 1
              ? "¡Nooo! 🥺 Inténtalo de nuevo..."
              : rejectCount === 2
              ? "¡No seas así! 😢 Sabes que quieres..."
              : "¡El botón no quiere que digas que no! 😂"}
          </motion.p>
        )}
      </motion.div>

      {/* Floating reject button — appears after first click and runs away */}
      {rejectPos !== null && (
        <motion.button
          onClick={handleReject}
          className="fixed top-0 left-0 bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium rounded-full px-6 py-3 text-base z-50 cursor-pointer select-none shadow-md"
          animate={{ x: rejectPos.x, y: rejectPos.y }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
        >
          {rejectTexts[rejectIdx]}
        </motion.button>
      )}
    </div>
  );
}
