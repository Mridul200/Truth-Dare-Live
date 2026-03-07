import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const { isConnected } = useGame();

  return (
    <div className="relative min-h-screen w-full font-sans text-foreground overflow-hidden">
      <div className="animated-bg">
        <div className="animated-bg-extra" />
      </div>
      
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-display font-bold text-xl">TD</span>
          </div>
          <span className="font-display font-bold text-xl hidden sm:block tracking-tight text-gray-900">
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
              <Badge variant="secondary" className="bg-white/50 backdrop-blur-md text-emerald-600 border-emerald-100 hover:bg-white/60">
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
              <Badge variant="destructive" className="shadow-lg shadow-destructive/20">
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
    </div>
  );
}
