import { colors, radii, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabPresentation = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  transactions: { label: "Transactions", icon: "swap-horizontal-outline", activeIcon: "swap-horizontal" },
  budgets: { label: "Budgets", icon: "wallet-outline", activeIcon: "wallet" },
  reports: { label: "Reports", icon: "bar-chart-outline", activeIcon: "bar-chart" },
  profile: { label: "Profile", icon: "person-outline", activeIcon: "person" },
} as const;

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

export function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorPosition = useSharedValue(0);
  const tabWidth = state.routes.length > 0 ? (barWidth - spacing[2] * 2) / state.routes.length : 0;

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, { damping: 20, stiffness: 220 });
  }, [indicatorPosition, state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  function measureBar(event: LayoutChangeEvent) {
    setBarWidth(event.nativeEvent.layout.width);
  }

  return (
    <View onLayout={measureBar} style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicatorSlot,
            { width: tabWidth, left: spacing[2] },
            indicatorStyle,
          ]}
        >
          <View style={styles.indicator} />
        </Animated.View>
      ) : null}
      {state.routes.map((route, index) => {
        const presentation = tabPresentation[route.name as keyof typeof tabPresentation];
        if (!presentation) return null;
        const focused = state.index === index;
        const color = focused ? colors.neutral.surface : colors.neutral[500];

        function onPress() {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={presentation.label}
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            style={styles.tab}
          >
            <Ionicons
              name={focused ? presentation.activeIcon : presentation.icon}
              size={20}
              color={color}
            />
            {!focused ? <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={styles.label}>{presentation.label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingHorizontal: spacing[2],
  },
  indicatorSlot: {
    position: "absolute",
    top: 8,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  indicator: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    backgroundColor: colors.primary[600],
  },
  tab: {
    flex: 1,
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1],
    zIndex: 1,
  },
  label: {
    ...typography.small,
    color: colors.neutral[500],
    textAlign: "center",
  },
});