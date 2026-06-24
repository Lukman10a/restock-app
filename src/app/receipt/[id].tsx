import { Colors, Fonts, Layout, Spacing } from "@/constants/theme";
import {
  deleteReceipt,
  getReceiptById,
  Receipt,
  reprocessReceipt,
  updateReceipt,
} from "@/services/receiptService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [editVendor, setEditVendor] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editTotal, setEditTotal] = useState("");

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      const data = await getReceiptById(id);
      setReceipt(data);
      setEditVendor(data.vendorName);
      setEditDate(data.date);
      setEditCurrency(data.currency ?? "USD");
      setEditTotal(String(data.totalAmount));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not load receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!receipt) return;
    setSaving(true);
    try {
      const updated = await updateReceipt(receipt._id, {
        vendorName: editVendor,
        // purchaseDate: editDate,
        currency: editCurrency,
        totalAmount: parseFloat(editTotal),
      });
      setReceipt(updated);
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert("Save failed", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Receipt",
      "Are you sure you want to delete this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReceipt(receipt!._id);
              router.back();
            } catch (e: any) {
              Alert.alert("Delete failed", e.message);
            }
          },
        },
      ],
    );
  };

  const handleReprocess = async () => {
    if (!receipt) return;
    try {
      setLoading(true);
      const updated = await reprocessReceipt(receipt._id);
      setReceipt(updated);
    } catch (e: any) {
      Alert.alert("Reprocess failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            padding: Spacing.double,
          },
        ]}
      >
        <Text
          style={{
            fontFamily: Fonts.bold,
            color: Colors.textPrimary,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          Receipt not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: Spacing.base }}
        >
          <Text style={{ color: Colors.accent, fontFamily: Fonts.medium }}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFailed = receipt.status === "failed";

  if (isFailed) {
    return (
      <View style={[styles.container, styles.failedContainer]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.failedCard}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.failedTitle}>We couldn't read this receipt</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleReprocess}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => {
              setIsEditing(true);
            }}
          >
            <Text style={styles.manualButtonText}>Enter Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (isEditing ? setIsEditing(false) : router.back())}
        >
          <Ionicons
            name={isEditing ? "close" : "arrow-back"}
            size={28}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Receipt" : "Receipt"}
        </Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.iconAction}
            >
              <Ionicons name="pencil" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconAction}>
              <Ionicons name="trash-outline" size={24} color={"#FF3B30"} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <View style={styles.mockImage}>
            <Ionicons
              name="receipt-outline"
              size={40}
              color={Colors.textSecondary}
            />
          </View>
          {!isEditing && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    receipt.status === "processed"
                      ? Colors.success
                      : receipt.status === "pending"
                        ? Colors.warning
                        : Colors.accent,
                },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {receipt.status === "processed"
                  ? "Processed ✓"
                  : receipt.status === "pending"
                    ? "Pending..."
                    : receipt.status === "manually_edited"
                      ? "Edited ✎"
                      : receipt.status}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.editInputLarge}
                value={editVendor}
                onChangeText={setEditVendor}
              />
              <View style={styles.row}>
                <TextInput
                  style={styles.editInputHalf}
                  value={editDate}
                  onChangeText={setEditDate}
                />
                <TextInput
                  style={styles.editInputHalf}
                  value={editCurrency}
                  onChangeText={setEditCurrency}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.vendorText}>{receipt.vendorName}</Text>
              <Text style={styles.dateText}>
                {receipt.date} · {receipt.currency ?? "USD"}
              </Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>
                {receipt.items?.length ?? 0}
              </Text>
            </View>
          </View>

          {receipt.items?.map((item) => (
            <View key={item.id} style={styles.lineItem}>
              {isEditing ? (
                <View style={styles.lineItemEditRow}>
                  <TextInput
                    style={[styles.editInput, { flex: 2, marginRight: 8 }]}
                    defaultValue={item.name}
                  />
                  <TextInput
                    style={[styles.editInput, { flex: 1, marginRight: 8 }]}
                    defaultValue={String(item.qty)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.editInput, { flex: 1 }]}
                    defaultValue={String(item.price)}
                    keyboardType="decimal-pad"
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.itemName}>
                    {item.qty}x {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>${item.price}</Text>
                </>
              )}
            </View>
          ))}
          {(!receipt.items || receipt.items.length === 0) && (
            <Text style={styles.emptyItemsText}>
              No items detected · Tap edit to add manually
            </Text>
          )}
        </View>

        <View style={[styles.section, styles.totalSection]}>
          <Text style={styles.totalLabel}>Total</Text>
          {isEditing ? (
            <TextInput
              style={styles.editTotalInput}
              value={editTotal}
              onChangeText={setEditTotal}
              keyboardType="decimal-pad"
            />
          ) : (
            <Text style={styles.totalAmount}>${receipt.totalAmount}</Text>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: Colors.card,
    ...Layout.shadow,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  headerRight: { flexDirection: "row" },
  iconAction: { marginLeft: Spacing.base },
  saveText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.accent },

  imageContainer: { padding: Spacing.double, alignItems: "center" },
  mockImage: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    ...Layout.shadow,
  },
  statusBadge: {
    position: "absolute",
    top: Spacing.double + Spacing.base,
    right: Spacing.double + Spacing.base,
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: { fontFamily: Fonts.bold, fontSize: 12, color: Colors.card },

  section: { paddingHorizontal: Spacing.double, marginBottom: Spacing.double },
  vendorText: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  itemCountBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: Spacing.half,
  },
  itemCountText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lineItemEditRow: { flexDirection: "row", flex: 1 },
  itemName: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  itemPrice: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptyItemsText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
    paddingVertical: Spacing.base,
  },

  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.base,
    paddingTop: Spacing.base,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  totalAmount: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.primary },

  editInputLarge: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.half,
    marginBottom: Spacing.base,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  editInputHalf: {
    flex: 0.48,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.half,
  },
  editInput: {
    backgroundColor: Colors.card,
    borderRadius: 4,
    padding: 8,
    fontFamily: Fonts.regular,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editTotalInput: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    width: 120,
    textAlign: "right",
  },

  failedContainer: { justifyContent: "center" },
  failedCard: {
    margin: Spacing.double,
    backgroundColor: Colors.card,
    padding: Spacing.double,
    borderRadius: Layout.borderRadius,
    alignItems: "center",
    ...Layout.shadow,
  },
  failedTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: "center",
    marginVertical: Spacing.base,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.double,
    borderRadius: Layout.borderRadius,
    width: "100%",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  retryButtonText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.card },
  manualButton: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.double,
    width: "100%",
    alignItems: "center",
  },
  manualButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.primary,
  },
});
