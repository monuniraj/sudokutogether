import React from "react";
import { ClappingHands, ClappingHandsProps } from "./ClappingHands";

export type ApplauseBadgeProps = ClappingHandsProps;

/**
 * ApplauseBadge is replaced with the clean, minimalist ClappingHands component.
 * Retained for backwards compatibility across any legacy references.
 */
export const ApplauseBadge: React.FC<ApplauseBadgeProps> = (props) => {
  return <ClappingHands {...props} />;
};
