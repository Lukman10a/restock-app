import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, Layout } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
      </View>

      <LinearGradient
        colors={[Colors.primary, Colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroLabel}>Total Spent This Month</Text>
        <Text style={styles.heroAmount}>$176.60</Text>
        <Text style={styles.heroSubtext}>12 receipts · Jun 2026</Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg/Receipt</Text>
          <Text style={styles.statValue}>$44.15</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Items Tracked</Text>
          <Text style={styles.statValue}>32</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>$67.20</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending Overview</Text>
        <View style={styles.chartContainer}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
            const isCurrent = month === 'Jun';
            const height = isCurrent ? 120 : 40 + Math.random() * 60;
            return (
              <View key={month} style={styles.barColumn}>
                <View style={[
                  styles.bar, 
                  { height, backgroundColor: isCurrent ? Colors.accent : Colors.border }
                ]} />
                <Text style={styles.barLabel}>{month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Vendors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vendorsScroll}>
          {['Amazon', 'Target', 'Starbucks'].map((vendor) => (
            <View key={vendor} style={styles.vendorChip}>
              <View style={styles.vendorIcon}><Text style={styles.vendorIconText}>{vendor.charAt(0)}</Text></View>
              <View>
                <Text style={styles.vendorName}>{vendor}</Text>
                <Text style={styles.vendorSub}>$120.50 · 4 visits</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Receipts</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.receiptItem}>
            <View style={styles.receiptIcon} />
            <View style={styles.receiptDetails}>
              <Text style={styles.receiptVendor}>Whole Foods</Text>
              <Text style={styles.receiptDate}>Jun {item + 10}, 2026</Text>
            </View>
            <View style={styles.receiptRight}>
              <Text style={styles.receiptAmount}>$45.00</Text>
              <View style={styles.badgeSuccess}><Text style={styles.badgeTextSuccess}>Processed</Text></View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.double, paddingTop: Spacing.double * 1.5, marginBottom: Spacing.base },
  greeting: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textPrimary },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.card, fontFamily: Fonts.bold, fontSize: 18 },
  
  heroCard: { marginHorizontal: Spacing.double, padding: Spacing.double, borderRadius: Layout.borderRadius, ...Layout.shadow, marginBottom: Spacing.double },
  heroLabel: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.card, opacity: 0.9, marginBottom: Spacing.half },
  heroAmount: { fontFamily: Fonts.bold, fontSize: 40, color: Colors.card, marginBottom: Spacing.half },
  heroSubtext: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.card, opacity: 0.8 },
  
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.double, justifyContent: 'space-between', marginBottom: Spacing.double * 1.5 },
  statCard: { flex: 1, backgroundColor: Colors.card, padding: Spacing.base, borderRadius: Layout.borderRadius, marginHorizontal: 4, ...Layout.shadow },
  statLabel: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.textSecondary, marginBottom: Spacing.half },
  statValue: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textPrimary },
  
  section: { paddingHorizontal: Spacing.double, marginBottom: Spacing.double * 1.5 },
  lastSection: { marginBottom: Spacing.double * 3 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textPrimary },
  seeAll: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.accent },
  
  chartContainer: { height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: Spacing.base, marginTop: Spacing.base },
  barColumn: { alignItems: 'center', width: 32 },
  bar: { width: 24, borderRadius: 4, marginBottom: Spacing.half },
  barLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textSecondary },
  
  vendorsScroll: { paddingRight: Spacing.double },
  vendorChip: { flexDirection: 'row', backgroundColor: Colors.card, padding: Spacing.base, borderRadius: Layout.borderRadius, marginRight: Spacing.base, alignItems: 'center', ...Layout.shadow, marginTop: Spacing.base },
  vendorIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.base },
  vendorIconText: { fontFamily: Fonts.bold, color: Colors.textPrimary },
  vendorName: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  vendorSub: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  
  receiptItem: { flexDirection: 'row', backgroundColor: Colors.card, padding: Spacing.base, borderRadius: Layout.borderRadius, marginBottom: Spacing.base, alignItems: 'center', ...Layout.shadow },
  receiptIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.border, marginRight: Spacing.base },
  receiptDetails: { flex: 1 },
  receiptVendor: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textPrimary, marginBottom: 2 },
  receiptDate: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
  receiptRight: { alignItems: 'flex-end' },
  receiptAmount: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textPrimary, marginBottom: 4 },
  badgeSuccess: { backgroundColor: Colors.success + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTextSuccess: { fontFamily: Fonts.medium, fontSize: 10, color: Colors.success },
});
