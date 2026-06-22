import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Colors, Fonts, Spacing, Layout } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleDeleteReceipts = () => {
    Alert.alert(
      "Delete All Receipts",
      "Are you sure you want to delete all receipts? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive" }
      ]
    );
  };

  const SettingRow = ({ title, destructive, onPress }: { title: string, destructive?: boolean, onPress?: () => void }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <Text style={[styles.settingText, destructive && styles.destructiveText]}>{title}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Account</Text>
        <View style={styles.card}>
          <SettingRow title="Edit Profile" />
          <View style={styles.divider} />
          <SettingRow title="Change Password" />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>Data</Text>
        <View style={styles.card}>
          <SettingRow title="Export My Data" onPress={() => router.push('/(tabs)/export')} />
          <View style={styles.divider} />
          <SettingRow title="Delete All Receipts" destructive onPress={handleDeleteReceipts} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupTitle}>App</Text>
        <View style={styles.card}>
          <SettingRow title="About Restock" />
          <View style={styles.divider} />
          <SettingRow title="Privacy Policy" />
          <View style={styles.divider} />
          <SettingRow title="Terms of Service" />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Restock v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingVertical: Spacing.double * 2 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.base },
  avatarTextLarge: { color: Colors.card, fontFamily: Fonts.bold, fontSize: 32 },
  userName: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textPrimary, marginBottom: Spacing.half / 2 },
  userEmail: { fontFamily: Fonts.regular, fontSize: 16, color: Colors.textSecondary },
  
  group: { paddingHorizontal: Spacing.double, marginBottom: Spacing.double },
  groupTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.base, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: Colors.card, borderRadius: Layout.borderRadius, ...Layout.shadow },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.base * 1.2 },
  settingText: { fontFamily: Fonts.medium, fontSize: 16, color: Colors.textPrimary },
  destructiveText: { color: '#FF3B30' },
  chevron: { fontFamily: Fonts.regular, fontSize: 20, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: Spacing.base },
  
  footer: { paddingHorizontal: Spacing.double, paddingBottom: Spacing.double * 3, paddingTop: Spacing.base, alignItems: 'center' },
  logoutButton: { width: '100%', paddingVertical: Spacing.base, borderRadius: Layout.borderRadius, borderWidth: 1, borderColor: '#FF3B30', alignItems: 'center', marginBottom: Spacing.double },
  logoutText: { fontFamily: Fonts.bold, fontSize: 16, color: '#FF3B30' },
  versionText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textSecondary },
});
