import { useEffect } from "react";
import { LogoSplash } from "./Logo";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sky-50 to-white flex items-center justify-center z-50">
      <LogoSplash />
    </div>
  );
}