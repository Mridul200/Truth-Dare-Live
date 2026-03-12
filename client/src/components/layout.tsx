import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Zap } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { isConnected } = useGame();

  return (
    <div className="relative min-h-screen w-full font-sans text-foreground overflow-hidden">
      <div className="animated-bg">
        <div className="animated-bg-extra" />
        <div className="animated-bg-pink" />
      </div>
      
      <header className="absolute top-0 w-full p-5 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #8A2BE2, #00C2FF)",
              boxShadow: "0 0 15px rgba(138, 43, 226, 0.6)",
            }}
          >
            <span className="font-orbitron font-black text-white text-sm">TD</span>
          </div>
          <span
            className="font-orbitron font-bold text-base hidden sm:block tracking-wider"
            style={{
              background: "linear-gradient(135deg, #8A2BE2, #00C2FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Truth & Dare
          </span>
        </div>
        
        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge
                className="text-xs px-3 py-1 rounded-full border font-medium"
                style={{
                  background: "rgba(0, 255, 128, 0.1)",
                  borderColor: "rgba(0, 255, 128, 0.4)",
                  color: "#00ff80",
                  boxShadow: "0 0 10px rgba(0, 255, 128, 0.2)",
                }}
              >
                <Wifi className="w-3 h-3 mr-1" /> Online
              </Badge>
            </motion.div>
          ) : (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge variant="destructive" className="shadow-lg">
                <WifiOff className="w-3 h-3 mr-1" /> Reconnecting...
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      <footer className="absolute bottom-4 w-full flex flex-col items-center gap-1 z-10">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3" style={{ color: "#8A2BE2" }} />
          <p className="text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
            Powered by{" "}
            <span
              className="font-orbitron font-bold"
              style={{
                background: "linear-gradient(135deg, #8A2BE2, #00C2FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Mridul
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
