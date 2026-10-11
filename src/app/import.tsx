import { categories } from "@/data/categories";
import { formatMoney } from "@/lib/currency";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import { useAuth } from "@clerk/expo";
import Constants from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ColumnMapping = { date: number | null; description: number | null; amount: number | null };
type ImportedRow = { date: string; description: string; amount: number; type: "income" | "expense" };
type ParseHeadersResult = { headers: string[]; rowCount: number; preview: string[][] };
type ParseRowsResult = { rows: ImportedRow[] };
type ErrorResult = { error?: string };

function importApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configuredUrl) return `${configuredUrl}/api/import-csv`;
  if (Platform.OS === "web") return "/api/import-csv";

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) throw new Error("CSV import is unavailable. Configure EXPO_PUBLIC_API_URL for this build.");
  return `http://${hostUri}/api/import-csv`;
}

export default function ImportScreen() {
  const { getToken } = useAuth();
  const transactions = useTransactionStore((state) => state.transactions);
  const addTransaction = useTransactionStore((state) => state.add);
  const [fileText, setFileText] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [filePreview, setFilePreview] = useState<string[][]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping>({ date: null, description: null, amount: null });
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [categoryByRow, setCategoryByRow] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<{ imported: number; skipped: number } | null>(null);

  async function parseOnServer(selectedMapping?: ColumnMapping) {
    const token = await getToken();
    if (!token) throw new Error("Your session has expired. Sign in and try again.");
    const requestHeaders: Record<string, string> = { authorization: `Bearer ${token}`, "content-type": "text/csv" };
    if (selectedMapping) {
      requestHeaders["x-date-column"] = String(selectedMapping.date);
      requestHeaders["x-description-column"] = String(selectedMapping.description);
      requestHeaders["x-amount-column"] = String(selectedMapping.amount);
    }
    const response = await fetch(importApiUrl(), { method: "POST", headers: requestHeaders, body: fileText });
    const result = await response.json() as ParseHeadersResult & ParseRowsResult & ErrorResult;
    if (!response.ok) throw new Error(result.error ?? "The CSV could not be processed.");
    return result;
  }

  async function chooseFile() {
    setError("");
    setSummary(null);
    try {
      const selection = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/csv", "application/vnd.ms-excel"],
        copyToCacheDirectory: true,
      });
      if (selection.canceled) return;
      const file = selection.assets[0];
      if (!file.name.toLowerCase().endsWith(".csv") && !file.mimeType?.includes("csv")) {
        throw new Error("Choose a CSV file.");
      }
      if (file.size && file.size > 2 * 1024 * 1024) throw new Error("The CSV file exceeds the 2 MB limit.");
      setBusy(true);
      const text = await (await fetch(file.uri)).text();
      if (new TextEncoder().encode(text).byteLength > 2 * 1024 * 1024) throw new Error("The CSV file exceeds the 2 MB limit.");
      setFileText(text);
      setFileName(file.name);
      setRows([]);
      setMapping({ date: null, description: null, amount: null });
      const token = await getToken();
      if (!token) throw new Error("Your session has expired. Sign in and try again.");
      const response = await fetch(importApiUrl(), {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "text/csv" },
        body: text,
      });
      const result = await response.json() as ParseHeadersResult & ErrorResult;
      if (!response.ok) throw new Error(result.error ?? "The CSV could not be processed.");
      setHeaders(result.headers);
      setFilePreview(result.preview);
      setRowCount(result.rowCount);
    } catch (pickError) {
      setError(pickError instanceof Error ? pickError.message : "The file could not be read.");
    } finally {
      setBusy(false);
    }
  }

  async function previewRows() {
    setError("");
    setBusy(true);
    try {
      const result = await parseOnServer(mapping) as ParseRowsResult;
      setRows(result.rows);
      setCategoryByRow({});
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "The CSV could not be processed.");
    } finally {
      setBusy(false);
    }
  }

  function rowFingerprint(row: ImportedRow) {
    return [row.date.slice(0, 10), row.amount, row.type, row.description.trim()].join("\u0000");
  }

  function isDuplicate(row: ImportedRow, index: number) {
    const fingerprint = rowFingerprint(row);
    return transactions.some((transaction) => rowFingerprint({
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.note,
    }) === fingerprint) || rows.slice(0, index).some((previous) => rowFingerprint(previous) === fingerprint);
  }

  function saveRows() {
    if (rows.some((row, index) => !isDuplicate(row, index) && !categoryByRow[index])) {
      setError("Assign a category to each new transaction before importing.");
      return;
    }
    const duplicates = rows.filter((row, index) => isDuplicate(row, index)).length;
    let imported = 0;
    rows.forEach((row, index) => {
      if (isDuplicate(row, index)) return;
      addTransaction({
        type: row.type,
        amount: row.amount,
        categoryId: categoryByRow[index],
        date: row.date,
        note: row.description,
        source: "csv_import",
      });
      imported += 1;
    });
    setSummary({ imported, skipped: duplicates });
    setRows([]);
    setError("");
  }

  function chooseColumn(kind: keyof ColumnMapping, index: number) {
    setMapping((current) => ({ ...current, [kind]: index }));
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Import bank statement</Text>
      <Text style={styles.description}>Select a CSV statement, map its columns, then review each transaction.</Text>
      <Pressable style={styles.secondaryButton} onPress={() => void chooseFile()} disabled={busy} accessibilityRole="button">
        <Text style={styles.secondaryLabel}>{busy ? "Processing..." : fileName || "Choose CSV file"}</Text>
      </Pressable>
      {headers.length > 0 ? <>
        <Text style={styles.heading}>Map columns</Text>
        {(["date", "description", "amount"] as const).map((kind) => (
          <View key={kind} style={styles.mappingRow}>
            <Text style={styles.mappingLabel}>{kind === "description" ? "Description" : kind[0].toUpperCase() + kind.slice(1)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columnChoices}>
              {headers.map((header, index) => (
                <Pressable key={`${kind}-${index}`} onPress={() => chooseColumn(kind, index)} style={[styles.columnChoice, mapping[kind] === index && styles.selected]}>
                  <Text style={[styles.columnLabel, mapping[kind] === index && styles.selectedLabel]}>{index + 1}. {header || `Column ${index + 1}`}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ))}
        <Text style={styles.helper}>{rowCount} rows detected. Preview shows up to 5 rows.</Text>
        <View style={styles.preview}>
          <Text style={styles.previewHeader}>{headers.join("  ·  ")}</Text>
          {filePreview.map((row, rowIndex) => <Text key={`preview-${rowIndex}`} style={styles.previewRow} numberOfLines={2}>{row.join("  ·  ")}</Text>)}
        </View>
        {rows.length === 0 ? (
          <Pressable style={[styles.primaryButton, (busy || Object.values(mapping).some((value) => value === null)) && styles.disabled]} onPress={() => void previewRows()} disabled={busy || Object.values(mapping).some((value) => value === null)} accessibilityRole="button">
            <Text style={styles.primaryLabel}>Preview {rowCount} rows</Text>
          </Pressable>
        ) : <>
          <Text style={styles.heading}>Review transactions</Text>
          {rows.map((row, index) => {
            const duplicate = isDuplicate(row, index);
            const options = categories.filter((category) => category.type === row.type);
            return (
              <View key={`${row.date}-${index}`} style={styles.rowCard}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowDate}>{new Date(row.date).toLocaleDateString()}</Text>
                  <Text style={[styles.rowAmount, row.type === "income" ? styles.income : styles.expense]}>{formatMoney(row.amount, { sign: row.type })}</Text>
                </View>
                <Text style={styles.rowDescription}>{row.description}</Text>
                {duplicate ? <Text style={styles.duplicate}>Duplicate, will be skipped</Text> : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columnChoices}>
                    {options.map((category) => (
                      <Pressable key={category.id} onPress={() => setCategoryByRow((current) => ({ ...current, [index]: category.id }))} style={[styles.columnChoice, categoryByRow[index] === category.id && styles.selected]}>
                        <Text style={[styles.columnLabel, categoryByRow[index] === category.id && styles.selectedLabel]}>{category.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            );
          })}
          <Pressable style={styles.primaryButton} onPress={saveRows} accessibilityRole="button"><Text style={styles.primaryLabel}>Import transactions</Text></Pressable>
        </>}
      </> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {summary ? <View style={styles.result}>
        <Text style={styles.resultTitle}>Import complete</Text>
        <Text style={styles.resultText}>{summary.imported} imported · {summary.skipped} skipped</Text>
      </View> : null}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing[5], paddingBottom: spacing[8], gap: spacing[3] },
  title: { ...typography.title1, color: colors.neutral[900] },
  description: { ...typography.body, color: colors.neutral[600] },
  heading: { ...typography.title3, color: colors.neutral[900], marginTop: spacing[3] },
  secondaryButton: { minHeight: 52, borderRadius: radii.md, borderWidth: 1, borderColor: colors.neutral[200], backgroundColor: colors.neutral.surface, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing[4] },
  secondaryLabel: { ...typography.bodyMedium, color: colors.neutral[900] },
  mappingRow: { gap: spacing[1] },
  mappingLabel: { ...typography.caption, color: colors.neutral[700] },
  columnChoices: { flexDirection: "row", gap: spacing[2], paddingVertical: spacing[1] },
  columnChoice: { minHeight: 36, justifyContent: "center", paddingHorizontal: spacing[3], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.sm, backgroundColor: colors.neutral.surface },
  selected: { backgroundColor: colors.primary[50], borderColor: colors.primary[500] },
  columnLabel: { ...typography.small, color: colors.neutral[700] },
  selectedLabel: { color: colors.primary[600] },
  helper: { ...typography.caption, color: colors.neutral[600] },
  preview: { backgroundColor: colors.neutral.surface, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, padding: spacing[3], gap: spacing[2] },
  previewHeader: { ...typography.small, color: colors.neutral[700] },
  previewRow: { ...typography.small, color: colors.neutral[600] },
  primaryButton: { minHeight: 52, borderRadius: radii.md, backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center", paddingHorizontal: spacing[4] },
  disabled: { backgroundColor: colors.primary[300] },
  primaryLabel: { ...typography.bodyMedium, color: colors.neutral.surface },
  rowCard: { gap: spacing[2], padding: spacing[3], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, backgroundColor: colors.neutral.surface },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacing[2] },
  rowDate: { ...typography.caption, color: colors.neutral[600] },
  rowAmount: { ...typography.bodyMedium, fontVariant: ["tabular-nums"] },
  rowDescription: { ...typography.bodyMedium, color: colors.neutral[900] },
  income: { color: colors.semantic.income },
  expense: { color: colors.neutral[900] },
  duplicate: { ...typography.small, color: colors.semantic.warning },
  error: { ...typography.caption, color: colors.semantic.expense },
  result: { gap: spacing[1], padding: spacing[4], borderRadius: radii.md, backgroundColor: colors.semantic.incomeTint },
  resultTitle: { ...typography.bodyMedium, color: colors.semantic.income },
  resultText: { ...typography.caption, color: colors.neutral[700] },
});