import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/hooks/use-game";
import { Layout } from "@/components/layout";
import { SplashScreen } from "@/components/splash-screen";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Room from "@/pages/room";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/room/:id" component={Room} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
        <GameProvider>
          <Layout>
            <Router />
          </Layout>
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
