"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

// ── Flores SVG ─────────────────────────────────────────────────────────────────
type FlowerColor = "rose" | "peach" | "blush" | "cream" | "wine";

const flowerColors: Record<FlowerColor, { center: string; petals: string; shadow: string }> = {
  rose:  { center: "#c0392b", petals: "#e8a0a0", shadow: "#b03030" },
  peach: { center: "#d4845a", petals: "#f4c5a8", shadow: "#c07040" },
  blush: { center: "#b05070", petals: "#f0b8cc", shadow: "#904060" },
  cream: { center: "#c8a080", petals: "#f5e8d8", shadow: "#b09070" },
  wine:  { center: "#7b1f3a", petals: "#c8607a", shadow: "#5a1028" },
};

function FlowerSVG({
  color = "rose",
  size = 60,
  rotate = 0,
}: {
  color?: FlowerColor;
  size?: number;
  rotate?: number;
}) {
  const c = flowerColors[color];
  const r = size / 2;
  const petalR = r * 0.38;
  const petalDist = r * 0.42;
  const leafLen = r * 0.7;
  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      width={size}
      height={size + size * 0.3}
      viewBox={`0 0 ${size} ${size + size * 0.3}`}
      style={{ transform: `rotate(${rotate}deg)`, overflow: "visible" }}
    >
      {/* Stem */}
      <path
        d={`M ${r} ${r + petalR} Q ${r - 6} ${r + leafLen * 0.5} ${r - 4} ${r + leafLen}`}
        stroke="#7a9e7e"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Leaf */}
      <ellipse
        cx={r - 10}
        cy={r + leafLen * 0.6}
        rx={petalR * 0.7}
        ry={petalR * 0.35}
        fill="#8fbb8f"
        transform={`rotate(-35, ${r - 10}, ${r + leafLen * 0.6})`}
        opacity={0.85}
      />
      {/* Petals */}
      {petalAngles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = r + Math.cos(rad) * petalDist;
        const cy = r + Math.sin(rad) * petalDist;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={petalR}
            ry={petalR * 0.55}
            fill={c.petals}
            transform={`rotate(${angle}, ${cx}, ${cy})`}
            opacity={0.92}
          />
        );
      })}
      {/* Center circle */}
      <circle cx={r} cy={r} r={r * 0.22} fill={c.center} />
      <circle cx={r} cy={r} r={r * 0.13} fill={c.shadow} opacity={0.6} />
      {/* Pollen dots */}
      {[0, 60, 120, 180, 240, 300].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={r + Math.cos(rad) * r * 0.14}
            cy={r + Math.sin(rad) * r * 0.14}
            r={r * 0.035}
            fill="#f9e4b0"
            opacity={0.9}
          />
        );
      })}
    </svg>
  );
}

// ── Tipos & datos de flores flotantes ─────────────────────────────────────────
interface FloatingFlower {
  id: number;
  x: number;
  y: number;
  size: number;
  color: FlowerColor;
  rotate: number;
  duration: number;
  delay: number;
  amplitude: number;
}

const PALETTE: FlowerColor[] = ["rose", "peach", "blush", "cream", "wine"];

function makeFlowers(count: number): FloatingFlower[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 36 + Math.random() * 40,
    color: PALETTE[i % PALETTE.length],
    rotate: Math.random() * 360,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 4,
    amplitude: 8 + Math.random() * 14,
  }));
}

// ── Canvas de pétalos ──────────────────────────────────────────────────────────
interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  alpha: number;
  size: number;
  color: string;
}

const PETAL_COLORS = [
  "#f4c5a8", "#f0b8cc", "#e8a0a0", "#f5e8d8",
  "#c8607a", "#d4845a", "#e8d5c0", "#f9d5d5",
];

function usePetalCanvas(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const petals = useRef<Petal[]>([]);
  const raf = useRef<number>(0);

  const spawnPetal = useCallback((x: number, y: number) => {
    for (let i = 0; i < 3; i++) {
      petals.current.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -2 - Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.12,
        alpha: 0.85 + Math.random() * 0.15,
        size: 8 + Math.random() * 10,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.current = petals.current.filter((p) => p.alpha > 0.02);

      for (const p of petals.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.vx += (Math.random() - 0.5) * 0.08;
        p.angle += p.spin;
        p.alpha -= 0.007;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      }

      raf.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Spawn on mouse move when active
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => spawnPetal(e.clientX, e.clientY);
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [active, spawnPetal]);

  return { canvasRef, spawnPetal };
}

// ── Carta principal ────────────────────────────────────────────────────────────
// Cada string en `lines` es una línea del cuaderno
const LETTER_LINES = [
  "Para ti, Luz,",
  "",
  "El 14 tiene algo especial, algo que",
  "los dos sabemos y que no hace falta",
  "explicar. Han pasado cosas, han",
  "cambiado cosas, pero lo que no cambia",
  "es que cuando te miro, sigo viendo",
  "a alguien que me importa de verdad.",
  "",
  "Este año quiero recordar ese 14 de",
  "noviembre contigo, porque fuiste tú,",
  "y eso no se olvida fácil. No estás",
  "sola. Somos un equipo, ¿recuerdas?",
  "",
  "Te invito a que lo seamos una noche",
  "más, el 14 de mayo de 2026.",
  "6:00 pm · Parrilla Pintones - Baden",
  "",
  "Con cariño de siempre,",
  "Alexander Willian Estrada Pérez 🌸",
];

// ── Componente principal ───────────────────────────────────────────────────────
export default function InvitacionPage14052026() {
  const [opened, setOpened] = useState(false);
  const [flowers] = useState<FloatingFlower[]>(() => makeFlowers(18));
  const { canvasRef, spawnPetal } = usePetalCanvas(opened);

  const handleEnvelopeClick = () => {
    if (!opened) {
      setOpened(true);
      // Burst of petals at center
      setTimeout(() => {
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            spawnPetal(window.innerWidth / 2, window.innerHeight / 2);
          }, i * 80);
        }
      }, 200);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #f9e8e8 0%, #f5ddd0 25%, #fdf0e8 50%, #f0e0d8 75%, #f9e8e8 100%)",
      }}
    >
      {/* Canvas de pétalos */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-10"
        style={{ mixBlendMode: "multiply" }}
      />

      {/* Flores flotantes de fondo */}
      {flowers.map((f) => (
        <motion.div
          key={f.id}
          className="fixed pointer-events-none"
          style={{ left: `${f.x}%`, top: `${f.y}%`, zIndex: 1, opacity: 0.55 }}
          animate={{
            y: [0, -f.amplitude, 0, f.amplitude * 0.5, 0],
            rotate: [f.rotate, f.rotate + 15, f.rotate - 8, f.rotate + 5, f.rotate],
            scale: [1, 1.04, 0.98, 1.02, 1],
          }}
          transition={{
            duration: f.duration,
            delay: f.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FlowerSVG color={f.color} size={f.size} rotate={0} />
        </motion.div>
      ))}

      {/* Flores esquinas decorativas — fijas y más grandes */}
      <CornerFlowers />

      {/* ── SOBRE / CARTA ─────────────────────────────────────────── */}
      <div
        className="relative z-20 flex flex-col items-center"
        style={opened ? { height: "100vh", width: "100%", padding: "32px 16px", boxSizing: "border-box" } : {}}
      >
        <AnimatePresence mode="wait">
          {!opened ? (
            <EnvelopeScene key="envelope" onClick={handleEnvelopeClick} />
          ) : (
            <LetterScene key="letter" />
          )}
        </AnimatePresence>

        {/* Subtítulo — solo en el sobre */}
        {!opened && (
          <motion.p
            className="mt-8 text-sm tracking-widest uppercase"
            style={{ color: "#9e5a5a", letterSpacing: "0.25em", fontFamily: "Georgia, serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.8 }}
          >
            Toca para abrir
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ── Escena del sobre — 3 capas con z-index ────────────────────────────────────
// z-0: canvas trasero (cuerpo + triángulos + lacre)
// z-10: papel HTML
// z-20: canvas delantero (solapa)
function EnvelopeScene({ onClick }: { onClick: () => void }) {
  const [flapOpen, setFlapOpen] = useState(false);   // controla animación del pico
  const [paperUp, setPaperUp] = useState(false);     // controla animación del papel
  const [flapBehind, setFlapBehind] = useState(false); // z-0 mientras el pico se mueve
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const W = 340;
  const H = 220;
  const paperW = W - 16;
  const paperH = H * 0.85;
  const flapSpace = Math.ceil(H * 0.5) + 16;
  const paperPeek = 40;
  const FLAP_DURATION = 550;  // tiempo que tarda el pico en completar su viaje
  const PAPER_DURATION = 450; // tiempo que tarda el papel en bajar

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleHoverStart = () => {
    clearTimers();
    // 1. Pico baja a z-0 inmediatamente y empieza a subir
    setFlapBehind(true);
    setFlapOpen(true);
    // 2. Cuando el pico terminó → sube el papel
    timersRef.current.push(setTimeout(() => setPaperUp(true), FLAP_DURATION));
  };

  const handleHoverEnd = () => {
    clearTimers();
    // 1. Papel baja inmediatamente
    setPaperUp(false);
    // 2. Cuando el papel terminó → el pico vuelve a z-20 ANTES de bajar (para tapar el hueco)
    timersRef.current.push(setTimeout(() => setFlapBehind(false), PAPER_DURATION));
    // 3. Luego baja el pico (ya en z-20, tapando todo correctamente)
    timersRef.current.push(setTimeout(() => setFlapOpen(false), PAPER_DURATION + 50));
  };

  return (
    <motion.div
      className="relative flex flex-col items-center cursor-pointer select-none"
      style={{ width: W, height: H + flapSpace }}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.15, opacity: 0, y: -40 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      onClick={onClick}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      {/* z-0 — Canvas trasero: cuerpo del sobre */}
      <EnvelopeBack hovered={flapOpen} W={W} H={H} flapSpace={flapSpace} />

      {/* z-10 — Papel: sube cuando paperUp=true, baja al soltar */}
      <motion.div
        className="absolute pointer-events-none rounded-sm"
        style={{
          zIndex: 10,
          width: paperW,
          height: paperH,
          left: (W - paperW) / 2,
          top: flapSpace,
          background: "linear-gradient(170deg, #fefaf8 0%, #f8f0ea 100%)",
          border: "1px solid rgba(200,140,120,0.22)",
          boxShadow: "0 -4px 14px rgba(80,30,30,0.10)",
          clipPath: `inset(${-paperPeek}px 0px 0px 0px)`,
        }}
        animate={{ y: paperUp ? -paperPeek : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 10 + i * 10,
              left: 14,
              right: 14,
              height: 1,
              background: "rgba(140,80,70,0.10)",
            }}
          />
        ))}
      </motion.div>

      {/* Solapa animada: z-20 en reposo, z-0 mientras sube/baja */}
      <EnvelopeFlap hovered={flapOpen} flapBehind={flapBehind} W={W} H={H} flapSpace={flapSpace} />

      {/* z-20 — 3 triángulos fijos del frente + lacre */}
      <EnvelopeFront hovered={flapOpen} W={W} H={H} flapSpace={flapSpace} />

      {/* Flores decorativas del sobre */}
      <div className="absolute pointer-events-none" style={{ top: -8, left: -10, zIndex: 30 }}>
        <FlowerSVG color="blush" size={52} rotate={-20} />
      </div>
      <div className="absolute pointer-events-none" style={{ top: -6, right: -8, zIndex: 30 }}>
        <FlowerSVG color="peach" size={44} rotate={30} />
      </div>
      <div className="absolute pointer-events-none" style={{ bottom: -4, left: -12, zIndex: 30 }}>
        <FlowerSVG color="cream" size={38} rotate={15} />
      </div>
      <div className="absolute pointer-events-none" style={{ bottom: -4, right: -10, zIndex: 30 }}>
        <FlowerSVG color="rose" size={42} rotate={-10} />
      </div>
    </motion.div>
  );
}

// ── z-0: solo el rectángulo del fondo del sobre ───────────────────────────────
function EnvelopeBack({
  hovered, W, H, flapSpace,
}: {
  hovered: boolean; W: number; H: number; flapSpace: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = W;
    canvas.height = H + flapSpace;
    const Y = flapSpace;

    ctx.save();
    ctx.shadowColor = "rgba(120,60,60,0.18)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.beginPath();
    ctx.rect(0, Y, W, H);
    const bodyGrad = ctx.createLinearGradient(0, Y, W, Y + H);
    bodyGrad.addColorStop(0, "#fdf3ec");
    bodyGrad.addColorStop(1, "#f5e0d0");
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#c8897a";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, Y, W, H);
  }, [H, W, flapSpace]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        zIndex: 0,
        filter: hovered
          ? "drop-shadow(0 10px 28px rgba(160,60,60,0.2))"
          : "drop-shadow(0 5px 14px rgba(160,60,60,0.12))",
        transition: "filter 0.4s ease",
      }}
    />
  );
}

// ── z-0/z-20: solapa animada — z-20 en reposo, z-0 mientras sube ──────────────
function EnvelopeFlap({
  hovered, flapBehind, W, H, flapSpace,
}: {
  hovered: boolean; flapBehind: boolean;
  W: number; H: number; flapSpace: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const flapOpen = useRef(0);
  const targetFlap = useRef(0);

  useEffect(() => { targetFlap.current = hovered ? 1 : 0; }, [hovered]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = W;
    canvas.height = H + flapSpace;
    const Y = flapSpace;

    const draw = () => {
      ctx.clearRect(0, 0, W, H + flapSpace);
      flapOpen.current += (targetFlap.current - flapOpen.current) * 0.07;
      const f = flapOpen.current;

      // ── Solapa (triángulo superior animado) ─────────────────────────────────
      const flapTipY = Y + H * 0.5 - f * H;
      const flapGrad = ctx.createLinearGradient(0, Y, 0, Y + H * 0.5);
      if (f < 0.5) {
        flapGrad.addColorStop(0, "#f5d8c8");
        flapGrad.addColorStop(1, "#eeddd0");
      } else {
        flapGrad.addColorStop(0, "#eeddd0");
        flapGrad.addColorStop(1, "#fdf3ec");
      }
      ctx.save();
      if (f > 0.1) {
        ctx.shadowColor = "rgba(120,60,60,0.2)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = f > 0.5 ? -8 : 4;
      }
      ctx.beginPath();
      ctx.moveTo(0, Y);
      ctx.lineTo(W / 2, flapTipY);
      ctx.lineTo(W, Y);
      ctx.closePath();
      ctx.fillStyle = flapGrad;
      ctx.fill();
      ctx.strokeStyle = "#c8897a";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [H, W, flapSpace]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: flapBehind ? 0 : 20 }}
    />
  );
}

// ── z-20: 3 triángulos fijos del frente + lacre ────────────────────────────────
function EnvelopeFront({
  hovered, W, H, flapSpace,
}: {
  hovered: boolean;
  W: number; H: number; flapSpace: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const flapOpen = useRef(0);
  const targetFlap = useRef(0);

  useEffect(() => { targetFlap.current = hovered ? 1 : 0; }, [hovered]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = W;
    canvas.height = H + flapSpace;
    const Y = flapSpace;

    const draw = () => {
      ctx.clearRect(0, 0, W, H + flapSpace);
      flapOpen.current += (targetFlap.current - flapOpen.current) * 0.07;
      const f = flapOpen.current;

      // ── Triángulo inferior ──────────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(0, Y + H);
      ctx.lineTo(W / 2, Y + H * 0.55);
      ctx.lineTo(W, Y + H);
      ctx.closePath();
      const btGrad = ctx.createLinearGradient(0, Y + H * 0.55, 0, Y + H);
      btGrad.addColorStop(0, "#f0cbb8");
      btGrad.addColorStop(1, "#e8b8a0");
      ctx.fillStyle = btGrad;
      ctx.fill();
      ctx.strokeStyle = "#c8897a"; ctx.lineWidth = 1; ctx.stroke();

      // ── Triángulo izquierdo ─────────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(0, Y);
      ctx.lineTo(W / 2, Y + H * 0.55);
      ctx.lineTo(0, Y + H);
      ctx.closePath();
      const ltGrad = ctx.createLinearGradient(0, Y, W / 2, Y);
      ltGrad.addColorStop(0, "#f5d8c8");
      ltGrad.addColorStop(1, "#eeddd0");
      ctx.fillStyle = ltGrad;
      ctx.fill();
      ctx.strokeStyle = "#c8897a"; ctx.lineWidth = 0.8; ctx.stroke();

      // ── Triángulo derecho ───────────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(W, Y);
      ctx.lineTo(W / 2, Y + H * 0.55);
      ctx.lineTo(W, Y + H);
      ctx.closePath();
      const rtGrad = ctx.createLinearGradient(W / 2, Y, W, Y);
      rtGrad.addColorStop(0, "#eeddd0");
      rtGrad.addColorStop(1, "#f5d8c8");
      ctx.fillStyle = rtGrad;
      ctx.fill();
      ctx.strokeStyle = "#c8897a"; ctx.lineWidth = 0.8; ctx.stroke();

      // ── Lacre (desaparece al abrir la solapa) ──────────────────────────────
      if (f < 0.4) {
        const sealAlpha = 1 - f / 0.4;
        ctx.save();
        ctx.globalAlpha = sealAlpha;
        ctx.translate(W / 2, Y + H * 0.5);
        const sealGrad = ctx.createRadialGradient(0, -2, 2, 0, 0, 16);
        sealGrad.addColorStop(0, "#c0392b");
        sealGrad.addColorStop(0.6, "#922b21");
        sealGrad.addColorStop(1, "#641e16");
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fillStyle = sealGrad;
        ctx.shadowColor = "rgba(80,0,0,0.4)";
        ctx.shadowBlur = 6;
        ctx.fill();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          ctx.beginPath();
          ctx.ellipse(Math.cos(a) * 8, Math.sin(a) * 8, 4.5, 2.5, a, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,220,200,0.25)";
          ctx.shadowBlur = 0;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,200,180,0.3)";
        ctx.fill();
        ctx.restore();
      }

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [H, W, flapSpace]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 20 }}
    />
  );
}

// ── Escena de la carta desplegada — estilo cuadernillo ────────────────────────
function LetterScene() {
  const MARGIN_LEFT = 52;
  const WIDTH = 520; // ← ancho del cuadernillo en px
  const PAD_TOP = 24;
  const PAD_BOTTOM = 24;
  // 64px padding wrapper + ~50px barra de tareas Windows
  const TOTAL_HEIGHT = 680; // ← cambia este número para ajustar el alto
  const LINE_HEIGHT = Math.floor((TOTAL_HEIGHT - PAD_TOP - PAD_BOTTOM) / LETTER_LINES.length);

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ y: 60, opacity: 0, scale: 0.85 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.1 }}
    >
      {/* Flores esquinas */}
      <div className="absolute -top-7 -left-8 pointer-events-none" style={{ zIndex: 10 }}>
        <FlowerSVG color="rose" size={54} rotate={-15} />
      </div>
      <div className="absolute -top-5 -right-7 pointer-events-none" style={{ zIndex: 10 }}>
        <FlowerSVG color="blush" size={46} rotate={25} />
      </div>
      <div className="absolute -bottom-6 -left-9 pointer-events-none" style={{ zIndex: 10 }}>
        <FlowerSVG color="peach" size={48} rotate={10} />
      </div>
      <div className="absolute -bottom-5 -right-8 pointer-events-none" style={{ zIndex: 10 }}>
        <FlowerSVG color="cream" size={42} rotate={-20} />
      </div>

      {/* Cuadernillo */}
      <div
        className="relative overflow-hidden"
        style={{
          width: WIDTH,
          height: TOTAL_HEIGHT,
          background: "#fdfaf7",
          boxShadow: "0 20px 60px rgba(120,50,50,0.18), 0 4px 12px rgba(120,50,50,0.10), inset 0 0 0 1px rgba(180,120,100,0.15)",
          borderRadius: 4,
        }}
      >
        {/* Perforaciones izquierda — distribuidas uniformemente */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: 18, display: "flex", flexDirection: "column", justifyContent: "space-around", zIndex: 4 }}
        >
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: "50%",
              background: "#e8d5c0", border: "2px solid #c8a080",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
            }} />
          ))}
        </div>

        {/* Margen rojo vertical */}
        <div className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: MARGIN_LEFT, width: 2, background: "rgba(192,57,43,0.45)", zIndex: 3 }} />

        {/* Líneas horizontales — una por renglón, alineadas con el texto */}
        {LETTER_LINES.map((_, i) => (
          <div key={i} className="absolute pointer-events-none" style={{
            left: 0, right: 0,
            top: PAD_TOP + i * LINE_HEIGHT + LINE_HEIGHT - 1,
            height: 1,
            background: "rgba(100,140,200,0.20)",
            zIndex: 1,
          }} />
        ))}
        {/* Línea extra al fondo para espejo del padding superior */}
        <div className="absolute pointer-events-none" style={{
          left: 0, right: 0,
          top: PAD_TOP + LETTER_LINES.length * LINE_HEIGHT + PAD_BOTTOM - 1,
          height: 1,
          background: "rgba(100,140,200,0.20)",
          zIndex: 1,
        }} />

        {/* Texto: cada línea ocupa exactamente un renglón */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ position: "absolute", top: PAD_TOP, left: MARGIN_LEFT + 14, right: 24, zIndex: 2 }}
        >
          {LETTER_LINES.map((line, i) => {
            const isHeading = i === 0;
            const isPlace = line.startsWith("6:00");
            const isSignOff = i >= LETTER_LINES.length - 2;
            return (
              <div key={i} style={{
                height: LINE_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: "'Caveat', 'Comic Sans MS', cursive",
                  fontSize: isHeading ? 20 : 17,
                  fontWeight: isHeading ? 700 : 400,
                  color: isPlace ? "#7b3f00" : isSignOff ? "rgba(90,26,26,0.75)" : "#3a1a1a",
                  letterSpacing: 0.2,
                  fontStyle: isPlace ? "italic" : "normal",
                }}>
                  {line}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Flores en las cuatro esquinas de la pantalla ───────────────────────────────
function CornerFlowers() {
  return (
    <>
      {/* Esquina superior izquierda */}
      <div className="fixed top-0 left-0 z-5 pointer-events-none flex">
        <div style={{ transform: "translate(-10px,-10px)" }}>
          <FlowerSVG color="blush" size={90} rotate={10} />
        </div>
        <div style={{ transform: "translate(-20px, 20px)" }}>
          <FlowerSVG color="peach" size={64} rotate={-20} />
        </div>
        <div style={{ transform: "translate(-30px, 50px)" }}>
          <FlowerSVG color="cream" size={50} rotate={30} />
        </div>
      </div>

      {/* Esquina superior derecha */}
      <div className="fixed top-0 right-0 z-5 pointer-events-none flex flex-row-reverse">
        <div style={{ transform: "translate(10px,-10px)" }}>
          <FlowerSVG color="rose" size={86} rotate={-15} />
        </div>
        <div style={{ transform: "translate(20px, 25px)" }}>
          <FlowerSVG color="wine" size={60} rotate={25} />
        </div>
        <div style={{ transform: "translate(28px, 55px)" }}>
          <FlowerSVG color="blush" size={46} rotate={-30} />
        </div>
      </div>

      {/* Esquina inferior izquierda */}
      <div className="fixed bottom-0 left-0 z-5 pointer-events-none flex flex-col-reverse">
        <div style={{ transform: "translate(-8px, 8px)" }}>
          <FlowerSVG color="peach" size={88} rotate={5} />
        </div>
        <div style={{ transform: "translate(20px, 0px)" }}>
          <FlowerSVG color="rose" size={62} rotate={-25} />
        </div>
        <div style={{ transform: "translate(48px, -10px)" }}>
          <FlowerSVG color="cream" size={48} rotate={15} />
        </div>
      </div>

      {/* Esquina inferior derecha */}
      <div className="fixed bottom-0 right-0 z-5 pointer-events-none flex flex-col-reverse items-end">
        <div style={{ transform: "translate(8px, 8px)" }}>
          <FlowerSVG color="wine" size={84} rotate={-8} />
        </div>
        <div style={{ transform: "translate(-22px, 0px)" }}>
          <FlowerSVG color="blush" size={58} rotate={20} />
        </div>
        <div style={{ transform: "translate(-50px, -12px)" }}>
          <FlowerSVG color="peach" size={44} rotate={-18} />
        </div>
      </div>
    </>
  );
}

