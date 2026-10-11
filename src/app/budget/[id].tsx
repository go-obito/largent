import { BudgetForm } from "@/components/budgets/budget-form";
import { useLocalSearchParams } from "expo-router";

export default function EditBudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BudgetForm budgetId={id} />;
}