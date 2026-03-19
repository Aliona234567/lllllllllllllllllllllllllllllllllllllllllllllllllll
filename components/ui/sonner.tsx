"use client";

import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      icons={{
        success: <CheckCircle className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <AlertTriangle className="h-4 w-4" />,
        error: <XCircle className="h-4 w-4" />,
        loading: <Loader2 className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        duration: 5000,
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-green-500/10 group-[.toaster]:border-green-500/20 group-[.toaster]:text-green-600 dark:group-[.toaster]:text-green-400",
          error: "group-[.toaster]:bg-destructive/10 group-[.toaster]:border-destructive/20 group-[.toaster]:text-destructive dark:group-[.toaster]:text-destructive",
          warning: "group-[.toaster]:bg-yellow-500/10 group-[.toaster]:border-yellow-500/20 group-[.toaster]:text-yellow-600 dark:group-[.toaster]:text-yellow-400",
          info: "group-[.toaster]:bg-blue-500/10 group-[.toaster]:border-blue-500/20 group-[.toaster]:text-blue-600 dark:group-[.toaster]:text-blue-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };