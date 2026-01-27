import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import { colors } from "@/constants/theme";
import { ExercisesList } from "@/components/exercises-list";

export default function ExercisesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ExercisesList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
});
