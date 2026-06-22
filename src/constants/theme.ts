import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  primary: '#1A1A2E',
  accent: '#4F8EF7',
  success: '#2ECC71',
  warning: '#F39C12',
  background: '#F8F9FC',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#8892A4',
  border: '#EDF0F7',
} as const;

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
};

export const Spacing = {
  half: 8,
  base: 16,
  double: 32,
} as const;

export const Layout = {
  borderRadius: 12,
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {
      boxShadow: '0px 2px 8px rgba(0,0,0,0.06)',
    },
  }),
};

