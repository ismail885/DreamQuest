"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
 label: string;
 href?: string;
}

interface BreadcrumbProps {
 items: BreadcrumbItem[];
 currentStep?: number;
 totalSteps?: number;
}

export default function Breadcrumb({ items, currentStep, totalSteps }: BreadcrumbProps) {
 return (
 <div className="flex items-center gap-2 text-sm">
 <Link 
 href="/" 
 className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
 >
 <Home className="w-4 h-4" />
 <span className="hidden sm:inline">Accueil</span>
 </Link>
 
 {items.map((item, index) => (
 <div key={index} className="flex items-center gap-2">
 <ChevronRight className="w-4 h-4 text-gray-600" />
 {item.href ? (
 <Link 
 href={item.href}
 className="text-gray-400 hover:text-cyan-400 transition-colors"
 >
 {item.label}
 </Link>
 ) : (
 <span className="text-cyan-400 font-medium">{item.label}</span>
 )}
 </div>
 ))}
 
 {currentStep !== undefined && totalSteps !== undefined && (
 <div className="flex items-center gap-2 ml-auto">
 <div className="text-xs text-gray-500 ">
 Étape {currentStep}/{totalSteps}
 </div>
 <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
 <div 
 className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
 style={{ width: `${(currentStep / totalSteps) * 100}%` }}
 />
 </div>
 </div>
 )}
 </div>
 );
}

// Hook pour gérer la confirmation de départ
export function useLeaveConfirmation(enabled: boolean) {
 const [isDirty, setIsDirty] = useState(false);

 useEffect(() => {
 if (!enabled) return;

 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 if (isDirty) {
 e.preventDefault();
 e.returnValue = "";
 }
 };

 window.addEventListener("beforeunload", handleBeforeUnload);
 return () => window.removeEventListener("beforeunload", handleBeforeUnload);
 }, [enabled, isDirty]);

 return { isDirty, setIsDirty };
}


