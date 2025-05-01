// components/ui/ActionHeader.tsx

"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

// Define the valid variant types that match the Button component
type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "subtle";

export interface ActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  variant?: ButtonVariant;
  className?: string;
  hideTextOnMobile?: boolean;
  disabled?: boolean;
}

export interface ActionHeaderProps {
  leftActions: ActionButtonProps[];
  rightActions: ActionButtonProps[];
  className?: string;
}

export function ActionHeader({ leftActions, rightActions, className = "p-4" }: ActionHeaderProps) {
  return (
    <div className={`flex justify-between items-center flex-wrap gap-y-2 ${className}`}>
      {/* Left side buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {leftActions.map((action, index) => (
          <Button
            key={`left-${index}`}
            onClick={action.onClick}
            variant={action.variant || "ghost"}
            size="sm"
            className={action.className || "flex items-center gap-1.5"}
            disabled={action.disabled}
          >
            {action.icon}
            <span className={action.hideTextOnMobile ? "hidden xs:inline" : ""}>
              {action.label}
            </span>
          </Button>
        ))}
      </div>

      {/* Right side buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {rightActions.map((action, index) => (
          <Button
            key={`right-${index}`}
            onClick={action.onClick}
            variant={action.variant || "ghost"}
            size="sm"
            className={action.className || "flex items-center gap-1.5"}
            disabled={action.disabled}
          >
            {action.icon}
            <span className={action.hideTextOnMobile ? "hidden xs:inline" : ""}>
              {action.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}