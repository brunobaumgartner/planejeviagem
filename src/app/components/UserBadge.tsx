import { Crown, User } from 'lucide-react';
import type { UserRole } from '@/types';

interface UserBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function UserBadge({ role, size = 'md', showIcon = true }: UserBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (role === 'guest') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 rounded-full font-medium ${sizeClasses[size]}`}
      >
        {showIcon && <User className={iconSizes[size]} />}
        <span>Visitante</span>
      </div>
    );
  }

  if (role === 'premium') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full font-medium ${sizeClasses[size]}`}
      >
        {showIcon && <Crown className={iconSizes[size]} />}
        <span>Premium</span>
      </div>
    );
  }

  // logged
  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-sky-100 text-sky-700 rounded-full font-medium ${sizeClasses[size]}`}
    >
      {showIcon && <User className={iconSizes[size]} />}
      <span>Usuário</span>
    </div>
  );
}
