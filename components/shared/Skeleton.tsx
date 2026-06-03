"use client";

import { classNames } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-white/5 ";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || "1rem",
  };

  return (
    <div
      className={classNames(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

export function SkeletonPage({ title = true }: { title?: boolean }) {
  return (
    <div className="space-y-6 animate-pulse">
      {title && (
        <div className="space-y-2">
          <Skeleton width="40%" height={32} className="bg-surface/30 " />
          <Skeleton width="60%" height={20} className="bg-surface/30 " />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface/30 border border-gray-800/30 rounded-xl p-4 space-y-3"
          >
            <Skeleton height={120} className="rounded-lg bg-surface/30 " />
            <Skeleton width="70%" height={20} className="bg-surface/30 " />
            <Skeleton width="90%" height={14} className="bg-surface/30 " />
            <Skeleton width="40%" height={14} className="bg-surface/30 " />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-gray-700/50 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <Skeleton height={16} />
      <Skeleton width="80%" height={16} />
      <div className="flex gap-2">
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
      </div>
    </div>
  );
}

export function SkeletonCharacterList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonAdventureList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 space-y-4"
        >
          <Skeleton height={160} />
          <Skeleton width="70%" height={24} />
          <Skeleton height={16} />
          <Skeleton width="50%" height={16} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 space-y-3"
        >
          <Skeleton width="40%" height={40} />
          <Skeleton width="60%" height={16} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSaveList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-surface border border-gray-700/50 rounded-xl"
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" height={18} />
            <Skeleton width="25%" height={14} />
          </div>
          <Skeleton width={80} height={28} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-80 space-y-6">
        <div className="bg-surface border border-gray-700/50 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col items-center">
            <Skeleton variant="circular" width={96} height={96} />
            <Skeleton width="50%" height={24} className="mt-4" />
            <Skeleton width="30%" height={16} />
          </div>
          <Skeleton height={8} />
        </div>
      </div>
      <div className="flex-1 space-y-6">
        <div className="bg-surface border border-gray-700/50 rounded-2xl p-6 space-y-4">
          <Skeleton width="30%" height={24} />
          <SkeletonSaveList count={3} />
        </div>
      </div>
    </div>
  );
}
