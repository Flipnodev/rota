import { SafeAreaView } from "react-native-safe-area-context";

import { layout } from "@/constants/styles";
import { ExercisesList } from "@/components/exercises-list";

export default function ExercisesScreen() {
  return (
    <SafeAreaView style={layout.container} edges={["top"]}>
      <ExercisesList />
    </SafeAreaView>
  );
}
