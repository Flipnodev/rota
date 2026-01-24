import * as React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onPress?: () => void;
}

/**
 * Shared Button component props and logic.
 * Actual rendering is handled by platform-specific implementations.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onPress,
}: ButtonProps) {
  // This is a placeholder - actual implementation will differ between web and mobile
  // For web: use button element
  // For mobile: use Pressable from react-native
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  );
}
