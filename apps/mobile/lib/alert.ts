import { Alert, Platform } from "react-native";

interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

/**
 * Cross-platform alert that works on web, iOS, and Android.
 * On web, uses window.confirm() for confirmation dialogs.
 * On native, uses React Native's Alert.alert().
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS === "web") {
    // On web, use window.confirm for confirmation dialogs
    if (buttons && buttons.length > 1) {
      // Find the confirm/action button (non-cancel)
      const cancelButton = buttons.find((b) => b.style === "cancel");
      const actionButton = buttons.find((b) => b.style !== "cancel");

      const confirmed = window.confirm(
        message ? `${title}\n\n${message}` : title
      );

      if (confirmed && actionButton?.onPress) {
        actionButton.onPress();
      } else if (!confirmed && cancelButton?.onPress) {
        cancelButton.onPress();
      }
    } else if (buttons && buttons.length === 1) {
      // Single button - just show alert and call callback
      window.alert(message ? `${title}\n\n${message}` : title);
      buttons[0].onPress?.();
    } else {
      // No buttons - just show alert
      window.alert(message ? `${title}\n\n${message}` : title);
    }
  } else {
    // On native, use React Native's Alert
    Alert.alert(title, message, buttons);
  }
}

/**
 * Show a simple error alert.
 */
export function showError(title: string, message?: string): void {
  showAlert(title, message, [{ text: "OK" }]);
}

/**
 * Show a confirmation dialog and return the user's choice.
 * Returns true if confirmed, false if cancelled.
 */
export function showConfirm(
  title: string,
  message?: string,
  options?: {
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  }
): Promise<boolean> {
  const {
    confirmText = "OK",
    cancelText = "Cancel",
    destructive = false,
  } = options || {};

  return new Promise((resolve) => {
    showAlert(title, message, [
      { text: cancelText, style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmText,
        style: destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}
