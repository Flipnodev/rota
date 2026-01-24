import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

export default function ExerciseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.black },
        presentation: "modal",
      }}
    />
  );
}
