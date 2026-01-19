import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Carregando...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'size-5',
    md: 'size-8',
    lg: 'size-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className={`${sizeClasses[size]} text-sky-500 animate-spin`} />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}
