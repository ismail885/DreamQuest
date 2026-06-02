"use client";

import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-16 md:py-20 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
        {icon ?? <Inbox className="w-8 h-8 text-gray-600" />}
      </div>
      <p className="text-gray-400 text-lg">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm mt-2">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
