import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-2xl lg:text-3xl font-bold mb-1">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">{description}</p>
      )}
      {children}
    </div>
  );
}

interface StatusBadgeProps {
  variant: "success" | "warning" | "error" | "info" | "pending";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const variants: Record<string, string> = {
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    error: "bg-destructive/20 text-destructive border-destructive/30",
    info: "bg-info/20 text-info border-info/30",
    pending: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <span className="group relative inline-flex ml-1 cursor-help">
      <span className="w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] flex items-center justify-center font-bold">?</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-lg glass-strong text-foreground w-56 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
      </span>
    </span>
  );
}

interface StepIndicatorProps {
  steps: string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors",
                i < current
                  ? "bg-success text-success-foreground border-success"
                  : i === current
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border",
              )}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium whitespace-nowrap",
                i <= current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("flex-shrink-0 w-8 h-px", i < current ? "bg-success" : "bg-border")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
