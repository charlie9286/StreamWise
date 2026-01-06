import React from "react";
import { Text, StyleSheet } from "react-native";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

const iconMap: Record<string, string> = {
  search: "🔍",
  time: "🕐",
  settings: "⚙️",
  star: "⭐",
  calendar: "📅",
  "chevron-forward": "›",
  "arrow-back": "←",
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color }) => {
  const icon = iconMap[name] || "•";
  
  return (
    <Text style={[styles.icon, { fontSize: size, color: color || "#000000" }]}>
      {icon}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: "center",
  },
});
