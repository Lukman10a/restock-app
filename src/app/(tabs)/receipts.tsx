import { Colors, Fonts, Layout, Spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const FILTERS = ["All", "Processed", "Pending", "Failed", "Edited"];

const MOCK_RECEIPTS = [
  {
    id: "1",
    vendor: "Whole Foods",
    date: "Jun 12, 2026",
    amount: "$45.00",
    status: "Processed",
  },
  {
    id: "2",
    vendor: "Target",
    date: "Jun 10, 2026",
    amount: "$120.50",
    status: "Pending",
  },
  {
    id: "3",
    vendor: "Starbucks",
    date: "Jun 09, 2026",
    amount: "$5.40",
    status: "Failed",
  },
  {
    id: "4",
    vendor: "Amazon",
    date: "Jun 05, 2026",
    amount: "$89.99",
    status: "Edited",
  },
];

export default function ReceiptsScreen() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const renderReceipt = ({ item }: any) => (
    <TouchableOpacity
      style={styles.receiptCard}
      onPress={() => {
        router.push(`/receipt/${item.id}`);
      }}
    >
      <View style={styles.thumbnail} />
      <View style={styles.details}>
        <Text style={styles.vendor}>{item.vendor}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={styles.rightInfo}>
        <Text style={styles.amount}>{item.amount}</Text>
        <View style={[styles.badge, getBadgeStyle(item.status)]}>
          <Text style={[styles.badgeText, getBadgeTextStyle(item.status)]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Processed":
        return { backgroundColor: Colors.success + "20" };
      case "Pending":
        return { backgroundColor: Colors.warning + "20" };
      case "Failed":
        return { backgroundColor: "#FF3B3020" };
      case "Edited":
        return { backgroundColor: Colors.accent + "20" };
      default:
        return { backgroundColor: Colors.border };
    }
  };

  const getBadgeTextStyle = (status: string) => {
    switch (status) {
      case "Processed":
        return { color: Colors.success };
      case "Pending":
        return { color: Colors.warning };
      case "Failed":
        return { color: "#FF3B30" };
      case "Edited":
        return { color: Colors.accent };
      default:
        return { color: Colors.textSecondary };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Receipts</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by vendor or amount..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={MOCK_RECEIPTS}
        keyExtractor={(item) => item.id}
        renderItem={renderReceipt}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={{ fontSize: 40 }}>📥</Text>
            </View>
            <Text style={styles.emptyTitle}>No receipts yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the scan button to add your first receipt
            </Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push("/(tabs)/scan")}
            >
              <Text style={styles.scanButtonText}>Scan a Receipt</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.double,
    paddingTop: Spacing.double * 2,
    paddingBottom: Spacing.base,
  },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textPrimary },
  filterIcon: { padding: Spacing.half },

  searchContainer: {
    paddingHorizontal: Spacing.double,
    paddingBottom: Spacing.base,
  },
  searchInput: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    padding: Spacing.base,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  filterBar: { paddingBottom: Spacing.base },
  filterScroll: { paddingHorizontal: Spacing.double },
  filterChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: Spacing.half,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterTextActive: { color: Colors.card },

  listContainer: {
    paddingHorizontal: Spacing.double,
    paddingBottom: Spacing.double * 3,
    paddingTop: Spacing.base,
  },
  receiptCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    padding: Spacing.base,
    borderRadius: Layout.borderRadius,
    marginBottom: Spacing.base,
    alignItems: "center",
    ...Layout.shadow,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.border,
    marginRight: Spacing.base,
  },
  details: { flex: 1 },
  vendor: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  rightInfo: { alignItems: "flex-end" },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: Fonts.medium, fontSize: 10 },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.double * 4,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
    ...Layout.shadow,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: Spacing.half,
  },
  emptySubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginHorizontal: Spacing.double,
    marginBottom: Spacing.double,
  },
  scanButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.double,
    paddingVertical: Spacing.base,
    borderRadius: Layout.borderRadius,
  },
  scanButtonText: { fontFamily: Fonts.bold, color: Colors.card, fontSize: 16 },
});
