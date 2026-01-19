import { ArrowLeft, RotateCcw, Share, MoreHorizontal } from "lucide-react";
import { Logo } from "./Logo";

interface HeaderProps {
  showBackButton?: boolean;
  showActions?: boolean;
}

export function Header({ showBackButton = true, showActions = true }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
      <div className="flex items-center justify-between">
        <div className="w-10">
          {showBackButton && (
            <button className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <Logo size={32} variant="full" className="text-sky-500" />
        <div className="flex items-center gap-1">
          {showActions && (
            <>
              <button className="p-2">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button className="p-2">
                <Share className="w-5 h-5" />
              </button>
              <button className="p-2">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}