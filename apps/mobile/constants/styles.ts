/**
 * Global Styles - Reusable StyleSheet patterns
 * Import these instead of duplicating styles across components
 */

import { StyleSheet } from "react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "./theme";

/**
 * Layout styles - containers, scrollviews, centering
 */
export const layout = StyleSheet.create({
  // Main screen container
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },

  // Centered loading/empty state container
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ScrollView content wrapper
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  // Row with items spaced
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowSpaced: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Gap utilities
  gapXs: { gap: spacing.xs },
  gapSm: { gap: spacing.sm },
  gapMd: { gap: spacing.md },
  gapLg: { gap: spacing.lg },
});

/**
 * Header styles - page headers with back buttons
 */
export const header = StyleSheet.create({
  // Page header with padding
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  // Header with back button
  containerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },

  // Back/close button
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },

  // Placeholder for right side balance
  placeholder: {
    width: 40,
  },
});

/**
 * Typography styles
 */
export const typography = StyleSheet.create({
  // Large page title (3xl)
  pageTitle: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
  },

  // Screen title (xl)
  screenTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },

  // Section title (lg)
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },

  // Subtitle/description
  subtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },

  // Small subtitle
  subtitleSm: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },

  // Label text
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc400,
  },

  // Uppercase label
  labelUppercase: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.zinc500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Body text
  body: {
    fontSize: fontSize.base,
    color: colors.white,
  },

  // Small body text
  bodySm: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },

  // Extra small text
  caption: {
    fontSize: fontSize.xs,
    color: colors.zinc500,
  },

  // Centered text
  centered: {
    textAlign: "center",
  },
});

/**
 * Card styles
 */
export const card = StyleSheet.create({
  // Standard card
  base: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },

  // Large card (xl radius, lg padding)
  large: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },

  // Selectable card (for options)
  selectable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.md,
  },

  // Selected state
  selected: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha10,
  },

  // Info/highlight card
  info: {
    flexDirection: "row",
    backgroundColor: colors.emeraldAlpha10,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.emerald500,
    gap: spacing.md,
  },

  // Warning card
  warning: {
    flexDirection: "row",
    backgroundColor: colors.amber500 + "10",
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.amber500,
    gap: spacing.md,
  },
});

/**
 * Button styles
 */
export const button = StyleSheet.create({
  // Primary action button
  primary: {
    backgroundColor: colors.emerald500,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },

  // Secondary button
  secondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.zinc800,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },

  secondaryText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.emerald500,
  },

  // Ghost/transparent button
  ghost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },

  ghostText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc400,
  },

  // Danger button
  danger: {
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  dangerText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },

  // Disabled state
  disabled: {
    backgroundColor: colors.zinc800,
    opacity: 0.6,
  },

  disabledText: {
    color: colors.zinc500,
  },
});

/**
 * Input styles
 */
export const input = StyleSheet.create({
  // Standard input
  base: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.white,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },

  // Focused state
  focused: {
    borderColor: colors.emerald500,
  },

  // Error state
  error: {
    borderColor: colors.error,
  },

  // Disabled state
  disabled: {
    opacity: 0.6,
  },

  // Input label
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc400,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },

  // Input group container
  group: {
    marginBottom: spacing.md,
  },
});

/**
 * Icon container styles
 */
export const iconContainer = StyleSheet.create({
  // Small icon container (32x32)
  sm: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Medium icon container (40x40)
  md: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.emeraldAlpha20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Large icon container (48x48)
  lg: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.emeraldAlpha10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Circular variant
  circular: {
    borderRadius: radius.full,
  },

  // Muted background
  muted: {
    backgroundColor: colors.zinc800,
  },
});

/**
 * Menu/list item styles
 */
export const listItem = StyleSheet.create({
  // Standard list item
  base: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },

  // With bottom border
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.zinc800,
  },

  // Pressable variant
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.zinc900,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },

  // Content wrapper
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },

  // Title text
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },

  // Subtitle text
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginTop: 2,
  },
});

/**
 * Section styles
 */
export const section = StyleSheet.create({
  // Section container
  container: {
    marginBottom: spacing.lg,
  },

  // Section with top margin
  containerSpaced: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  // Section header
  header: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },

  // Section title
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.zinc500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

/**
 * Modal styles
 */
export const modal = StyleSheet.create({
  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },

  // Modal content container
  content: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },

  // Modal title
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  // Full screen modal content
  contentFullWidth: {
    width: "100%",
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
  },
});

/**
 * Floating action button
 */
export const fab = StyleSheet.create({
  // Standard FAB
  base: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Mini FAB
  mini: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

/**
 * Auth screen styles
 */
export const auth = StyleSheet.create({
  // Centered scroll content
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  // Auth header section
  header: {
    marginBottom: spacing.xl,
  },

  // Auth title
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },

  // Auth subtitle
  subtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
  },

  // Form container
  form: {
    marginBottom: spacing.xl,
  },

  // Error container
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  // Error text
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
  },

  // Footer row
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  // Footer text
  footerText: {
    fontSize: fontSize.sm,
    color: colors.zinc400,
  },

  // Link text
  linkText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.emerald500,
  },
});

/**
 * Selection/wizard styles (onboarding, settings selection)
 */
export const selection = StyleSheet.create({
  // Progress indicator container
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },

  // Progress dot
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.zinc800,
  },

  // Active progress dot
  progressDotActive: {
    backgroundColor: colors.emerald500,
  },

  // Step content container
  stepContent: {
    flex: 1,
    justifyContent: "center",
  },

  // Step title
  stepTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },

  // Step subtitle
  stepSubtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    marginBottom: spacing.xl,
  },

  // Options list
  optionsList: {
    gap: spacing.md,
  },

  // Option card
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.zinc900,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.md,
  },

  // Option card selected
  optionCardSelected: {
    borderColor: colors.emerald500,
    backgroundColor: colors.emeraldAlpha10,
  },

  // Option text container
  optionTextContainer: {
    flex: 1,
  },

  // Option label
  optionLabel: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },

  // Option label selected
  optionLabelSelected: {
    color: colors.emerald500,
  },

  // Option description
  optionDescription: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
    marginTop: 2,
  },

  // Check circle (selection indicator)
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
  },

  // Navigation row
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },

  // Back button
  backButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.zinc900,
    alignItems: "center",
    justifyContent: "center",
  },

  // Back button placeholder
  backButtonPlaceholder: {
    width: 48,
  },

  // Next/Continue button
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emerald500,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },

  // Next button disabled
  nextButtonDisabled: {
    backgroundColor: colors.zinc800,
  },

  // Next button text
  nextButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.black,
  },

  // Summary card (completion)
  summaryCard: {
    backgroundColor: colors.zinc900,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.zinc800,
    gap: spacing.md,
  },

  // Summary item
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Summary label
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.zinc500,
  },

  // Summary value
  summaryValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
});

/**
 * Success/completion styles
 */
export const success = StyleSheet.create({
  // Large success icon container
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.emerald500,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },

  // Success title
  title: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: "center",
    marginBottom: spacing.sm,
  },

  // Success subtitle
  subtitle: {
    fontSize: fontSize.base,
    color: colors.zinc400,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});

/**
 * Spacing utilities
 */
export const spacing_utils = StyleSheet.create({
  // Margin bottom
  mbXs: { marginBottom: spacing.xs },
  mbSm: { marginBottom: spacing.sm },
  mbMd: { marginBottom: spacing.md },
  mbLg: { marginBottom: spacing.lg },
  mbXl: { marginBottom: spacing.xl },

  // Margin top
  mtXs: { marginTop: spacing.xs },
  mtSm: { marginTop: spacing.sm },
  mtMd: { marginTop: spacing.md },
  mtLg: { marginTop: spacing.lg },
  mtXl: { marginTop: spacing.xl },

  // Padding
  pXs: { padding: spacing.xs },
  pSm: { padding: spacing.sm },
  pMd: { padding: spacing.md },
  pLg: { padding: spacing.lg },

  // Padding horizontal
  phMd: { paddingHorizontal: spacing.md },
  phLg: { paddingHorizontal: spacing.lg },
});
