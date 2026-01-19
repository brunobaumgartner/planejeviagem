import { ReactNode } from "react";

interface CategorySectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actionButton?: ReactNode;
}

export function CategorySection({ title, subtitle, children, actionButton }: CategorySectionProps) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-sky-500 mb-1">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        {actionButton && (
          <div className="ml-4">
            {actionButton}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}