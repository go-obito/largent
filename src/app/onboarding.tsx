import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, fontFamily, typography } from "@/theme";

type OnboardingSlide = {
  eyebrow: string;
  title: string;
  description: string;
};

const slides: OnboardingSlide[] = [
  {
    eyebrow: "KNOW YOUR MONEY",
    title: "Your money,\nin perspective.",
    description:
      "See what comes in, what goes out, and where your money goes — all in one clear view.",
  },
  {
    eyebrow: "SPEND WITH INTENTION",
    title: "Make every\ncedi count.",
    description:
      "Set simple budgets, follow your progress, and build habits that move you closer to your goals.",
  },
  {
    eyebrow: "SEE THE BIGGER PICTURE",
    title: "Small insights.\nBetter decisions.",
    description:
      "Import bank statements and turn your activity into useful reports, without the spreadsheet stress.",
  },
];

function BrandMark() {
  return (
    <View style={styles.brand}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.brandIcon}
        resizeMode="contain"
        accessibilityLabel="Largent logo"
      />
      <Text style={styles.brandName}>largent</Text>
    </View>
  );
}

function BalanceIllustration() {
  return (
    <View style={styles.artboard}>
      <View style={[styles.orbit, styles.orbitOne]} />
      <View style={[styles.orbit, styles.orbitTwo]} />
      <View style={styles.balanceCard}>
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.cardLabel}>TOTAL BALANCE</Text>
            <Text style={styles.balanceAmount}>GH₵ 12,840.50</Text>
          </View>
          <View style={styles.balanceIcon}>
            <Text style={styles.balanceIconText}>↗</Text>
          </View>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.balanceMetrics}>
          <View style={styles.metric}>
            <View style={styles.metricHeading}>
              <View style={[styles.metricDot, { backgroundColor: colors.brand.green }]} />
              <Text style={styles.metricLabel}>Income</Text>
            </View>
            <Text style={styles.metricAmount}>GH₵ 4,200</Text>
            <Text style={styles.metricChange}>↗ 12.8%</Text>
          </View>
          <View style={styles.metric}>
            <View style={styles.metricHeading}>
              <View style={[styles.metricDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.metricLabel}>Expenses</Text>
            </View>
            <Text style={styles.metricAmount}>GH₵ 1,380</Text>
            <Text style={styles.metricChangeMuted}>This month</Text>
          </View>
        </View>
        <View style={styles.chart}>
          {[32, 47, 38, 60, 50, 76, 58, 88, 69, 100, 79, 91].map((height, index) => (
            <View key={index} style={styles.chartColumn}>
              <View
                style={[
                  styles.chartBar,
                  { height: `${height}%` },
                  index === 9 && styles.chartBarActive,
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>WEEK 1</Text>
          <Text style={styles.chartLabel}>WEEK 2</Text>
          <Text style={styles.chartLabel}>WEEK 3</Text>
          <Text style={styles.chartLabel}>WEEK 4</Text>
        </View>
      </View>
      <View style={styles.floatingPill}>
        <View style={styles.floatingPillIcon}>
          <Text style={styles.floatingPillIconText}>↗</Text>
        </View>
        <View>
          <Text style={styles.floatingTitle}>You're on track</Text>
          <Text style={styles.floatingCaption}>Spending is down 8%</Text>
        </View>
      </View>
    </View>
  );
}

function BudgetIllustration() {
  return (
    <View style={styles.artboard}>
      <View style={[styles.orbit, styles.orbitOne]} />
      <View style={[styles.orbit, styles.orbitTwo]} />
      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <View>
            <Text style={styles.cardLabel}>MONTHLY BUDGET</Text>
            <Text style={styles.budgetAmount}>GH₵ 2,500</Text>
          </View>
          <View style={styles.budgetBadge}>
            <Text style={styles.budgetBadgeText}>68% used</Text>
          </View>
        </View>
        <View style={styles.budgetProgressTrack}>
          <View style={styles.budgetProgressFill} />
        </View>
        <Text style={styles.budgetRemaining}>GH₵ 800 left to spend</Text>
        <View style={styles.budgetDivider} />
        {[
          { icon: "⌂", name: "Housing", amount: "GH₵ 900", width: "74%", color: colors.brand.forest },
          { icon: "↗", name: "Transport", amount: "GH₵ 320", width: "54%", color: "#16A34A" },
          { icon: "◇", name: "Food & drink", amount: "GH₵ 480", width: "82%", color: "#F59E0B" },
        ].map((item) => (
          <View key={item.name} style={styles.budgetRow}>
            <View style={styles.budgetRowTop}>
              <View style={styles.budgetRowName}>
                <View style={styles.budgetCategoryIcon}>
                  <Text style={styles.budgetCategoryGlyph}>{item.icon}</Text>
                </View>
                <Text style={styles.budgetCategory}>{item.name}</Text>
              </View>
              <Text style={styles.budgetCategoryAmount}>{item.amount}</Text>
            </View>
            <View style={styles.budgetLineTrack}>
              <View
                style={[
                  styles.budgetLineFill,
                  { width: item.width as `${number}%`, backgroundColor: item.color },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.budgetFloating}>
        <Text style={styles.budgetFloatingIcon}>✓</Text>
        <View>
          <Text style={styles.floatingTitle}>Looking good</Text>
          <Text style={styles.floatingCaption}>You're within your limits</Text>
        </View>
      </View>
    </View>
  );
}

function ReportsIllustration() {
  return (
    <View style={styles.artboard}>
      <View style={[styles.orbit, styles.orbitOne]} />
      <View style={[styles.orbit, styles.orbitTwo]} />
      <View style={styles.reportCard}>
        <View style={styles.reportTop}>
          <View>
            <Text style={styles.cardLabel}>SPENDING REPORT</Text>
            <Text style={styles.reportTitle}>A clearer picture</Text>
          </View>
          <View style={styles.reportPeriod}>
            <Text style={styles.reportPeriodText}>This month⌄</Text>
          </View>
        </View>
        <View style={styles.reportSummary}>
          <View style={styles.reportSummaryItem}>
            <Text style={styles.reportSummaryLabel}>Income</Text>
            <Text style={styles.reportIncome}>GH₵ 4,200</Text>
          </View>
          <View style={styles.reportSummaryItem}>
            <Text style={styles.reportSummaryLabel}>Spent</Text>
            <Text style={styles.reportSpent}>GH₵ 1,380</Text>
          </View>
        </View>
        <View style={styles.reportChart}>
          <View style={styles.reportYAxis}>
            <View style={styles.reportGridLine} />
            <View style={styles.reportGridLine} />
            <View style={styles.reportGridLine} />
          </View>
          <View style={styles.reportBars}>
            {[
              [32, 46],
              [50, 36],
              [42, 61],
              [66, 43],
              [53, 76],
              [80, 56],
              [62, 90],
            ].map(([income, expense], index) => (
              <View key={index} style={styles.reportBarGroup}>
                <View style={[styles.reportBar, { height: `${income}%` }]} />
                <View style={[styles.reportBarExpense, { height: `${expense}%` }]} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.reportLegend}>
          <View style={styles.legendItem}>
            <View style={styles.legendIncome} />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendExpense} />
            <Text style={styles.legendText}>Expenses</Text>
          </View>
        </View>
      </View>
      <View style={styles.importFloating}>
        <View style={styles.importIcon}>
          <Text style={styles.importIconText}>↓</Text>
        </View>
        <View>
          <Text style={styles.floatingTitle}>Bank statement</Text>
          <Text style={styles.floatingCaption}>Import complete · 126 entries</Text>
        </View>
        <Text style={styles.importCheck}>✓</Text>
      </View>
    </View>
  );
}

function SlideIllustration({ index }: { index: number }) {
  if (index === 0) return <BalanceIllustration />;
  if (index === 1) return <BudgetIllustration />;
  return <ReportsIllustration />;
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const { height } = useWindowDimensions();
  const activeSlide = slides[activeIndex];
  const compact = height < 760;

  const finishOnboarding = () => {
    // The sign-up route is introduced with the authentication feature.
    // Keep this flow usable until that route exists.
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <BrandMark />
          <Pressable
            onPress={finishOnboarding}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack} accessibilityLabel={`Step ${activeIndex + 1} of 3`}>
          {slides.map((slide, index) => (
            <View
              key={slide.eyebrow}
              style={[
                styles.progressSegment,
                index <= activeIndex && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.illustrationWrap, compact && styles.illustrationWrapCompact]}>
            <SlideIllustration index={activeIndex} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>{activeSlide.eyebrow}</Text>
            <Text style={styles.title}>{activeSlide.title}</Text>
            <Text style={styles.description}>{activeSlide.description}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerControls}>
            <Pressable
              onPress={() => setActiveIndex((current) => Math.max(0, current - 1))}
              disabled={activeIndex === 0}
              style={({ pressed }) => [
                styles.backButton,
                activeIndex === 0 && styles.backButtonHidden,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Previous onboarding screen"
            >
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (activeIndex < slides.length - 1) {
                  setActiveIndex((current) => current + 1);
                } else {
                  finishOnboarding();
                }
              }}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                {activeIndex === slides.length - 1 ? "Get started" : "Continue"}
              </Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </Pressable>
          </View>
          <Text style={styles.footerNote}>
            {activeIndex === slides.length - 1
              ? "A little more clarity, every day."
              : "A calmer way to manage your money."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: colors.neutral.background,
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
  },
  brandName: {
    color: colors.brand.charcoal,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    letterSpacing: -0.7,
  },
  skip: {
    ...typography.bodyMedium,
    color: colors.neutral.textSecondary,
    paddingVertical: 8,
  },
  progressTrack: {
    flexDirection: "row",
    gap: 6,
    marginTop: 15,
    marginBottom: 4,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 8,
    backgroundColor: colors.neutral.border,
  },
  progressSegmentActive: {
    backgroundColor: colors.brand.forest,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 10,
  },
  illustrationWrap: {
    height: 350,
    justifyContent: "center",
    marginHorizontal: -10,
  },
  illustrationWrapCompact: {
    height: 300,
  },
  artboard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  orbit: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7F0E2",
  },
  orbitOne: {
    width: 292,
    height: 292,
    backgroundColor: "#F5FBF7",
  },
  orbitTwo: {
    width: 236,
    height: 236,
    borderColor: "#E6F5EC",
  },
  balanceCard: {
    width: "90%",
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: colors.neutral.background,
    padding: 19,
    shadowColor: "#0B1320",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
    borderWidth: 1,
    borderColor: "#F0F3F1",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLabel: {
    fontFamily: fontFamily.semiBold,
    color: colors.neutral.textSecondary,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  balanceAmount: {
    marginTop: 8,
    color: colors.brand.charcoal,
    fontFamily: fontFamily.bold,
    fontSize: 25,
    letterSpacing: -0.8,
  },
  balanceIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: colors.brand.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceIconText: {
    color: colors.brand.forest,
    fontFamily: fontFamily.bold,
    fontSize: 19,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: 17,
  },
  balanceMetrics: {
    flexDirection: "row",
    gap: 20,
  },
  metric: {
    flex: 1,
  },
  metricHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },
  metricLabel: {
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 11,
  },
  metricAmount: {
    marginTop: 6,
    color: colors.neutral.textPrimary,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  metricChange: {
    marginTop: 4,
    color: colors.brand.green,
    fontFamily: fontFamily.medium,
    fontSize: 10,
  },
  metricChangeMuted: {
    marginTop: 4,
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 10,
  },
  chart: {
    height: 55,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 7,
    marginTop: 18,
  },
  chartColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "100%",
    backgroundColor: "#C7EBD6",
    borderRadius: 4,
  },
  chartBarActive: {
    backgroundColor: colors.brand.forest,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chartLabel: {
    color: "#94A3B8",
    fontFamily: fontFamily.medium,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  floatingPill: {
    position: "absolute",
    right: 2,
    bottom: 31,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: colors.neutral.background,
    shadowColor: "#0B1320",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  floatingPillIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.brand.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingPillIconText: {
    color: colors.brand.forest,
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  floatingTitle: {
    color: colors.brand.charcoal,
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
  },
  floatingCaption: {
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 9,
    marginTop: 3,
  },
  budgetCard: {
    width: "90%",
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: colors.neutral.background,
    padding: 19,
    shadowColor: "#0B1320",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
    borderWidth: 1,
    borderColor: "#F0F3F1",
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  budgetAmount: {
    color: colors.brand.charcoal,
    fontFamily: fontFamily.bold,
    fontSize: 25,
    letterSpacing: -0.8,
    marginTop: 8,
  },
  budgetBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.brand.lightGreen,
  },
  budgetBadgeText: {
    color: colors.brand.forest,
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
  },
  budgetProgressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#E8F5ED",
    overflow: "hidden",
    marginTop: 18,
  },
  budgetProgressFill: {
    width: "68%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: colors.brand.forest,
  },
  budgetRemaining: {
    marginTop: 8,
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
  budgetDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginVertical: 16,
  },
  budgetRow: {
    marginBottom: 15,
  },
  budgetRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetRowName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  budgetCategoryIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: colors.neutral.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetCategoryGlyph: {
    color: colors.brand.forest,
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
  },
  budgetCategory: {
    color: colors.neutral.textPrimary,
    fontFamily: fontFamily.medium,
    fontSize: 11,
  },
  budgetCategoryAmount: {
    color: colors.neutral.textPrimary,
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
  },
  budgetLineTrack: {
    height: 4,
    borderRadius: 5,
    backgroundColor: colors.neutral.surface,
    overflow: "hidden",
  },
  budgetLineFill: {
    height: "100%",
    borderRadius: 5,
  },
  budgetFloating: {
    position: "absolute",
    right: 1,
    bottom: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: colors.neutral.background,
    shadowColor: "#0B1320",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  budgetFloatingIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    color: colors.neutral.background,
    backgroundColor: colors.brand.green,
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  reportCard: {
    width: "90%",
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: colors.neutral.background,
    padding: 19,
    shadowColor: "#0B1320",
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
    borderWidth: 1,
    borderColor: "#F0F3F1",
  },
  reportTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportTitle: {
    marginTop: 7,
    color: colors.brand.charcoal,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
  reportPeriod: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
  },
  reportPeriodText: {
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 9,
  },
  reportSummary: {
    flexDirection: "row",
    gap: 28,
    marginTop: 22,
  },
  reportSummaryItem: {
    flex: 1,
  },
  reportSummaryLabel: {
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 11,
  },
  reportIncome: {
    marginTop: 5,
    color: colors.brand.forest,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  reportSpent: {
    marginTop: 5,
    color: colors.neutral.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  reportChart: {
    height: 100,
    marginTop: 22,
    position: "relative",
    justifyContent: "flex-end",
  },
  reportYAxis: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  reportGridLine: {
    height: 1,
    width: "100%",
    backgroundColor: "#EEF2F0",
  },
  reportBars: {
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingHorizontal: 7,
  },
  reportBarGroup: {
    height: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    width: 18,
  },
  reportBar: {
    width: 7,
    backgroundColor: colors.brand.forest,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  reportBarExpense: {
    width: 7,
    backgroundColor: "#BFE8D0",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  reportLegend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendIncome: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: colors.brand.forest,
  },
  legendExpense: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: "#BFE8D0",
  },
  legendText: {
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 10,
  },
  importFloating: {
    position: "absolute",
    right: 1,
    bottom: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: colors.neutral.background,
    shadowColor: "#0B1320",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  importIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.brand.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  importIconText: {
    color: colors.brand.forest,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  importCheck: {
    color: colors.brand.green,
    fontFamily: fontFamily.bold,
    fontSize: 14,
    marginLeft: 3,
  },
  copy: {
    paddingTop: 4,
    alignItems: "center",
  },
  eyebrow: {
    color: colors.brand.green,
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 1.7,
    textAlign: "center",
    marginBottom: 12,
  },
  title: {
    color: colors.brand.charcoal,
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1.1,
    textAlign: "center",
  },
  description: {
    maxWidth: 330,
    marginTop: 13,
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  footerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 52,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.background,
  },
  backButtonHidden: {
    opacity: 0,
  },
  backButtonText: {
    color: colors.brand.charcoal,
    fontSize: 29,
    lineHeight: 32,
    marginTop: -3,
  },
  primaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.brand.forest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  primaryButtonText: {
    color: colors.neutral.background,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  primaryButtonArrow: {
    color: colors.neutral.background,
    fontFamily: fontFamily.medium,
    fontSize: 19,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  footerNote: {
    marginTop: 13,
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    textAlign: "center",
  },
});
