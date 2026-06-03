"use client";

import toast, { ToastOptions } from "react-hot-toast";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

const DEFAULTS: Record<ToastKind, ToastOptions> = {
  success: { duration: 3000 },
  error:   { duration: 5000 },
  info:    { duration: 3000 },
  warning: { duration: 4000 },
};

type ToastKind = "success" | "error" | "info" | "warning";

interface ToastApi {
  success: (message: string, options?: ToastOptions) => string;
  error:   (message: string, options?: ToastOptions) => string;
  info:    (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
}

function renderIcon(kind: ToastKind) {
  const className = "w-5 h-5";
  switch (kind) {
    case "success": return <CheckCircle2 className={className} />;
    case "error":   return <XCircle className={className} />;
    case "info":    return <Info className={className} />;
    case "warning": return <AlertTriangle className={className} />;
  }
}

export function useToast(): ToastApi {
  return {
    success: (message, options) =>
      toast.success(message, { ...DEFAULTS.success, icon: renderIcon("success"), ...options }),
    error: (message, options) =>
      toast.error(message, { ...DEFAULTS.error, icon: renderIcon("error"), ...options }),
    info: (message, options) =>
      toast(message, { ...DEFAULTS.info, icon: renderIcon("info"), ...options }),
    warning: (message, options) =>
      toast(message, { ...DEFAULTS.warning, icon: renderIcon("warning"), ...options }),
  };
}
