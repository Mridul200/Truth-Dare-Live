import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<"show" | "exit">("show");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("exit");
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {phase === "show" && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: "radial-gradient(ellipse at center, #1a0a35 0%, #0B0F2A 50%, #050820 100%)",
          }}
        >
          {/* Stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 2.5 + 0.5,
                  height: Math.random() * 2.5 + 0.5,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.2,
                }}
                animate={{ opacity: [Math.random() * 0.5 + 0.2, 1, Math.random() * 0.5 + 0.2] }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* Planet + Rocket */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "backOut" }}
            className="relative flex items-center justify-center mb-10"
            style={{ width: 220, height: 220 }}
          >
            {/* Planet */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute"
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #8A2BE2, #3a0a6e)",
                boxShadow: "0 0 40px rgba(138, 43, 226, 0.8), 0 0 80px rgba(138, 43, 226, 0.4), inset -20px -10px 30px rgba(0,0,0,0.5)",
              }}
            >
              {/* Planet surface details */}
              <div
                className="absolute rounded-full opacity-30"
                style={{
                  width: 40,
                  height: 18,
                  background: "rgba(0,194,255,0.6)",
                  top: "30%",
                  left: "20%",
                  filter: "blur(4px)",
                }}
              />
              <div
                className="absolute rounded-full opacity-20"
                style={{
                  width: 30,
                  height: 12,
                  background: "rgba(255,46,159,0.6)",
                  top: "55%",
                  left: "40%",
                  filter: "blur(3px)",
                }}
              />
            </motion.div>

            {/* Planet Ring */}
            <div
              className="absolute"
              style={{
                width: 180,
                height: 40,
                border: "3px solid rgba(0, 194, 255, 0.7)",
                borderRadius: "50%",
                boxShadow: "0 0 15px rgba(0, 194, 255, 0.5), 0 0 30px rgba(0, 194, 255, 0.2)",
                transform: "rotateX(70deg)",
              }}
            />
            {/* Ring glow layer */}
            <div
              className="absolute"
              style={{
                width: 190,
                height: 50,
                border: "1px solid rgba(138, 43, 226, 0.4)",
                borderRadius: "50%",
                transform: "rotateX(70deg)",
                filter: "blur(2px)",
              }}
            />

            {/* Orbiting Rocket */}
            <div
              className="absolute"
              style={{
                width: "100%",
                height: "100%",
                animation: "rocketOrbit 2.5s linear infinite",
              }}
            >
              <div style={{ position: "absolute", top: "50%", left: "50%", marginTop: -18, marginLeft: 70 }}>
                <span style={{ fontSize: 28, filter: "drop-shadow(0 0 10px rgba(255, 46, 159, 0.9))" }}>🚀</span>
              </div>
            </div>

            {/* Glow behind planet */}
            <div
              className="absolute -z-10"
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </motion.div>

          {/* MridulVerse Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <h1
              className="font-orbitron font-black text-5xl sm:text-6xl tracking-widest mb-2"
              style={{
                background: "linear-gradient(135deg, #8A2BE2 0%, #00C2FF 50%, #FF2E9F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(138, 43, 226, 0.6))",
              }}
            >
              MridulVerse
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="text-sm sm:text-base tracking-[0.3em] uppercase font-medium"
              style={{ color: "rgba(0, 194, 255, 0.85)" }}
            >
              Apps From Another Universe.
            </motion.p>
          </motion.div>

          {/* Credit */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="absolute bottom-10 text-xs tracking-widest uppercase"
            style={{ color: "rgba(255, 255, 255, 0.35)" }}
          >
            Created by Mridul Mani Tripathi
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.3 }}
            className="absolute bottom-6 w-48"
          >
            <div className="w-full h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 2.3, duration: 1.5, ease: "easeInOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #8A2BE2, #00C2FF, #FF2E9F)" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
