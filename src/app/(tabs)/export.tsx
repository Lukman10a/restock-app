import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors, Fonts, Spacing, Layout } from '@/constants/theme';
import { exportReceiptsAsCSV } from '@/services/exportService';

export default function ExportScreen() {
  const [activeDateFilter, setActiveDateFilter] = useState('This Month');
  const [activeStatus, setActiveStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    switch (activeDateFilter) {
      case 'This Week': {
        const start = new Date(now); start.setDate(now.getDate() - now.getDay());
        return { startDate: start.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
      }
      case 'Last 3 Months':
        return { startDate: new Date(year, month - 3, 1).toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
      case 'This Year':
        return { startDate: `${year}-01-01`, endDate: now.toISOString().split('T')[0] };
      case 'All Time':
        return { startDate: '2000-01-01', endDate: now.toISOString().split('T')[0] };
      default: // This Month
        return { startDate: new Date(year, month, 1).toISOString().split('T')[0], endDate: now.toISOString().split('T')[0] };
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const status = activeStatus === 'Manually Edited' ? 'edited' : activeStatus === 'Processed' ? 'processed' : 'all';
      await exportReceiptsAsCSV({ startDate, endDate, status: status as any });
    } catch (err: any) {
      Alert.alert('Export failed', err.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Receipts</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Date Range</Text>
        <View style={styles.datePickersRow}>
          <View style={styles.datePicker}>
            <Text style={styles.dateLabel}>From</Text>
            <Text style={styles.dateValue}>Jun 01, 2026</Text>
          </View>
          <View style={styles.datePicker}>
            <Text style={styles.dateLabel}>To</Text>
            <Text style={styles.dateValue}>Jun 30, 2026</Text>
          </View>
        </View>
        
        <View style={styles.chipsContainer}>
          {['This Week', 'This Month', 'Last 3 Months', 'This Year', 'All Time'].map(item => (
            <TouchableOpacity 
              key={item} 
              style={[styles.chip, activeDateFilter === item && styles.chipActive]}
              onPress={() => setActiveDateFilter(item)}
            >
              <Text style={[styles.chipText, activeDateFilter === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status Filter</Text>
        <View style={styles.chipsContainer}>
          {['All', 'Processed', 'Manually Edited'].map(item => (
            <TouchableOpacity 
              key={item} 
              style={[styles.chip, activeStatus === item && styles.chipActive]}
              onPress={() => setActiveStatus(item)}
            >
              <Text style={[styles.chipText, activeStatus === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.previewContainer}>
        <Text style={styles.previewText}>12 receipts will be exported</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.exportButton, loading && { opacity: 0.7 }]} onPress={handleExport} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.card} />
            : <Text style={styles.exportButtonText}>Export as CSV</Text>
          }
        </TouchableOpacity>
        <Text style={styles.footerSubtext}>Compatible with QuickBooks, Xero, Excel & more</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.double },
  header: { paddingTop: Spacing.double * 2, paddingBottom: Spacing.double },
  title: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textPrimary },
  
  card: { backgroundColor: Colors.card, borderRadius: Layout.borderRadius, padding: Spacing.base, marginBottom: Spacing.double, ...Layout.shadow },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textPrimary, marginBottom: Spacing.base },
  
  datePickersRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.base },
  datePicker: { flex: 1, backgroundColor: Colors.background, padding: Spacing.base, borderRadius: 8, marginRight: Spacing.half, borderWidth: 1, borderColor: Colors.border },
  dateLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  dateValue: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.textPrimary },
  
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: Spacing.base, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, marginRight: Spacing.half, marginBottom: Spacing.half, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.card },
  
  previewContainer: { alignItems: 'center', marginVertical: Spacing.double },
  previewText: { fontFamily: Fonts.medium, fontSize: 16, color: Colors.primary },
  
  footer: { marginTop: Spacing.base },
  exportButton: { backgroundColor: Colors.accent, paddingVertical: Spacing.base * 1.2, borderRadius: Layout.borderRadius, alignItems: 'center', marginBottom: Spacing.base },
  exportButtonText: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.card },
  footerSubtext: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary, textAlign: 'center' }
});
