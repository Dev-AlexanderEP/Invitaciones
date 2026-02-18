"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from 'next/image'
import confetti from "canvas-confetti";

type Option = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  imageNote: string;
};

const options: Option[] = [
  {
    id: "makis",
    emoji: "🍣",
    title: "Makis",
    description: "Makis de todo tipo 🌊",
    // IMAGEN: Buscar foto de restaurante de sushi con makis coloridos
    // Tamaño recomendado: 400×220px
    // Colocar en: /public/images/makis.jpg
    // Reemplazar el div gris con:
    //   import Image from 'next/image'
    //   <Image src="/images/makis.jpg" alt="Makis" width={400} height={220} className="w-full h-[220px] object-cover" />
    imageNote: "📷 Foto de makis coloridos (400×220px)",
  },
  {
    id: "chicharron",
    emoji: "🥩",
    title: "Chicharrón",
    description: "Crujiente, dorado y bien condimentado 😋",
    // IMAGEN: Buscar foto de chicharrón peruano dorado y crujiente
    // Tamaño recomendado: 400×220px
    // Colocar en: /public/images/chicharron.jpg
    // Reemplazar el div gris con:
    //   <Image src="/images/chicharron.jpg" alt="Chicharrón" width={400} height={220} className="w-full h-[220px] object-cover" />
    imageNote: "📷 Foto de chicharrón peruano dorado (400×220px)",
  },
  {
    id: "parrilla",
    emoji: "🍗",
    title: "Parrilla de Pollo",
    description: "La que más nos gusta, jugosa 🔥",
    // IMAGEN: Buscar foto de parrilla de pollo a la brasa con papas
    // Tamaño recomendado: 400×220px
    // Colocar en: /public/images/parrilla.jpg
    // Reemplazar el div gris con:
    //   <Image src="/images/parrilla.jpg" alt="Parrilla" width={400} height={220} className="w-full h-[220px] object-cover" />
    imageNote: "📷 Foto de pollo a la brasa con papas (400×220px)",
  },
];

const RISE_EMOJIS = ["💕", "✨", "🎊", "💖", "🌸", "⭐", "🎉", "💫", "🌺", "🎀"];
const RISE_DROPS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  emoji: RISE_EMOJIS[i % RISE_EMOJIS.length],
  x: ((i * 11 + (i % 5) * 7 + (i % 13) * 3) % 94) + 3,
  sizeMul: 0.7 + (i % 5) * 0.25,
  duration: 4 + (i % 7) * 0.9,
  delay: (i * 0.38) % 7,
  opacity: 0.35 + (i % 6) * 0.09,
}));

export default function DateOptions() {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!confirmed) return;
    const colors = ["#f43f5e", "#fb7185", "#fda4af", "#a78bfa", "#c4b5fd", "#fcd34d"];
    confetti({ particleCount: 80, spread: 90, origin: { x: 0.5, y: 0.65 }, colors });
    const t = setTimeout(() => {
      confetti({ particleCount: 45, angle: 60, spread: 65, startVelocity: 55, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 45, angle: 120, spread: 65, startVelocity: 55, origin: { x: 1, y: 0.6 }, colors });
    }, 350);
    return () => clearTimeout(t);
  }, [confirmed]);

  const handleSelect = async (optionId: string) => {
    if (selected) return;
    setSelected(optionId);

    // Llamar a la API de email
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option: optionId }),
      });
    } catch (error) {
      console.error("Error al enviar email:", error);
    }

    setTimeout(() => setConfirmed(true), 700);
  };

  if (confirmed) {
    const selectedOption = options.find((o) => o.id === selected);
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 flex items-center justify-center overflow-hidden">
        {/* Emojis que suben desde abajo */}
        {RISE_DROPS.map((drop) => (
          <motion.span
            key={drop.id}
            className="fixed pointer-events-none select-none"
            style={{
              left: `${drop.x}%`,
              top: 0,
              fontSize: `${Math.round(24 * drop.sizeMul)}px`,
              opacity: drop.opacity,
              zIndex: 0,
            }}
            initial={{ y: "110vh" }}
            animate={{ y: ["110vh", "-120px"] }}
            transition={{
              duration: drop.duration,
              repeat: Infinity,
              delay: drop.delay,
              ease: "linear",
            }}
          >
            {drop.emoji}
          </motion.span>
        ))}

        {/* Gatito2 arriba izquierda */}
        <motion.div
          className="fixed top-0 left-0 pointer-events-none select-none"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/gatito2.png" alt="gatito2" width={200} height={200} />
        </motion.div>

        {/* Gatito2 arriba derecha (espejado) */}
        <motion.div
          className="fixed top-0 right-0 pointer-events-none select-none"
          style={{ scaleX: -1 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          <Image src="/gatito2.png" alt="gatito2" width={200} height={200} />
        </motion.div>

        {/* Perrito izquierdo */}
        <motion.div
          className="fixed bottom-0 left-0 pointer-events-none select-none"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/perrito.png" alt="perrito" width={220} height={220} />
        </motion.div>

        {/* Perrito derecho (espejado) */}
        <motion.div
          className="fixed bottom-0 right-0 pointer-events-none select-none"
          style={{ scaleX: -1 }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <Image src="/perrito.png" alt="perrito" width={220} height={220} />
        </motion.div>

        <motion.div
          className="text-center px-6 relative z-10 flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12 }}
        >
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎊
          </motion.div>
          <h2 className="text-5xl font-extrabold text-rose-500 mb-4">
            ¡Perfecto!
          </h2>

          {/* Tarjeta de opción elegida */}
          {selectedOption && (
            <motion.div
              className="bg-white/75 backdrop-blur-sm rounded-2xl px-10 py-5 mb-5 shadow-lg border border-pink-200"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", damping: 14 }}
            >
              <div className="text-5xl mb-2">{selectedOption.emoji}</div>
              <div className="text-2xl font-bold text-gray-700 mb-1">{selectedOption.title}</div>
              <div className="text-sm text-gray-400 mb-3">{selectedOption.description}</div>
              <span className="inline-block bg-rose-100 text-rose-500 px-4 py-1 rounded-full text-sm font-semibold">
                🍡 Mochis incluidos
              </span>
            </motion.div>
          )}

          <p className="text-2xl text-gray-600 mb-2">¡Va a ser increíble! ✨</p>
          <p className="text-gray-400 text-lg mb-5">¡Nos vemos pronto! 💕</p>

          {/* Emojis decorativos flotantes */}
          <motion.div
            className="flex gap-3 text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {["💕", "🌸", "💖", "🌸", "💕"].map((e, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -8, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.4 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
              >
                {e}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100vh] bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 py-12 px-4 overflow-hidden">
      {/* Perrito izquierdo */}
      <motion.div
        className="fixed bottom-0 left-0 pointer-events-none select-none"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/perrito.png" alt="perrito" width={220} height={220} />
      </motion.div>

      {/* Perrito derecho (espejado) */}
      <motion.div
        className="fixed bottom-0 right-0 pointer-events-none select-none"
        style={{ scaleX: -1 }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <Image src="/perrito.png" alt="perrito" width={220} height={220} />
      </motion.div>

      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="text-6xl mb-3"
            animate={{ rotate: [0, 12, -12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.div>
          <h1 className="text-4xl font-extrabold text-rose-500 mb-2">
            ¡Yayyyy! 🥳
          </h1>
          <p className="text-2xl font-semibold text-gray-700">
            ¿A dónde vamos? 🌟
          </p>
          <p className="text-gray-400 mt-2">
            Elige la opción que más se te antoje 💖
            <br />
            <span className="text-rose-400 font-medium">
              ¡Todas incluyen mochis en el camino! 🍡
            </span>
          </p>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((opt, i) => (
            <motion.div
              key={opt.id}
              className="relative bg-white/85 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-rose-400 transition-colors"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", damping: 14 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(opt.id)}
            >
              
                {/* ============================================================
                IMAGEN: Reemplaza este bloque gris con <Image> de Next.js
                ------------------------------------------------------------
                import Image from 'next/image' */}

                <Image
                  src={`/${opt.id}.jpg`}
                  alt={opt.title}
                  width={400}
                  height={220}
                  className="w-full h-[220px] object-cover"
                />
                {/* ============================================================ */}
             
              {/* <div className="w-full h-[220px] bg-gray-300 flex items-center justify-center">
                <p className="text-gray-500 text-xs text-center px-4 leading-relaxed">
                  {opt.imageNote}
                </p>
              </div> */}

              <div className="p-5 border-t border-pink-600">
                <div className="flex items-center pb-2 ">
                  <span className="text-4xl">{opt.emoji}</span>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1 mb-1">
                    {opt.title}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm mb-3">{opt.description}</p>
                <span className="inline-block bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-semibold">
                  🍡 Mochis incluidos
                </span>
              </div>

              {/* Selected overlay */}
              {selected === opt.id && (
                <motion.div
                  className="absolute inset-0 bg-rose-400/20 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-6xl drop-shadow-lg">✅</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-center text-gray-400 mt-8 text-sm">
          ¡Lo que elijas va a ser perfecto! 💕
        </p>
      </motion.div>
    </div>
  );
}
