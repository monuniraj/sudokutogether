import React from "react";
import { Ghost } from "lucide-react";

export interface IncognitoIconProps {
  className?: string;
  strokeWidth?: number;
}

/**
 * Rebranded Ghost Mode icon component leveraging Lucide Ghost vector.
 */
export const IncognitoIcon: React.FC<IncognitoIconProps> = ({
  className = "w-4 h-4",
  strokeWidth = 2
}) => {
  return <Ghost className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
};
