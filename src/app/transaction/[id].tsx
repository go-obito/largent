import { TransactionForm } from "@/components/transactions/transaction-form";
import { useLocalSearchParams } from "expo-router";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TransactionForm transactionId={id} />;
}